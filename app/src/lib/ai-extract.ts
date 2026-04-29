import OpenAI from "openai";
import { z } from "zod";
import fs from "fs";
import type { ExtractedInvoiceData } from "@/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const LineItemSchema = z.object({
  description: z.string().default(""),
  quantity: z.string().default(""),
  unit_price: z.string().default(""),
  total: z.string().default(""),
});

const InvoiceSchema = z.object({
  vendor_name: z.string().default(""),
  invoice_number: z.string().default(""),
  date: z.string().default(""),
  currency: z.string().default("USD"),
  total_amount: z.string().default(""),
  tax_amount: z.string().default(""),
  line_items: z.array(LineItemSchema).default([]),
});

const EXTRACTION_SCHEMA_DESCRIPTION = `{
  "vendor_name": "Company/seller name",
  "invoice_number": "Invoice #, receipt #, transaction ID, or any unique document identifier",
  "date": "Document date in YYYY-MM-DD format",
  "currency": "3-letter currency code (USD, EUR, KHR, etc.)",
  "total_amount": "Grand total as positive number string (no symbols)",
  "tax_amount": "Tax/VAT amount as number string, or empty string",
  "line_items": [
    {
      "description": "Product or service description",
      "quantity": "Quantity as string, or empty string",
      "unit_price": "Unit price as number string, or empty string",
      "total": "Line total as number string"
    }
  ]
}`;

const VISION_PROMPT = `You are an expert financial document extraction system. Extract ALL data from this invoice/receipt image.

RULES:
- Extract every field you can see, even if text is partially in another language
- Amounts: positive numbers only, use "." as decimal separator, no currency symbols
- Dates: convert to YYYY-MM-DD format
- Currency: 3-letter ISO code (USD, EUR, KHR, GBP, etc.)
- invoice_number: use ANY unique identifier you see (invoice #, receipt #, order #, transaction ID)
- If a field is not visible, use empty string ""
- Extract ALL line items from the table
- Respond ONLY with valid JSON, no markdown, no explanation

Output this exact JSON structure:
${EXTRACTION_SCHEMA_DESCRIPTION}`;

const TEXT_EXTRACTION_PROMPT = `You are an expert financial document data extraction system. Extract structured data from this OCR text of a financial document.

RULES:
1. Extract ALL available information regardless of document type
2. If a field is not found, use empty string ""
3. Amounts: positive numbers only, "." as decimal separator, no currency symbols
4. Dates: YYYY-MM-DD format
5. Currency: 3-letter ISO code
6. Extract ALL line items
7. Respond ONLY with valid JSON, no markdown, no explanation

Output this exact JSON structure:
${EXTRACTION_SCHEMA_DESCRIPTION}

OCR TEXT:
`;

function emptyResult(): ExtractedInvoiceData {
  return {
    vendor_name: "",
    invoice_number: "",
    date: "",
    currency: "USD",
    total_amount: "",
    tax_amount: "",
    line_items: [],
  };
}

/**
 * Vision-based extraction for image files (JPG, PNG, TIFF, BMP).
 * Sends image directly to Llama 4 Scout on Groq — no OCR step needed.
 */
export async function extractInvoiceDataFromImage(
  filePath: string,
  mimeType: string
): Promise<ExtractedInvoiceData> {
  try {
    const imageBuffer = fs.readFileSync(filePath);
    const base64 = imageBuffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const response = await openai.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "system",
          content:
            "You are a precise financial document extraction system. Respond ONLY with valid JSON. No markdown, no code blocks, no explanation.",
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: dataUrl },
            },
            {
              type: "text",
              text: VISION_PROMPT,
            },
          ] as never,
        },
      ],
      temperature: 0,
      max_tokens: 3000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response from vision model");

    // Strip markdown code fences if model wraps output anyway
    const cleaned = content.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
    const parsed = JSON.parse(cleaned);
    return InvoiceSchema.parse(parsed);
  } catch (error) {
    console.error("Vision extraction failed:", error);
    if (error instanceof z.ZodError) {
      console.error("Validation errors:", error.issues);
    }
    return emptyResult();
  }
}

/**
 * Text-based extraction for PDFs (after Docling OCR).
 */
export async function extractInvoiceData(
  ocrText: string
): Promise<ExtractedInvoiceData> {
  try {
    const response = await openai.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [
        {
          role: "system",
          content:
            "You are a precise data extraction system. Respond ONLY with valid JSON. No markdown formatting, no code blocks, no explanations.",
        },
        {
          role: "user",
          content: TEXT_EXTRACTION_PROMPT + ocrText,
        },
      ],
      temperature: 0,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response from AI");

    const parsed = JSON.parse(content);
    return InvoiceSchema.parse(parsed);
  } catch (error) {
    console.error("AI extraction failed:", error);
    if (error instanceof z.ZodError) {
      console.error("Validation errors:", error.issues);
    }
    return emptyResult();
  }
}
