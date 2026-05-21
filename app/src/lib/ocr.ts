import fs from "fs";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse") as (buffer: Buffer) => Promise<{ text: string }>;

/**
 * Extract text from a digital (selectable-text) PDF using pdf-parse.
 * Returns empty string for scanned/image-only PDFs.
 */
export async function extractTextFromPdf(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  const result = await pdfParse(buffer);
  return result.text || "";
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
