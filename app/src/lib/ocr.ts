import Tesseract from "tesseract.js";

export async function extractTextFromImage(filePath: string): Promise<string> {
  try {
    const result = await Tesseract.recognize(filePath, "eng", {
      logger: () => {},
    });
    return result.data.text;
  } catch (error) {
    console.error("OCR extraction failed:", error);
    throw new Error(`OCR failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function extractTextFromFile(
  filePath: string,
  mimeType: string
): Promise<string> {
  // For PDF, JPG, PNG — Tesseract handles images natively
  // For PDFs, we'd need pdf-to-image conversion (MVP: PDFs treated as images if possible)
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
