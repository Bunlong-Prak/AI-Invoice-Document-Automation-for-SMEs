"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  Trash2,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getStatusColor } from "@/lib/utils";
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
  const [items, setItems] = useState<LineItem[]>([]);

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
      setItems(data.lineItems);

      // Populate form
      if (data.invoice) {
        setVendorName(data.invoice.vendorName || "");
        setInvoiceNumber(data.invoice.invoiceNumber || "");
        setDate(data.invoice.date || "");
        setCurrency(data.invoice.currency || "USD");
        setTotalAmount(data.invoice.totalAmount || "");
        setTaxAmount(data.invoice.taxAmount || "");
      }

      setEditItems(
        data.lineItems.map((item: LineItem) => ({
          description: item.description || "",
          quantity: item.quantity || "",
          unitPrice: item.unitPrice || "",
          total: item.total || "",
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
          date,
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
        toast.error("Failed to save");
      }
    } catch {
      toast.error("Failed to save");
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
        toast.success("Document reprocessed");
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.message || "Reprocessing failed");
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
      { description: "", quantity: "", unitPrice: "", total: "" },
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
      editItems.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="text-center py-20">
        <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p className="text-lg font-medium">Document not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              {vendorName || document.originalName}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="outline"
                className={`text-xs capitalize ${getStatusColor(document.status)}`}
              >
                {document.status}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {document.originalName}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {document.status === "error" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReprocess}
              disabled={reprocessing}
            >
              {reprocessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <AlertCircle className="w-4 h-4 mr-2" />
              )}
              Reprocess
            </Button>
          )}
          {invoice && (
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          )}
        </div>
      </div>

      {/* Error message */}
      {document.status === "error" && document.errorMessage && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-400">
                Processing Error
              </p>
              <p className="text-xs text-red-400/70 mt-0.5">
                {document.errorMessage}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoice Fields */}
      {invoice ? (
        <>
          <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Invoice Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Vendor Name
                  </Label>
                  <Input
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Invoice Number
                  </Label>
                  <Input
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Date</Label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Currency
                  </Label>
                  <Input
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Total Amount
                  </Label>
                  <Input
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Tax Amount
                  </Label>
                  <Input
                    value={taxAmount}
                    onChange={(e) => setTaxAmount(e.target.value)}
                    className="bg-background/50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Line Items</CardTitle>
                <Button variant="outline" size="sm" onClick={addLineItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {editItems.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">
                  No line items extracted. Click "Add Item" to add manually.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/40">
                      <TableHead>Description</TableHead>
                      <TableHead className="w-24">Qty</TableHead>
                      <TableHead className="w-32">Unit Price</TableHead>
                      <TableHead className="w-32">Total</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {editItems.map((item, i) => (
                      <TableRow key={i} className="border-border/30">
                        <TableCell>
                          <Input
                            value={item.description}
                            onChange={(e) =>
                              updateLineItem(i, "description", e.target.value)
                            }
                            className="bg-background/50 h-8 text-sm"
                            placeholder="Item description"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.quantity}
                            onChange={(e) =>
                              updateLineItem(i, "quantity", e.target.value)
                            }
                            className="bg-background/50 h-8 text-sm"
                            placeholder="0"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.unitPrice}
                            onChange={(e) =>
                              updateLineItem(i, "unitPrice", e.target.value)
                            }
                            className="bg-background/50 h-8 text-sm"
                            placeholder="0.00"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.total}
                            onChange={(e) =>
                              updateLineItem(i, "total", e.target.value)
                            }
                            className="bg-background/50 h-8 text-sm"
                            placeholder="0.00"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeLineItem(i)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Raw OCR Text */}
          {invoice.rawText && (
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Raw OCR Text</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap bg-background/50 p-4 rounded-lg max-h-[300px] overflow-y-auto font-mono">
                  {invoice.rawText}
                </pre>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No extracted data yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              {document.status === "processing"
                ? "Document is being processed..."
                : "This document hasn't been processed yet."}
            </p>
            {document.status !== "processing" && (
              <Button
                className="mt-4"
                onClick={handleReprocess}
                disabled={reprocessing}
              >
                {reprocessing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Process Now
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
