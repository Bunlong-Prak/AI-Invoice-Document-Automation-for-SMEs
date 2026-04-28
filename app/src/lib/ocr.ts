import fs from "fs";
import FormData from "form-data";
import path from "path";

export async function extractTextFromImage(filePath: string): Promise<string> {
  const serviceUrl = process.env.DOCLING_SERVICE_URL || "http://localhost:8000";
  
  try {
    const formData = new FormData();
    const fileStream = fs.createReadStream(filePath);
    formData.append("file", fileStream, path.basename(filePath));

    const response = await fetch(`${serviceUrl}/extract`, {
      method: "POST",
      body: formData as any, // Form-data type casting for fetch
      headers: {
        // Form-data generates its own boundary headers
        // ...formData.getHeaders(), // Node.js fetch doesn't need this typically if it's the native node-fetch/undici
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Docling API error (${response.status}): ${errorData}`);
    }

    const data = await response.json();
    return data.text; // Returns the markdown representation from Docling
  } catch (error) {
    console.error("Docling extraction failed:", error);
    throw new Error(`OCR failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function extractTextFromFile(
  filePath: string,
  mimeType: string
): Promise<string> {
  // Docling handles both PDFs and images perfectly
  const supportedTypes = [
    "image/jpeg",
    "image/png",
    "image/tiff",
    "image/bmp",
    "application/pdf",
  ];

  if (!supportedTypes.includes(mimeType)) {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }

  return extractTextFromImage(filePath);
}
