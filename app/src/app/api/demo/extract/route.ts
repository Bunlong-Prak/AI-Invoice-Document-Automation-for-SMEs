import { NextRequest, NextResponse } from "next/server";
import { saveFile, deleteFile } from "@/lib/storage";
import { extractTextFromFile } from "@/lib/ocr";
import { extractInvoiceData, extractInvoiceDataFromImage } from "@/lib/ai-extract";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB for demo
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/tiff",
  "image/bmp",
  "application/pdf",
];

const IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/tiff",
  "image/bmp",
];

// In-memory rate limiter: IP -> { count, resetAt }
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }

  if (entry.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT - entry.count };
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const { allowed, remaining } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Demo rate limit reached. Sign up for unlimited access." },
      {
        status: 429,
        headers: { "X-RateLimit-Remaining": "0" },
      }
    );
  }

  let filePath: string | null = null;
  let filename: string | null = null;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}. Supported: PDF, JPG, PNG, TIFF, BMP` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large (max 5MB for demo)" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const saved = await saveFile(buffer, file.name, file.type);
    filePath = saved.filePath;
    filename = saved.filename;

    let invoiceData;

    if (IMAGE_TYPES.includes(file.type)) {
      // Vision-based extraction for images
      invoiceData = await extractInvoiceDataFromImage(filePath, file.type);
    } else {
      // OCR-based extraction for PDFs
      const rawText = await extractTextFromFile(filePath, file.type);

      if (!rawText || rawText.trim().length === 0) {
        return NextResponse.json(
          { error: "Could not extract text from document. Try a clearer image or a different file." },
          { status: 422 }
        );
      }

      invoiceData = await extractInvoiceData(rawText);
    }

    return NextResponse.json(
      {
        success: true,
        data: invoiceData,
        demo: true,
        rate_limit: {
          remaining,
          limit: RATE_LIMIT,
          window: "1 hour",
        },
      },
      { headers: { "X-RateLimit-Remaining": String(remaining) } }
    );
  } catch (error) {
    console.error("Demo extraction error:", error);
    return NextResponse.json(
      {
        error: "Extraction failed",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  } finally {
    // Always clean up temp file
    if (filename) {
      await deleteFile(filename).catch(() => {});
    }
  }
}
