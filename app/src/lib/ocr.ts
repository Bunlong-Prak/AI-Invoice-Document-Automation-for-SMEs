import fs from "fs";

/**
 * Extract text from a digital (selectable-text) PDF using pdf-parse.
 * Handles both pdf-parse v2 (class-based) and v1 (function-based).
 */
export async function extractTextFromPdf(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfModule = require("pdf-parse");

  // pdf-parse v2 exports a PDFParse class
  if (pdfModule.PDFParse) {
    const parser = new pdfModule.PDFParse({ data: buffer });
    const result = await parser.getText();
    return result.text || "";
  }

  // pdf-parse v1 exported a default function
  if (typeof pdfModule === "function") {
    const result = await pdfModule(buffer);
    return result.text || "";
  }

  if (typeof pdfModule.default === "function") {
    const result = await pdfModule.default(buffer);
    return result.text || "";
  }

  throw new Error("Unable to initialize PDF parser");
}

export async function extractTextFromFile(
  filePath: string,
  mimeType: string
): Promise<string> {
  if (mimeType !== "application/pdf") {
    throw new Error(`extractTextFromFile only handles PDFs. Got: ${mimeType}`);
  }

  const text = await extractTextFromPdf(filePath);

  if (!text || text.trim().length < 20) {
    throw new Error(
      "This PDF appears to be a scanned document with no selectable text. " +
        "Please export a page as JPG or PNG and upload that instead."
    );
  }

  return text;
}
