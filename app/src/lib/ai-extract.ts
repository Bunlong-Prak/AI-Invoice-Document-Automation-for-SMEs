import OpenAI from "openai";
import { z } from "zod";
import fs from "fs";
import type { ExtractedInvoiceData } from "@/types";

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

export function getClientConfig() {
  const groqKey = process.env.GROQ_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;
  const explicitBaseUrl = process.env.AI_BASE_URL || process.env.OPENAI_BASE_URL;

  // Determine provider: Groq or OpenAI
  const isGroq = Boolean(
    groqKey ||
    (openAiKey && openAiKey.startsWith("gsk_")) ||
    explicitBaseUrl?.includes("groq.com")
  );

  const apiKey = groqKey || openAiKey || "";
  const baseURL = explicitBaseUrl || (isGroq ? "https://api.groq.com/openai/v1" : undefined);

  // Modern defaults:
  // - Groq: llama-3.2-11b-vision-preview (vision), llama-3.3-70b-versatile (text)
  // - OpenAI: gpt-4o-mini
  const visionModel =
    process.env.VISION_MODEL ||
    process.env.GROQ_VISION_MODEL ||
    (isGroq ? "llama-3.2-11b-vision-preview" : "gpt-4o-mini");

  const textModel =
    process.env.TEXT_MODEL ||
    process.env.GROQ_TEXT_MODEL ||
    (isGroq ? "llama-3.3-70b-versatile" : "gpt-4o-mini");

  return { apiKey, baseURL, visionModel, textModel, isGroq };
}

function getAiClient() {
  const { apiKey, baseURL } = getClientConfig();
  if (!apiKey) {
    throw new Error(
      "No AI API key found. Please set GROQ_API_KEY (for Groq Llama 3) or OPENAI_API_KEY in your .env file."
    );
  }
  return new OpenAI({
    apiKey,
    ...(baseURL ? { baseURL } : {}),
  });
}

/**
 * Vision-based extraction for image files (JPG, PNG, TIFF, BMP).
 * Sends image directly to Vision LLM.
 */
export async function extractInvoiceDataFromImage(
  filePath: string,
  mimeType: string
): Promise<ExtractedInvoiceData> {
  const { visionModel } = getClientConfig();
  const client = getAiClient();

  const imageBuffer = fs.readFileSync(filePath);
  const base64 = imageBuffer.toString("base64");
  const dataUrl = `data:${mimeType};base64,${base64}`;

  const response = await client.chat.completions.create({
    model: visionModel,
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

  const cleaned = content.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
  const parsed = JSON.parse(cleaned);
  return InvoiceSchema.parse(parsed);
}

/**
 * Text-based extraction for PDFs.
 */
export async function extractInvoiceData(
  ocrText: string
): Promise<ExtractedInvoiceData> {
  const { textModel } = getClientConfig();
  const client = getAiClient();

  const response = await client.chat.completions.create({
    model: textModel,
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

  const cleaned = content.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
  const parsed = JSON.parse(cleaned);
  return InvoiceSchema.parse(parsed);
}
