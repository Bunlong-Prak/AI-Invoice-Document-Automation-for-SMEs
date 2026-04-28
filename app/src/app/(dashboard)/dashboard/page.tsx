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
  TrendingUp,
  Activity,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate, getStatusColor, cn } from "@/lib/utils";
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
  const usage = data?.usage;
  const successRate = stats ? (stats.processedCount / (stats.totalDocuments || 1)) * 100 : 0;
  const estimatedSavings = stats ? stats.processedCount * 0.5 : 0; // $0.50 saved per document

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time overview of your document automation
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
            Export Data
          </Button>
        </div>
      </div>

      {/* Primary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <TrendingUp className="w-12 h-12 text-emerald-500" />
          </div>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Processed Docs</p>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-3xl font-bold">{stats?.processedCount ?? "—"}</p>
              <p className="text-xs text-emerald-500 font-medium">+100%</p>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Successfully structured data</p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Activity className="w-12 h-12 text-blue-500" />
          </div>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Success Rate</p>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-3xl font-bold">{stats ? `${successRate.toFixed(1)}%` : "—"}</p>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">OCR accuracy & processing</p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <DollarSign className="w-12 h-12 text-violet-500" />
          </div>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Estimated ROI</p>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-3xl font-bold text-violet-400">{formatCurrency(estimatedSavings)}</p>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Labor costs saved (@$0.50/doc)</p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-violet-600/5 backdrop-blur-sm border-violet-500/20 md:col-span-3 lg:col-span-1">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Plan Usage</p>
              <Badge variant="outline" className="text-[10px] uppercase font-bold bg-violet-500/10 border-violet-500/20 text-violet-400">
                {data?.subscriptionTier || "Free"}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">{usage?.used ?? 0} / {usage?.limit ?? 100} requests</span>
                <span className="font-medium">{usage ? Math.round((usage.used / usage.limit) * 100) : 0}%</span>
              </div>
              <Progress value={usage ? (usage.used / usage.limit) * 100 : 0} className="h-1.5">
                <ProgressTrack>
                  <ProgressIndicator className={cn(
                    "transition-all",
                    usage && (usage.used / usage.limit) > 0.9 ? "bg-red-500" : 
                    usage && (usage.used / usage.limit) > 0.7 ? "bg-amber-500" : "bg-violet-500"
                  )} />
                </ProgressTrack>
              </Progress>
            </div>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Monthly quota resets in {30 - new Date().getDate()} days. 
              {usage?.remaining && usage.remaining < 10 && " Upgrade now to avoid interruption."}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search vendor, invoice #..."
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
              <SelectTrigger className="w-[140px] bg-card/50">
                <SelectValue placeholder="Status" />
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

          <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/40">
                  <TableHead className="w-10">
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
                  <TableHead className="text-xs uppercase font-bold tracking-wider opacity-70">Vendor</TableHead>
                  <TableHead className="text-xs uppercase font-bold tracking-wider opacity-70">Amount</TableHead>
                  <TableHead className="text-xs uppercase font-bold tracking-wider opacity-70">Status</TableHead>
                  <TableHead className="text-xs uppercase font-bold tracking-wider opacity-70 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : data?.documents.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-12 text-muted-foreground"
                    >
                      <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p>No documents found</p>
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
                        <div className="flex flex-col">
                          <span>{doc.vendorName || doc.originalName}</span>
                          <span className="text-[10px] text-muted-foreground font-normal">
                            {doc.invoiceNumber ? `INV: ${doc.invoiceNumber}` : formatDate(doc.uploadedAt)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(doc.totalAmount, doc.currency || "USD")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 h-5 capitalize ${getStatusColor(doc.status)}`}
                        >
                          {doc.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(doc.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 text-xs"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(data.total / data.limit)}
                className="h-8 text-xs"
              >
                Next
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar Help/API Section */}
        <div className="space-y-6">
          <Card className="border-border/40 bg-card/50 backdrop-blur-sm border-l-4 border-l-violet-500">
            <CardHeader className="p-5">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-violet-500" />
                Quick Integration
              </CardTitle>
              <CardDescription className="text-xs">
                Extract data via API in minutes.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-4">
              <div className="p-3 bg-black rounded-lg font-mono text-[10px] text-zinc-400 overflow-x-auto">
                <span className="text-emerald-500">POST</span> /api/v1/extract<br />
                <span className="text-zinc-600">Authorization: Bearer sk_...</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs h-8"
                onClick={() => router.push("/settings/keys")}
              >
                Get API Keys
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-sm">Global Reach</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4 text-violet-500" />
                  </div>
                  <div className="text-xs">
                    <p className="font-medium">Bakong Supported</p>
                    <p className="text-muted-foreground text-[10px]">Full Khmer bank transfer support</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-xs">
                    <p className="font-medium">Multi-Currency</p>
                    <p className="text-muted-foreground text-[10px]">USD, EUR, KHR, GBP and more</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
