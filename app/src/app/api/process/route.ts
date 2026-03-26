import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { documents, extractedInvoices, lineItems } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { extractTextFromFile } from "@/lib/ocr";
import { extractInvoiceData } from "@/lib/ai-extract";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { documentId } = body;

  if (!documentId) {
    return NextResponse.json(
      { error: "Document ID required" },
      { status: 400 }
    );
  }

  try {
    // Verify document ownership and get details
    const doc = await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.id, documentId),
          eq(documents.userId, session.user.id)
        )
      )
      .limit(1);

    if (doc.length === 0) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    const document = doc[0];

    // Update status to processing
    await db
      .update(documents)
      .set({ status: "processing" })
      .where(eq(documents.id, documentId));

    try {
      // Step 1: OCR - Extract text
      const rawText = await extractTextFromFile(
        document.filePath,
        document.mimeType
      );

      if (!rawText || rawText.trim().length === 0) {
        throw new Error("OCR produced no readable text");
      }

      // Step 2: AI - Extract structured data
      const invoiceData = await extractInvoiceData(rawText);

      // Step 3: Store results
      const [invoice] = await db
        .insert(extractedInvoices)
        .values({
          documentId,
          vendorName: invoiceData.vendor_name || null,
          invoiceNumber: invoiceData.invoice_number || null,
          date: invoiceData.date || null,
          currency: invoiceData.currency || "USD",
          totalAmount: invoiceData.total_amount || null,
          taxAmount: invoiceData.tax_amount || null,
          rawText,
          rawJson: JSON.stringify(invoiceData),
        })
        .returning();

      // Insert line items
      if (invoiceData.line_items.length > 0) {
        await db.insert(lineItems).values(
          invoiceData.line_items.map((item, index) => ({
            invoiceId: invoice.id,
            description: item.description || null,
            quantity: item.quantity || null,
            unitPrice: item.unit_price || null,
            total: item.total || null,
            sortOrder: index,
          }))
        );
      }

      // Update document status
      await db
        .update(documents)
        .set({ status: "processed" })
        .where(eq(documents.id, documentId));

      return NextResponse.json({
        success: true,
        invoiceId: invoice.id,
      });
    } catch (processingError) {
      // Mark document as error
      console.error("Processing error:", processingError);
      await db
        .update(documents)
        .set({
          status: "error",
          errorMessage:
            processingError instanceof Error
              ? processingError.message
              : "Processing failed",
        })
        .where(eq(documents.id, documentId));

      return NextResponse.json(
        {
          error: "Processing failed",
          message:
            processingError instanceof Error
              ? processingError.message
              : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Process error:", error);
    return NextResponse.json(
      { error: "Failed to process document" },
      { status: 500 }
    );
  }
}
