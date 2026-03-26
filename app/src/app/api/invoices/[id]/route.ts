import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { extractedInvoices, lineItems, documents } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

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
    // Verify ownership
    const invoice = await db
      .select({
        invoiceId: extractedInvoices.id,
        documentId: extractedInvoices.documentId,
      })
      .from(extractedInvoices)
      .innerJoin(documents, eq(extractedInvoices.documentId, documents.id))
      .where(
        and(
          eq(extractedInvoices.id, id),
          eq(documents.userId, session.user.id)
        )
      )
      .limit(1);

    if (invoice.length === 0) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

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
        totalAmount: totalAmount ?? null,
        taxAmount: taxAmount ?? null,
        updatedAt: new Date(),
      })
      .where(eq(extractedInvoices.id, id));

    // Update line items if provided
    if (items && Array.isArray(items)) {
      // Delete existing line items
      await db.delete(lineItems).where(eq(lineItems.invoiceId, id));

      // Insert new line items
      if (items.length > 0) {
        await db.insert(lineItems).values(
          items.map((item: {
            description?: string;
            quantity?: string;
            unitPrice?: string;
            total?: string;
          }, index: number) => ({
            invoiceId: id,
            description: item.description || null,
            quantity: item.quantity || null,
            unitPrice: item.unitPrice || null,
            total: item.total || null,
            sortOrder: index,
          }))
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating invoice:", error);
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}
