import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { documents, extractedInvoices, lineItems, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { extractTextFromFile } from "@/lib/ocr";
import { extractInvoiceData, extractInvoiceDataFromImage } from "@/lib/ai-extract";
import { checkUsageLimit, logUsage } from "@/lib/usage";
import { parseNumeric } from "@/lib/utils";

const IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/tiff",
  "image/bmp",
];

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
    // Get user info for usage and subscription
    const [user] = await db
      .select({
        subscriptionTier: users.subscriptionTier,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    const usage = await checkUsageLimit(session.user.id, user?.subscriptionTier || "free");

    if (usage.hasReachedLimit) {
      return NextResponse.json(
        { error: "Usage limit reached", usage },
        { status: 403 }
      );
    }

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
      .set({ status: "processing", errorMessage: null })
      .where(eq(documents.id, documentId));

    try {
      let invoiceData;
      let rawText = "";

      if (IMAGE_TYPES.includes(document.mimeType)) {
        // Step 1 & 2 combined: Vision-based extraction
        invoiceData = await extractInvoiceDataFromImage(document.filePath, document.mimeType);
        rawText = "[Vision-based extraction - image file]";
      } else {
        // Step 1: OCR - Extract text
        rawText = await extractTextFromFile(
          document.filePath,
          document.mimeType
        );

        if (!rawText || rawText.trim().length === 0) {
          throw new Error("OCR produced no readable text");
        }

        // Step 2: AI - Extract structured data
        invoiceData = await extractInvoiceData(rawText);
      }

      // If reprocessing, remove previous extracted invoice and cascading line items
      await db
        .delete(extractedInvoices)
        .where(eq(extractedInvoices.documentId, documentId));

      // Step 3: Store results
      const [invoice] = await db
        .insert(extractedInvoices)
        .values({
          documentId,
          vendorName: invoiceData.vendor_name || null,
          invoiceNumber: invoiceData.invoice_number || null,
          date: invoiceData.date || null,
          currency: invoiceData.currency || "USD",
          totalAmount: parseNumeric(invoiceData.total_amount),
          taxAmount: parseNumeric(invoiceData.tax_amount),
          rawText,
          rawJson: JSON.stringify(invoiceData),
        })
        .returning();

      // Insert line items
      if (invoiceData.line_items && invoiceData.line_items.length > 0) {
        await db.insert(lineItems).values(
          invoiceData.line_items.map((item, index) => ({
            invoiceId: invoice.id,
            description: item.description || null,
            quantity: item.quantity || null,
            unitPrice: parseNumeric(item.unit_price),
            total: parseNumeric(item.total),
            sortOrder: index,
          }))
        );
      }

      // Update document status
      await db
        .update(documents)
        .set({ status: "processed", errorMessage: null })
        .where(eq(documents.id, documentId));

      // Log usage
      await logUsage(session.user.id, null, "/api/process", 200);

      return NextResponse.json({
        success: true,
        invoiceId: invoice.id,
      });
    } catch (processingError) {
      // Mark document as error
      console.error("Processing error:", processingError);
      const errorMessage =
        processingError instanceof Error
          ? processingError.message
          : "Processing failed";

      await db
        .update(documents)
        .set({
          status: "error",
          errorMessage,
        })
        .where(eq(documents.id, documentId));

      return NextResponse.json(
        {
          error: "Processing failed",
          message: errorMessage,
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
