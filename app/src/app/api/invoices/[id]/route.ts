import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { extractedInvoices, lineItems, documents } from "@/lib/db/schema";
import { eq, and, or } from "drizzle-orm";
import { parseNumeric } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const records = await db
      .select({
        invoice: extractedInvoices,
        document: documents,
      })
      .from(extractedInvoices)
      .innerJoin(documents, eq(extractedInvoices.documentId, documents.id))
      .where(
        and(
          or(eq(extractedInvoices.id, id), eq(extractedInvoices.documentId, id)),
          eq(documents.userId, session.user.id)
        )
      )
      .limit(1);

    if (records.length === 0) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const { invoice, document } = records[0];

    const items = await db
      .select()
      .from(lineItems)
      .where(eq(lineItems.invoiceId, invoice.id))
      .orderBy(lineItems.sortOrder);

    return NextResponse.json({
      invoice,
      document,
      lineItems: items,
    });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  try {
    // Verify ownership (match either extractedInvoices.id or documentId)
    const invoiceRecords = await db
      .select({
        invoiceId: extractedInvoices.id,
        documentId: extractedInvoices.documentId,
      })
      .from(extractedInvoices)
      .innerJoin(documents, eq(extractedInvoices.documentId, documents.id))
      .where(
        and(
          or(eq(extractedInvoices.id, id), eq(extractedInvoices.documentId, id)),
          eq(documents.userId, session.user.id)
        )
      )
      .limit(1);

    if (invoiceRecords.length === 0) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const targetInvoiceId = invoiceRecords[0].invoiceId;

    // Update invoice fields
    const {
      vendorName,
      invoiceNumber,
      date,
      currency,
      totalAmount,
      taxAmount,
      items,
    } = body;

    await db
      .update(extractedInvoices)
      .set({
        vendorName: vendorName ?? null,
        invoiceNumber: invoiceNumber ?? null,
        date: date ?? null,
        currency: currency ?? null,
        totalAmount: parseNumeric(totalAmount),
        taxAmount: parseNumeric(taxAmount),
        updatedAt: new Date(),
      })
      .where(eq(extractedInvoices.id, targetInvoiceId));

    // Update line items if provided
    if (items && Array.isArray(items)) {
      // Delete existing line items
      await db.delete(lineItems).where(eq(lineItems.invoiceId, targetInvoiceId));

      // Insert new line items
      if (items.length > 0) {
        await db.insert(lineItems).values(
          items.map((item: {
            description?: string;
            quantity?: string;
            unitPrice?: string;
            total?: string;
          }, index: number) => ({
            invoiceId: targetInvoiceId,
            description: item.description || null,
            quantity: item.quantity || null,
            unitPrice: parseNumeric(item.unitPrice),
            total: parseNumeric(item.total),
            sortOrder: index,
          }))
        );
      }
    }

    return NextResponse.json({ success: true, invoiceId: targetInvoiceId });
  } catch (error) {
    console.error("Error updating invoice:", error);
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}
