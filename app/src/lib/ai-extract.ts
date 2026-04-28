import OpenAI from "openai";
import { z } from "zod";
import type { ExtractedInvoiceData } from "@/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.groq.com/openai/v1", // Use Groq's free API
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

const EXTRACTION_PROMPT = `You are an expert financial document data extraction system. Your job is to extract structured data from OCR text of ANY financial document — invoices, receipts, payment confirmations, bank transfers, transaction slips, purchase orders, or bills.

RULES:
1. Extract ALL available information from the text regardless of document type
2. If a field is not found or unclear, use an empty string ""
3. For amounts, extract the POSITIVE number only (no currency symbols, no minus sign). Use "." as decimal separator
4. For date, use ISO format YYYY-MM-DD when possible. Convert "Mar 31, 2026" → "2026-03-31"
5. Currency should be a 3-letter code (USD, EUR, GBP, KHR, etc.)
6. Extract ALL line items or transaction details you can identify
7. Your response MUST be valid JSON only — no markdown, no explanation, no extra text
8. Be tolerant of OCR errors, messy formatting, and unusual layouts

FIELD MAPPING for different document types:
- "vendor_name": seller, recipient, payee, merchant, vendor, company name, or "To:" field
- "invoice_number": invoice #, receipt #, transaction ID, Trx. ID, reference #, order #, or any unique document identifier
- "date": invoice date, transaction date, receipt date, payment date
- "total_amount": total, amount, grand total, original amount (always positive)
- "tax_amount": tax, VAT, GST amount if present

Extract this structure:
{
  "vendor_name": "Seller/recipient/payee name",
  "invoice_number": "Any unique document or transaction identifier",
  "date": "Document date in YYYY-MM-DD format",
  "currency": "3-letter currency code",
  "total_amount": "Total amount as a positive number string",
  "tax_amount": "Tax amount as a number string, or empty string",
  "line_items": [
    {
      "description": "Item or transaction description",
      "quantity": "Quantity, or empty string if not applicable",
      "unit_price": "Unit price, or empty string if not applicable",
      "total": "Line total as a number string"
    }
  ]
}

OCR TEXT:
`;

export async function extractInvoiceData(
  ocrText: string
): Promise<ExtractedInvoiceData> {
  try {
    const response = await openai.chat.completions.create({
      model: "llama3-70b-8192", // Fast and free model from Groq
      messages: [
        {
          role: "system",
          content:
            "You are a precise data extraction system. Respond ONLY with valid JSON. No markdown formatting, no code blocks, no explanations.",
        },
        {
          role: "user",
          content: EXTRACTION_PROMPT + ocrText,
        },
      ],
      temperature: 0,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from AI");
    }

    // Parse and validate the response
    const parsed = JSON.parse(content);
    const validated = InvoiceSchema.parse(parsed);

    return validated;
  } catch (error) {
    console.error("AI extraction failed:", error);

    // Return empty structure on failure rather than crashing
    if (error instanceof z.ZodError) {
      console.error("Validation errors:", error.issues);
    }

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
}
