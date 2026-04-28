import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-keys";
import { db } from "@/lib/db";
import { users, documents, extractedInvoices, lineItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { saveFile } from "@/lib/storage";
import { extractTextFromFile } from "@/lib/ocr";
import { extractInvoiceData } from "@/lib/ai-extract";
import { checkUsageLimit, logUsage } from "@/lib/usage";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/tiff",
  "image/bmp",
  "application/pdf",
];

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized: Missing API Key" }, { status: 401 });
  }

  const apiKeyString = authHeader.split(" ")[1];
  const apiKey = await validateApiKey(apiKeyString);

  if (!apiKey) {
    return NextResponse.json({ error: "Unauthorized: Invalid API Key" }, { status: 401 });
  }

  // Get user to check subscription tier
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, apiKey.userId))
    .limit(1);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Check usage limits
  const usage = await checkUsageLimit(user.id, user.subscriptionTier);
  if (usage.hasReachedLimit) {
    await logUsage(user.id, apiKey.id, "/api/v1/extract", 429);
    return NextResponse.json({ 
      error: "Usage limit reached", 
      details: `Your current plan (${user.subscriptionTier}) allows for ${usage.limit} requests per month.`
    }, { status: 429 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: `Unsupported file type: ${file.type}` }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    // Save file
    const buffer = Buffer.from(await file.arrayBuffer());
    const { filename, filePath } = await saveFile(
      buffer,
      file.name,
      file.type
    );

    // Create document record
    const [doc] = await db
      .insert(documents)
      .values({
        userId: user.id,
        filename,
        originalName: file.name,
        mimeType: file.type,
        fileSize: file.size,
        filePath,
        status: "processing",
      })
      .returning();

    try {
      // Step 1: OCR - Extract text
      const rawText = await extractTextFromFile(
        filePath,
        file.type
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
          documentId: doc.id,
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
        .where(eq(documents.id, doc.id));

      // Log successful usage
      await logUsage(user.id, apiKey.id, "/api/v1/extract", 200);

      return NextResponse.json({
        success: true,
        data: {
          vendor_name: invoiceData.vendor_name,
          invoice_number: invoiceData.invoice_number,
          date: invoiceData.date,
          currency: invoiceData.currency,
          total_amount: invoiceData.total_amount,
          tax_amount: invoiceData.tax_amount,
          line_items: invoiceData.line_items,
        },
        usage: {
          used: usage.used + 1,
          limit: usage.limit,
          remaining: usage.remaining - 1
        }
      });
    } catch (processingError) {
      console.error("Processing error:", processingError);
      await db
        .update(documents)
        .set({
          status: "error",
          errorMessage: processingError instanceof Error ? processingError.message : "Processing failed",
        })
        .where(eq(documents.id, doc.id));

      await logUsage(user.id, apiKey.id, "/api/v1/extract", 500);

      return NextResponse.json({
        error: "Processing failed",
        message: processingError instanceof Error ? processingError.message : "Unknown error",
      }, { status: 500 });
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
