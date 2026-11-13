"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Search,
  Download,
  RefreshCw,
  Loader2,
  Trash2,
  Upload,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { toast } from "sonner";

interface DocumentRow {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  status: string;
  errorMessage: string | null;
  uploadedAt: string;
  vendorName: string | null;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  currency: string | null;
  totalAmount: string | null;
  taxAmount: string | null;
}

interface DashboardData {
  documents: DocumentRow[];
  total: number;
  page: number;
  limit: number;
  stats: {
    totalDocuments: number;
    processedCount: number;
    errorCount: number;
    totalAmount: number;
  };
  usage: {
    used: number;
    limit: number;
    remaining: number;
    hasReachedLimit: boolean;
  };
  subscriptionTier: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
      params.set("page", page.toString());
      params.set("limit", "25");

      const res = await fetch(`/api/documents?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      toast.error("Failed to load invoice records");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const ids = selectedIds.size > 0 ? Array.from(selectedIds) : [];
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentIds: ids }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `invoices-export-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(
          ids.length > 0
            ? `Exported ${ids.length} selected invoices`
            : "Exported all invoices to CSV"
        );
      } else {
        toast.error("Failed to generate CSV export");
      }
    } catch {
      toast.error("Export request failed");
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this invoice?")) return;

    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Document deleted");
        fetchData();
      } else {
        toast.error("Failed to delete document");
      }
    } catch {
      toast.error("Network error while deleting");
    }
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (!data) return;
    if (selectedIds.size === data.documents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.documents.map((d) => d.id)));
    }
  };

  const stats = data?.stats;
  const usage = data?.usage;
  const processedPercent = stats && stats.totalDocuments > 0
    ? Math.round((stats.processedCount / stats.totalDocuments) * 100)
    : 100;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#e6e6e2]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Invoices & Receipts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Automated OCR data extraction, line item breakdown, and exports.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className="h-9 px-3 text-xs font-medium border-[#e6e6e2] bg-white hover:bg-stone-50 text-slate-700 shadow-xs"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 mr-1.5", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={exporting || data?.documents.length === 0}
            className="h-9 px-3 text-xs font-medium border-[#e6e6e2] bg-white hover:bg-stone-50 text-slate-700 shadow-xs"
          >
            {exporting ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5 mr-1.5" />
            )}
            Export CSV
          </Button>
          <Link href="/upload">
            <Button
              size="sm"
              className="h-9 px-4 text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 shadow-xs"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              Upload Invoices
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Processed Invoices */}
        <Card className="border border-[#e6e6e2] bg-white shadow-xs rounded-lg">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-slate-500">Processed Invoices</p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {stats?.processedCount ?? "0"}
              </span>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                {processedPercent}% parsed
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {stats?.totalDocuments ?? 0} total uploaded
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Total Amount */}
        <Card className="border border-[#e6e6e2] bg-white shadow-xs rounded-lg">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-slate-500">Total Invoiced Volume</p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
                {stats ? formatCurrency(stats.totalAmount) : "—"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Sum of extracted totals
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Processing Errors */}
        <Card className="border border-[#e6e6e2] bg-white shadow-xs rounded-lg">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-slate-500">Extraction Status</p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {(stats?.totalDocuments || 0) - (stats?.errorCount || 0)}
              </span>
              {stats && stats.errorCount > 0 ? (
                <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {stats.errorCount} review needed
                </span>
              ) : (
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  All clean
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              High-confidence OCR & Vision
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Monthly Quota */}
        <Card className="border border-[#e6e6e2] bg-white shadow-xs rounded-lg">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500">Monthly Usage</p>
              <Badge variant="outline" className="text-[10px] uppercase font-semibold text-slate-600 bg-stone-50 border-[#e6e6e2]">
                {data?.subscriptionTier || "Free"}
              </Badge>
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
                {usage?.used ?? 0}
                <span className="text-sm font-normal text-slate-400 ml-1">
                  / {usage?.limit ?? 100}
                </span>
              </span>
              <span className="text-xs text-slate-500">
                {usage ? `${usage.remaining} left` : "—"}
              </span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
              <div
                className="bg-slate-900 h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(
                    100,
                    usage ? Math.round((usage.used / usage.limit) * 100) : 0
                  )}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Section */}
      <div className="space-y-4">
        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search vendor, invoice number, or filename..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-9 text-xs bg-white border-[#e6e6e2] text-slate-900 placeholder:text-slate-400 rounded-md shadow-xs focus-visible:ring-slate-900"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val || "all");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[150px] h-9 text-xs bg-white border-[#e6e6e2] text-slate-700 rounded-md shadow-xs">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#e6e6e2] text-xs">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="uploaded">Uploaded</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Data Table */}
        <div className="border border-[#e6e6e2] bg-white rounded-lg shadow-xs overflow-hidden">
          <Table>
            <TableHeader className="bg-[#fbfbfa] border-b border-[#e6e6e2]">
              <TableRow className="hover:bg-transparent border-[#e6e6e2]">
                <TableHead className="w-10 pl-4">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    checked={
                      data
                        ? data.documents.length > 0 &&
                          selectedIds.size === data.documents.length
                        : false
                    }
                    onChange={toggleAll}
                  />
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-700">Vendor & Document</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700">Invoice #</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700">Amount</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700">Date</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700">Status</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700 text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-[#e6e6e2]">
                    <TableCell colSpan={7} className="py-4 px-4">
                      <Skeleton className="h-5 w-full bg-slate-100" />
                    </TableCell>
                  </TableRow>
                ))
              ) : data?.documents.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-16 text-slate-500"
                  >
                    <Receipt className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-800">No invoices found</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      {search || statusFilter !== "all"
                        ? "Try clearing your search query or filter."
                        : "Upload a PDF invoice or receipt image to see automated extraction."}
                    </p>
                    <Link href="/upload" className="inline-block mt-4">
                      <Button size="sm" variant="outline" className="text-xs border-[#e6e6e2] shadow-xs">
                        <Upload className="w-3.5 h-3.5 mr-1.5" />
                        Upload Invoices
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ) : (
                data?.documents.map((doc) => (
                  <TableRow
                    key={doc.id}
                    className="cursor-pointer hover:bg-stone-50/70 border-[#e6e6e2] transition-colors"
                    onClick={() => router.push(`/invoices/${doc.id}`)}
                  >
                    <TableCell className="pl-4" onClick={(e) => toggleSelect(doc.id, e)}>
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                        checked={selectedIds.has(doc.id)}
                        onChange={() => {}}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-900 hover:underline">
                          {doc.vendorName || doc.originalName}
                        </span>
                        <span className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[220px]">
                          {doc.originalName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-700">
                      {doc.invoiceNumber || "—"}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-medium text-slate-900">
                      {formatCurrency(doc.totalAmount, doc.currency || "USD")}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {formatDate(doc.invoiceDate || doc.uploadedAt)}
                    </TableCell>
                    <TableCell>
                      {doc.status === "processed" && (
                        <Badge className="text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-none">
                          Processed
                        </Badge>
                      )}
                      {doc.status === "processing" && (
                        <Badge className="text-[11px] font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 shadow-none flex items-center gap-1 w-fit">
                          <Loader2 className="w-2.5 h-2.5 animate-spin" />
                          Processing
                        </Badge>
                      )}
                      {doc.status === "uploaded" && (
                        <Badge className="text-[11px] font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 shadow-none">
                          Uploaded
                        </Badge>
                      )}
                      {doc.status === "error" && (
                        <Badge className="text-[11px] font-medium px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 shadow-none">
                          Needs Review
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                          onClick={() => router.push(`/invoices/${doc.id}`)}
                          title="View & Edit"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          onClick={(e) => handleDelete(doc.id, e)}
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
