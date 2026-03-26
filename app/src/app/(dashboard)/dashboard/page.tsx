"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Search,
  Download,
  RefreshCw,
  Loader2,
  Trash2,
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
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
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
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      params.set("page", page.toString());
      params.set("limit", "20");

      const res = await fetch(`/api/documents?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      toast.error("Failed to load dashboard data");
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
        a.download = `invoices-export-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Export downloaded successfully");
      }
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Document deleted");
        fetchData();
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  const toggleSelect = (id: string) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Overview of your invoices and documents
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={handleExport}
            disabled={exporting}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Documents",
            value: stats?.totalDocuments ?? "—",
            icon: FileText,
            color: "from-blue-500 to-cyan-500",
          },
          {
            label: "Processed",
            value: stats?.processedCount ?? "—",
            icon: CheckCircle,
            color: "from-emerald-500 to-green-500",
          },
          {
            label: "Errors",
            value: stats?.errorCount ?? "—",
            icon: AlertCircle,
            color: "from-red-500 to-orange-500",
          },
          {
            label: "Total Amount",
            value: stats
              ? formatCurrency(stats.totalAmount)
              : "—",
            icon: DollarSign,
            color: "from-violet-500 to-purple-500",
          },
        ].map((stat) => (
          <Card
            key={stat.label}
            className="border-border/40 bg-card/50 backdrop-blur-sm"
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} bg-opacity-10`}
                >
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by vendor, invoice number, or filename..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 bg-card/50"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(val) => {
            setStatusFilter(!val || val === "all" ? "" : val);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[160px] bg-card/50">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="uploaded">Uploaded</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="processed">Processed</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/40">
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  className="rounded accent-violet-500"
                  checked={
                    data
                      ? data.documents.length > 0 &&
                        selectedIds.size === data.documents.length
                      : false
                  }
                  onChange={toggleAll}
                />
              </TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Invoice #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data?.documents.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-12 text-muted-foreground"
                >
                  <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No documents found</p>
                  <p className="text-sm mt-1">
                    Upload your first invoice to get started
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              data?.documents.map((doc) => (
                <TableRow
                  key={doc.id}
                  className="cursor-pointer hover:bg-accent/50 border-border/30 transition-colors"
                  onClick={() => router.push(`/invoices/${doc.id}`)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="rounded accent-violet-500"
                      checked={selectedIds.has(doc.id)}
                      onChange={() => toggleSelect(doc.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {doc.vendorName || (
                      <span className="text-muted-foreground italic">
                        {doc.originalName}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {doc.invoiceNumber || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(doc.invoiceDate)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(doc.totalAmount, doc.currency || "USD")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-xs capitalize ${getStatusColor(doc.status)}`}
                    >
                      {doc.status === "processing" && (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      )}
                      {doc.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(doc.uploadedAt)}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      {data && data.total > data.limit && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-3 text-sm text-muted-foreground">
            Page {page} of {Math.ceil(data.total / data.limit)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(data.total / data.limit)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
