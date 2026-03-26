import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { saveFile } from "@/lib/storage";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/tiff",
  "image/bmp",
  "application/pdf",
];

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const results = [];

    for (const file of files) {
      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        results.push({
          originalName: file.name,
          error: `Unsupported file type: ${file.type}`,
        });
        continue;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        results.push({
          originalName: file.name,
          error: "File too large (max 10MB)",
        });
        continue;
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
          userId: session.user.id,
          filename,
          originalName: file.name,
          mimeType: file.type,
          fileSize: file.size,
          filePath,
          status: "uploaded",
        })
        .returning();

      results.push({
        id: doc.id,
        originalName: file.name,
        filename: doc.filename,
        status: "uploaded",
      });
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
