import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { documents, extractedInvoices, lineItems } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

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
    const doc = await db
      .select()
      .from(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, session.user.id)))
      .limit(1);

    if (doc.length === 0) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const invoice = await db
      .select()
      .from(extractedInvoices)
      .where(eq(extractedInvoices.documentId, id))
      .limit(1);

    let items: typeof lineItems.$inferSelect[] = [];
    if (invoice[0]) {
      items = await db
        .select()
        .from(lineItems)
        .where(eq(lineItems.invoiceId, invoice[0].id))
        .orderBy(lineItems.sortOrder);
    }

    return NextResponse.json({
      document: doc[0],
      invoice: invoice[0] || null,
      lineItems: items,
    });
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await db
      .delete(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, session.user.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
