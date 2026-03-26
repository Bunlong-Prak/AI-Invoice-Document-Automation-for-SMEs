import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { documents, extractedInvoices, lineItems } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { documentIds } = body;

  try {
    // Build query conditions
    const conditions = [eq(documents.userId, session.user.id)];
    if (documentIds && documentIds.length > 0) {
      conditions.push(inArray(documents.id, documentIds));
    }

    // Get invoices with line items
    const invoices = await db
      .select({
        documentId: documents.id,
        originalName: documents.originalName,
        vendorName: extractedInvoices.vendorName,
        invoiceNumber: extractedInvoices.invoiceNumber,
        invoiceDate: extractedInvoices.date,
        currency: extractedInvoices.currency,
        totalAmount: extractedInvoices.totalAmount,
        taxAmount: extractedInvoices.taxAmount,
        invoiceId: extractedInvoices.id,
      })
      .from(documents)
      .innerJoin(extractedInvoices, eq(documents.id, extractedInvoices.documentId))
      .where(and(...conditions));

    // Get all line items for these invoices
    const invoiceIds = invoices
      .map((i) => i.invoiceId)
      .filter((id): id is string => id !== null);

    let allLineItems: (typeof lineItems.$inferSelect)[] = [];
    if (invoiceIds.length > 0) {
      allLineItems = await db
        .select()
        .from(lineItems)
        .where(inArray(lineItems.invoiceId, invoiceIds))
        .orderBy(lineItems.sortOrder);
    }

    // Build CSV
    const rows: string[] = [];

    // Header
    rows.push(
      [
        "File Name",
        "Vendor Name",
        "Invoice Number",
        "Date",
        "Currency",
        "Total Amount",
        "Tax Amount",
        "Line Item Description",
        "Line Item Quantity",
        "Line Item Unit Price",
        "Line Item Total",
      ].join(",")
    );

    for (const invoice of invoices) {
      const items = allLineItems.filter(
        (li) => li.invoiceId === invoice.invoiceId
      );

      if (items.length === 0) {
        // Invoice with no line items
        rows.push(
          [
            csvEscape(invoice.originalName),
            csvEscape(invoice.vendorName),
            csvEscape(invoice.invoiceNumber),
            csvEscape(invoice.invoiceDate),
            csvEscape(invoice.currency),
            csvEscape(invoice.totalAmount),
            csvEscape(invoice.taxAmount),
            "",
            "",
            "",
            "",
          ].join(",")
        );
      } else {
        // One row per line item
        for (const item of items) {
          rows.push(
            [
              csvEscape(invoice.originalName),
              csvEscape(invoice.vendorName),
              csvEscape(invoice.invoiceNumber),
              csvEscape(invoice.invoiceDate),
              csvEscape(invoice.currency),
              csvEscape(invoice.totalAmount),
              csvEscape(invoice.taxAmount),
              csvEscape(item.description),
              csvEscape(item.quantity),
              csvEscape(item.unitPrice),
              csvEscape(item.total),
            ].join(",")
          );
        }
      }
    }

    const csv = rows.join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="invoices-export-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export" },
      { status: 500 }
    );
  }
}

function csvEscape(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
