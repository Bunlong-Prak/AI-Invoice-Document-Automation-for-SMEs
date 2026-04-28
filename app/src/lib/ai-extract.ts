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

const EXTRACTION_PROMPT = `You are an expert invoice data extraction system. Your job is to extract structured data from raw OCR text of invoices.

RULES:
1. Extract ALL available information from the text
2. If a field is not found or unclear, use an empty string ""
3. For amounts, extract just the number (no currency symbols). Use "." as decimal separator
4. For date, use ISO format YYYY-MM-DD when possible
5. Currency should be a 3-letter code (USD, EUR, GBP, etc.)
6. Extract ALL line items you can identify
7. Your response MUST be valid JSON only — no markdown, no explanation, no extra text
8. Be tolerant of OCR errors, messy formatting, and unusual invoice layouts

Extract the following structure:
{
  "vendor_name": "Company name of the vendor/seller",
  "invoice_number": "Invoice/receipt number",
  "date": "Invoice date in YYYY-MM-DD format",
  "currency": "3-letter currency code",
  "total_amount": "Total amount as a number string",
  "tax_amount": "Tax/VAT amount as a number string",
  "line_items": [
    {
      "description": "Item description",
      "quantity": "Quantity as a number string",
      "unit_price": "Unit price as a number string",
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
