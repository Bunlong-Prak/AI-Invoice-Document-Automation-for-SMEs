import fs from "fs";
import path from "path";

export async function extractTextFromImage(filePath: string): Promise<string> {
  const serviceUrl = process.env.DOCLING_SERVICE_URL || "http://localhost:8000";
  
  try {
    // Use native Node.js FormData and Blob instead of the npm package
    const fileBuffer = fs.readFileSync(filePath);
    const blob = new Blob([fileBuffer]);
    
    const formData = new FormData();
    formData.append("file", blob, path.basename(filePath));

    const response = await fetch(`${serviceUrl}/extract`, {
      method: "POST",
      body: formData,
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
