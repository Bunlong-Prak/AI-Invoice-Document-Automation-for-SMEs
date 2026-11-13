"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  Trash2,
  FileText,
  AlertCircle,
  RefreshCw,
  Calendar,
  DollarSign,
  FileCode,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { toast } from "sonner";

interface InvoiceData {
  id: string;
  vendorName: string | null;
  invoiceNumber: string | null;
  date: string | null;
  currency: string | null;
  totalAmount: string | null;
  taxAmount: string | null;
  rawText: string | null;
}

interface LineItem {
  id: string;
  description: string | null;
  quantity: string | null;
  unitPrice: string | null;
  total: string | null;
  sortOrder: number;
}

interface DocumentData {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
  status: string;
  errorMessage: string | null;
  uploadedAt: string;
}

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reprocessing, setReprocessing] = useState(false);
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [showRawOcr, setShowRawOcr] = useState(false);

  // Form state
  const [vendorName, setVendorName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [date, setDate] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [totalAmount, setTotalAmount] = useState("");
  const [taxAmount, setTaxAmount] = useState("");
  const [editItems, setEditItems] = useState<
    {
      description: string;
      quantity: string;
      unitPrice: string;
      total: string;
    }[]
  >([]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/documents/${id}`);
      if (!res.ok) {
        toast.error("Document not found");
        router.push("/dashboard");
        return;
      }

      const data = await res.json();
      setDocument(data.document);
      setInvoice(data.invoice);

      if (data.invoice) {
        setVendorName(data.invoice.vendorName || "");
        setInvoiceNumber(data.invoice.invoiceNumber || "");
        setDate(data.invoice.date ? data.invoice.date.split("T")[0] : "");
        setCurrency(data.invoice.currency || "USD");
        setTotalAmount(data.invoice.totalAmount ? String(data.invoice.totalAmount) : "");
        setTaxAmount(data.invoice.taxAmount ? String(data.invoice.taxAmount) : "");
      }

      setEditItems(
        (data.lineItems || []).map((item: LineItem) => ({
          description: item.description || "",
          quantity: item.quantity ? String(item.quantity) : "",
          unitPrice: item.unitPrice ? String(item.unitPrice) : "",
          total: item.total ? String(item.total) : "",
        }))
      );
    } catch {
      toast.error("Failed to load document");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!invoice) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorName,
          invoiceNumber,
          date: date || null,
          currency,
          totalAmount,
          taxAmount,
          items: editItems,
        }),
      });

      if (res.ok) {
        toast.success("Invoice saved successfully");
        fetchData();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to save invoice");
      }
    } catch {
      toast.error("Network error while saving");
    } finally {
      setSaving(false);
    }
  };

  const handleReprocess = async () => {
    setReprocessing(true);
    try {
      const res = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: id }),
      });

      if (res.ok) {
        toast.success("Document reprocessed successfully");
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.message || err.error || "Reprocessing failed");
      }
    } catch {
      toast.error("Reprocessing failed");
    } finally {
      setReprocessing(false);
    }
  };

  const addLineItem = () => {
    setEditItems([
      ...editItems,
      { description: "", quantity: "1", unitPrice: "0.00", total: "0.00" },
    ]);
  };

  const removeLineItem = (index: number) => {
    setEditItems(editItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (
    index: number,
    field: string,
    value: string
  ) => {
    setEditItems(
      editItems.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, [field]: value };
        // Auto calculate total if quantity and unit price are numbers
        if (field === "quantity" || field === "unitPrice") {
          const qty = parseFloat(field === "quantity" ? value : item.quantity);
          const price = parseFloat(field === "unitPrice" ? value : item.unitPrice);
          if (!isNaN(qty) && !isNaN(price)) {
            updated.total = (qty * price).toFixed(2);
          }
        }
        return updated;
      })
    );
  };

  // Line item sum calculation
  const itemsSubtotal = editItems.reduce((acc, it) => {
    const val = parseFloat(it.total);
    return isNaN(val) ? acc : acc + val;
  }, 0);

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto py-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-md" />
          <div className="space-y-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="text-center py-24 bg-white border border-[#e6e6e2] rounded-xl max-w-3xl mx-auto my-12">
        <div className="w-12 h-12 rounded-full bg-[#f7f7f5] border border-[#e6e6e2] flex items-center justify-center mx-auto mb-4">
          <FileText className="w-6 h-6 text-[#71717a]" />
        </div>
        <h3 className="text-base font-semibold text-[#111827]">Document not found</h3>
        <p className="text-sm text-[#71717a] mt-1 max-w-sm mx-auto">
          The document you requested does not exist or may have been deleted.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-6 border-[#e6e6e2] hover:bg-[#f7f7f5] text-[#111827]"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Header / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#e6e6e2]">
        <div className="flex items-center gap-3.5">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/dashboard")}
            className="h-9 w-9 border-[#e6e6e2] bg-white text-[#111827] hover:bg-[#f7f7f5]"
            title="Back to Documents"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold tracking-tight text-[#111827]">
                {vendorName || document.originalName}
              </h1>
              <Badge
                variant="outline"
                className={`text-xs font-medium px-2 py-0.5 rounded border capitalize ${getStatusColor(
                  document.status
                )}`}
              >
                {document.status}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#71717a] mt-0.5">
              <span>{document.originalName}</span>
              <span>•</span>
              <span>{(document.fileSize / 1024).toFixed(1)} KB</span>
              <span>•</span>
              <span>Uploaded {formatDate(document.uploadedAt)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReprocess}
            disabled={reprocessing}
            className="border-[#e6e6e2] bg-white text-[#111827] hover:bg-[#f7f7f5] text-xs font-medium"
          >
            {reprocessing ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            )}
            Reprocess
          </Button>

          {invoice && (
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="bg-[#111827] hover:bg-black text-white text-xs font-medium px-4 shadow-sm"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5 mr-1.5" />
              )}
              Save Changes
            </Button>
          )}
        </div>
      </div>

      {/* Processing Error Notice */}
      {document.status === "error" && document.errorMessage && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-900 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-rose-900">Extraction Error</p>
            <p className="text-xs text-rose-700 leading-relaxed">
              {document.errorMessage}
            </p>
          </div>
        </div>
      )}

      {invoice ? (
        <>
          {/* Top Summary Ledger Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white border border-[#e6e6e2] shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <span className="text-xs font-medium text-[#71717a] uppercase tracking-wider block">
                Total Billed
              </span>
              <p className="text-2xl font-bold tracking-tight text-[#111827] mt-1">
                {formatCurrency(totalAmount || null, currency)}
              </p>
              <div className="mt-2 text-xs text-[#71717a] flex items-center justify-between">
                <span>Tax: {formatCurrency(taxAmount || null, currency)}</span>
                <span className="font-medium text-[#111827]">Currency: {currency}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#e6e6e2] shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <span className="text-xs font-medium text-[#71717a] uppercase tracking-wider block">
                Invoice Reference
              </span>
              <p className="text-lg font-semibold tracking-tight text-[#111827] mt-1 font-mono">
                {invoiceNumber || "—"}
              </p>
              <div className="mt-2 text-xs text-[#71717a]">
                Vendor: <span className="font-medium text-[#111827]">{vendorName || "Unknown"}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#e6e6e2] shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <span className="text-xs font-medium text-[#71717a] uppercase tracking-wider block">
                Document Date
              </span>
              <p className="text-lg font-semibold tracking-tight text-[#111827] mt-1">
                {date ? formatDate(date) : "No date detected"}
              </p>
              <div className="mt-2 text-xs text-[#71717a] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Extracted & editable</span>
              </div>
            </div>
          </div>

          {/* Form: Primary Invoice Details */}
          <Card className="border-[#e6e6e2] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] rounded-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold text-[#111827]">
                Invoice Header & Identification
              </CardTitle>
              <CardDescription className="text-xs text-[#71717a]">
                Core accounting details parsed from the document. Edits are synced to downstream ledger exports.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-[#4b5563]">Vendor Name</Label>
                  <Input
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="border-[#e6e6e2] bg-white text-sm text-[#111827] focus-visible:ring-1 focus-visible:ring-[#111827]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-[#4b5563]">Invoice Number</Label>
                  <Input
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="e.g. INV-2024-001"
                    className="border-[#e6e6e2] bg-white text-sm text-[#111827] font-mono focus-visible:ring-1 focus-visible:ring-[#111827]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-[#4b5563]">Invoice Date</Label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="border-[#e6e6e2] bg-white text-sm text-[#111827] focus-visible:ring-1 focus-visible:ring-[#111827]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-[#4b5563]">Currency</Label>
                  <Input
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                    placeholder="USD"
                    maxLength={3}
                    className="border-[#e6e6e2] bg-white text-sm text-[#111827] font-mono uppercase focus-visible:ring-1 focus-visible:ring-[#111827]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-[#4b5563]">Tax Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={taxAmount}
                    onChange={(e) => setTaxAmount(e.target.value)}
                    placeholder="0.00"
                    className="border-[#e6e6e2] bg-white text-sm text-[#111827] font-mono focus-visible:ring-1 focus-visible:ring-[#111827]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-[#4b5563]">Total Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    placeholder="0.00"
                    className="border-[#e6e6e2] bg-white text-sm font-semibold text-[#111827] font-mono focus-visible:ring-1 focus-visible:ring-[#111827]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line Items Table */}
          <Card className="border-[#e6e6e2] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] rounded-xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-[#f0f0ee]">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-[#111827]">
                    Line Items
                  </CardTitle>
                  <CardDescription className="text-xs text-[#71717a]">
                    Itemized products and services extracted from the invoice body.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addLineItem}
                  className="border-[#e6e6e2] bg-white text-[#111827] hover:bg-[#f7f7f5] text-xs font-medium h-8"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {editItems.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <p className="text-sm font-medium text-[#71717a]">
                    No line items extracted.
                  </p>
                  <p className="text-xs text-[#a1a1aa] mt-1">
                    Some invoices contain summary totals only. Click "Add Item" to add manual entries.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addLineItem}
                    className="mt-4 border-[#e6e6e2] hover:bg-[#f7f7f5] text-xs"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Add First Item
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-[#fafaf9]">
                      <TableRow className="border-b border-[#e6e6e2]">
                        <TableHead className="text-xs font-semibold text-[#71717a] py-2.5 px-4">
                          Description
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-[#71717a] py-2.5 px-4 w-28">
                          Qty
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-[#71717a] py-2.5 px-4 w-36">
                          Unit Price ({currency})
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-[#71717a] py-2.5 px-4 w-36">
                          Total ({currency})
                        </TableHead>
                        <TableHead className="w-12 py-2.5 px-2"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {editItems.map((item, i) => (
                        <TableRow
                          key={i}
                          className="border-b border-[#f0f0ee] hover:bg-[#fafaf9] transition-colors"
                        >
                          <TableCell className="py-2 px-4">
                            <Input
                              value={item.description}
                              onChange={(e) =>
                                updateLineItem(i, "description", e.target.value)
                              }
                              className="h-8 border-[#e6e6e2] bg-white text-xs text-[#111827] focus-visible:ring-1 focus-visible:ring-[#111827]"
                              placeholder="Item description or SKU"
                            />
                          </TableCell>
                          <TableCell className="py-2 px-4">
                            <Input
                              value={item.quantity}
                              onChange={(e) =>
                                updateLineItem(i, "quantity", e.target.value)
                              }
                              className="h-8 border-[#e6e6e2] bg-white text-xs font-mono text-[#111827] focus-visible:ring-1 focus-visible:ring-[#111827]"
                              placeholder="1"
                            />
                          </TableCell>
                          <TableCell className="py-2 px-4">
                            <Input
                              value={item.unitPrice}
                              onChange={(e) =>
                                updateLineItem(i, "unitPrice", e.target.value)
                              }
                              className="h-8 border-[#e6e6e2] bg-white text-xs font-mono text-[#111827] focus-visible:ring-1 focus-visible:ring-[#111827]"
                              placeholder="0.00"
                            />
                          </TableCell>
                          <TableCell className="py-2 px-4">
                            <Input
                              value={item.total}
                              onChange={(e) =>
                                updateLineItem(i, "total", e.target.value)
                              }
                              className="h-8 border-[#e6e6e2] bg-white text-xs font-mono font-medium text-[#111827] focus-visible:ring-1 focus-visible:ring-[#111827]"
                              placeholder="0.00"
                            />
                          </TableCell>
                          <TableCell className="py-2 px-2 text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-[#71717a] hover:text-rose-600 hover:bg-rose-50 rounded"
                              onClick={() => removeLineItem(i)}
                              title="Delete row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              {editItems.length > 0 && (
                <div className="flex items-center justify-between px-6 py-3 bg-[#fafaf9] border-t border-[#e6e6e2] text-xs">
                  <span className="text-[#71717a]">
                    Showing {editItems.length} item{editItems.length > 1 ? "s" : ""}
                  </span>
                  <div className="flex items-center gap-6">
                    <span className="text-[#71717a]">
                      Items Subtotal:{" "}
                      <strong className="text-[#111827] font-mono">
                        {formatCurrency(itemsSubtotal, currency)}
                      </strong>
                    </span>
                    <span className="text-[#71717a]">
                      Invoice Total:{" "}
                      <strong className="text-[#111827] font-mono">
                        {formatCurrency(totalAmount || null, currency)}
                      </strong>
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* OCR Raw Text Inspector */}
          {invoice.rawText && (
            <Card className="border-[#e6e6e2] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] rounded-xl overflow-hidden">
              <CardHeader className="py-3 px-6 border-b border-[#f0f0ee]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-[#71717a]" />
                    <CardTitle className="text-sm font-semibold text-[#111827]">
                      Raw Text Extraction Inspector
                    </CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-[#71717a] hover:text-[#111827] h-7"
                    onClick={() => setShowRawOcr(!showRawOcr)}
                  >
                    {showRawOcr ? "Hide OCR Output" : "View OCR Output"}
                  </Button>
                </div>
              </CardHeader>
              {showRawOcr && (
                <CardContent className="p-4 bg-[#fbfbfa]">
                  <pre className="text-xs text-[#374151] whitespace-pre-wrap bg-white p-4 rounded-lg border border-[#e6e6e2] max-h-[350px] overflow-y-auto font-mono leading-relaxed">
                    {invoice.rawText}
                  </pre>
                </CardContent>
              )}
            </Card>
          )}
        </>
      ) : (
        <Card className="border-[#e6e6e2] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] rounded-xl">
          <CardContent className="py-20 text-center">
            <div className="w-12 h-12 rounded-full bg-[#f7f7f5] border border-[#e6e6e2] flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-[#71717a]" />
            </div>
            <h3 className="text-base font-semibold text-[#111827]">
              {document.status === "processing"
                ? "Document is being processed"
                : "No extraction data available"}
            </h3>
            <p className="text-sm text-[#71717a] mt-1 max-w-sm mx-auto">
              {document.status === "processing"
                ? "The Vision AI model is currently parsing this invoice. This typically takes 2–4 seconds."
                : "This document has not been processed yet. Click the button below to extract fields."}
            </p>
            {document.status !== "processing" && (
              <Button
                className="mt-6 bg-[#111827] hover:bg-black text-white text-xs font-medium px-5"
                onClick={handleReprocess}
                disabled={reprocessing}
              >
                {reprocessing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Process Document Now
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
