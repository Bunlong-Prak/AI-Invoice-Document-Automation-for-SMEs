export type DocumentStatus = "uploaded" | "processing" | "processed" | "error";

export interface ExtractedInvoiceData {
  vendor_name: string;
  invoice_number: string;
  date: string;
  currency: string;
  total_amount: string;
  tax_amount: string;
  line_items: LineItemData[];
}

export interface LineItemData {
  description: string;
  quantity: string;
  unit_price: string;
  total: string;
}

export interface DocumentWithInvoice {
  id: string;
  userId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
  status: DocumentStatus;
  uploadedAt: Date;
  invoice: {
    id: string;
    vendorName: string | null;
    invoiceNumber: string | null;
    date: string | null;
    currency: string | null;
    totalAmount: string | null;
    taxAmount: string | null;
    rawText: string | null;
    rawJson: string | null;
    createdAt: Date;
    updatedAt: Date;
    lineItems: {
      id: string;
      description: string | null;
      quantity: string | null;
      unitPrice: string | null;
      total: string | null;
      sortOrder: number;
    }[];
  } | null;
}

export interface DashboardStats {
  totalDocuments: number;
  processedCount: number;
  errorCount: number;
  totalAmount: number;
}
