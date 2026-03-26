import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { documents, extractedInvoices, lineItems, users } from "@/lib/db/schema";
import { eq, and, desc, ilike, gte, lte, sql, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = (page - 1) * limit;

  try {
    // Build conditions
    const conditions = [eq(documents.userId, session.user.id)];
    
    if (status) {
      conditions.push(eq(documents.status, status as "uploaded" | "processing" | "processed" | "error"));
    }

    // Get documents with their invoices
    const docs = await db
      .select({
        id: documents.id,
        filename: documents.filename,
        originalName: documents.originalName,
        mimeType: documents.mimeType,
        fileSize: documents.fileSize,
        status: documents.status,
        errorMessage: documents.errorMessage,
        uploadedAt: documents.uploadedAt,
        vendorName: extractedInvoices.vendorName,
        invoiceNumber: extractedInvoices.invoiceNumber,
        invoiceDate: extractedInvoices.date,
        currency: extractedInvoices.currency,
        totalAmount: extractedInvoices.totalAmount,
        taxAmount: extractedInvoices.taxAmount,
      })
      .from(documents)
      .leftJoin(extractedInvoices, eq(documents.id, extractedInvoices.documentId))
      .where(and(...conditions))
      .orderBy(desc(documents.uploadedAt))
      .limit(limit)
      .offset(offset);

    // Filter by search (vendor name, invoice number) in application layer
    let filteredDocs = docs;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredDocs = docs.filter(
        (d) =>
          d.vendorName?.toLowerCase().includes(searchLower) ||
          d.invoiceNumber?.toLowerCase().includes(searchLower) ||
          d.originalName.toLowerCase().includes(searchLower)
      );
    }

    if (dateFrom) {
      filteredDocs = filteredDocs.filter(
        (d) => d.invoiceDate && d.invoiceDate >= dateFrom
      );
    }

    if (dateTo) {
      filteredDocs = filteredDocs.filter(
        (d) => d.invoiceDate && d.invoiceDate <= dateTo
      );
    }

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(documents)
      .where(eq(documents.userId, session.user.id));

    const total = totalResult[0]?.count || 0;

    // Stats
    const statsResult = await db
      .select({
        status: documents.status,
        count: count(),
      })
      .from(documents)
      .where(eq(documents.userId, session.user.id))
      .groupBy(documents.status);

    const totalAmountResult = await db
      .select({
        sum: sql<string>`COALESCE(SUM(CAST(${extractedInvoices.totalAmount} AS DECIMAL)), 0)`,
      })
      .from(extractedInvoices)
      .innerJoin(documents, eq(extractedInvoices.documentId, documents.id))
      .where(eq(documents.userId, session.user.id));

    const stats = {
      totalDocuments: total,
      processedCount: statsResult.find((s) => s.status === "processed")?.count || 0,
      errorCount: statsResult.find((s) => s.status === "error")?.count || 0,
      totalAmount: parseFloat(totalAmountResult[0]?.sum || "0"),
    };

    return NextResponse.json({
      documents: filteredDocs,
      total,
      page,
      limit,
      stats,
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}
