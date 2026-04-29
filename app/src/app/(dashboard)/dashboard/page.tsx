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
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter text-white">Dashboard</h1>
          <p className="text-zinc-500 text-[11px] font-mono uppercase tracking-widest mt-1">
            Real_time_extraction_metrics
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className="border-white/10 hover:bg-white/5 text-xs font-semibold h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={handleExport}
            disabled={exporting}
            className="bg-white text-black hover:bg-zinc-200 text-xs font-bold h-9 px-5 rounded-full"
          >
            {exporting ? (
              <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5 mr-2" />
            )}
            Export CSV
          </Button>
        </div>
      </div>

      {/* Primary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Card className="border-white/[0.05] bg-[#0a0a0a] rounded-xl overflow-hidden relative group">
          <CardContent className="p-6">
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Processed_Docs</p>
            <div className="flex items-baseline gap-2 mt-4">
              <p className="text-4xl font-bold font-mono tracking-tighter text-white">{stats?.processedCount ?? "—"}</p>
              <p className="text-[10px] text-emerald-500 font-mono font-bold">+100%</p>
            </div>
            <div className="mt-4 h-[1px] bg-white/[0.05] w-full" />
            <p className="text-[9px] font-mono text-zinc-700 mt-2 uppercase">Verified_system_output</p>
          </CardContent>
        </Card>

        <Card className="border-white/[0.05] bg-[#0a0a0a] rounded-xl overflow-hidden relative group">
          <CardContent className="p-6">
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Success_Rate</p>
            <div className="flex items-baseline gap-2 mt-4">
              <p className="text-4xl font-bold font-mono tracking-tighter text-white">{stats ? `${successRate.toFixed(1)}%` : "—"}</p>
            </div>
            <div className="mt-4 h-[1px] bg-white/[0.05] w-full" />
            <p className="text-[9px] font-mono text-zinc-700 mt-2 uppercase">Llama_3.1_precision</p>
          </CardContent>
        </Card>

        <Card className="border-white/[0.05] bg-[#0a0a0a] rounded-xl overflow-hidden relative group">
          <CardContent className="p-6">
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Estimated_ROI</p>
            <div className="flex items-baseline gap-2 mt-4">
              <p className="text-4xl font-bold font-mono tracking-tighter text-violet-400">{formatCurrency(estimatedSavings)}</p>
            </div>
            <div className="mt-4 h-[1px] bg-white/[0.05] w-full" />
            <p className="text-[9px] font-mono text-zinc-700 mt-2 uppercase">Calculated_labor_savings</p>
          </CardContent>
        </Card>

        <Card className="border-violet-500/20 bg-[#0a0a0a] md:col-span-3 lg:col-span-1 border-l-2 border-l-violet-500 rounded-xl">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Plan_Usage</p>
              <Badge variant="outline" className="text-[9px] font-mono uppercase font-bold bg-violet-500/10 border-violet-500/20 text-violet-400 rounded-full px-2">
                {data?.subscriptionTier || "Free"}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-zinc-500">{usage?.used ?? 0} / {usage?.limit ?? 100} REQ</span>
                <span className="text-white font-bold">{usage ? Math.round((usage.used / usage.limit) * 100) : 0}%</span>
              </div>
              <Progress value={usage ? (usage.used / usage.limit) * 100 : 0} className="h-1 bg-white/[0.05]">
                <ProgressTrack>
                  <ProgressIndicator className={cn(
                    "transition-all",
                    usage && (usage.used / usage.limit) > 0.9 ? "bg-red-500" : 
                    usage && (usage.used / usage.limit) > 0.7 ? "bg-amber-500" : "bg-violet-600"
                  )} />
                </ProgressTrack>
              </Progress>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Table Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
              <Input
                placeholder="Search vendor, invoice #..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 bg-white/[0.03] border-white/[0.05] text-xs h-10 rounded-lg placeholder:text-zinc-700"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(!val || val === "all" ? "" : val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[160px] bg-white/[0.03] border-white/[0.05] text-xs h-10 rounded-lg text-zinc-400">
                <SelectValue placeholder="STATUS_FILTER" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10 text-xs font-mono">
                <SelectItem value="all">ALL_STATUSES</SelectItem>
                <SelectItem value="uploaded">UPLOADED</SelectItem>
                <SelectItem value="processing">PROCESSING</SelectItem>
                <SelectItem value="processed">PROCESSED</SelectItem>
                <SelectItem value="error">ERROR</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="border-white/[0.05] bg-[#0a0a0a] rounded-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-white/[0.02]">
                <TableRow className="hover:bg-transparent border-white/[0.05]">
                  <TableHead className="w-10">
                    <input
                      type="checkbox"
                      className="rounded accent-violet-500 bg-black border-white/10"
                      checked={
                        data
                          ? data.documents.length > 0 &&
                            selectedIds.size === data.documents.length
                          : false
                      }
                      onChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead className="text-[10px] uppercase font-mono font-bold tracking-[0.1em] text-zinc-600">Vendor_Identity</TableHead>
                  <TableHead className="text-[10px] uppercase font-mono font-bold tracking-[0.1em] text-zinc-600">Net_Amount</TableHead>
                  <TableHead className="text-[10px] uppercase font-mono font-bold tracking-[0.1em] text-zinc-600">Engine_Status</TableHead>
                  <TableHead className="text-[10px] uppercase font-mono font-bold tracking-[0.1em] text-zinc-600 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-white/[0.05]">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full bg-white/5" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : data?.documents.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-20 text-zinc-600"
                    >
                      <FileText className="w-10 h-10 mx-auto mb-4 opacity-20" />
                      <p className="text-xs font-mono uppercase tracking-widest">No_documents_detected</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.documents.map((doc) => (
                    <TableRow
                      key={doc.id}
                      className="cursor-pointer hover:bg-white/[0.02] border-white/[0.05] transition-colors"
                      onClick={() => router.push(`/invoices/${doc.id}`)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="rounded accent-violet-500 bg-black border-white/10"
                          checked={selectedIds.has(doc.id)}
                          onChange={() => toggleSelect(doc.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white tracking-tight">{doc.vendorName || doc.originalName}</span>
                          <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-tighter mt-0.5">
                            {doc.invoiceNumber ? `ID: ${doc.invoiceNumber}` : formatDate(doc.uploadedAt)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-zinc-300">
                        {formatCurrency(doc.totalAmount, doc.currency || "USD")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] font-mono px-2 py-0 h-5 uppercase rounded-full border-none",
                            getStatusColor(doc.status).includes("emerald") ? "bg-emerald-500/10 text-emerald-400" :
                            getStatusColor(doc.status).includes("amber") ? "bg-amber-500/10 text-amber-400" :
                            "bg-zinc-800 text-zinc-400"
                          )}
                        >
                          {doc.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-700 hover:text-red-500 hover:bg-red-500/5 transition-all"
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
        </div>

        {/* Sidebar Help/API Section */}
        <div className="space-y-6">
          <Card className="border-white/[0.05] bg-[#0a0a0a] border-l-2 border-l-violet-500 rounded-xl">
            <CardHeader className="p-6">
              <CardTitle className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                <Zap className="w-3 h-3 text-violet-500" />
                API_INTEGRATION
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-5">
              <div className="p-4 bg-black rounded border border-white/[0.05] font-mono text-[10px] text-zinc-400 leading-relaxed">
                <span className="text-emerald-500">POST</span> /api/v1/extract<br />
                <span className="text-zinc-600">AUTH: Bearer sk_...</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-[10px] font-mono uppercase tracking-widest h-9 border-white/10 hover:bg-white/5"
                onClick={() => router.push("/settings/keys")}
              >
                Get_Production_Keys
              </Button>
            </CardContent>
          </Card>

          <Card className="border-white/[0.05] bg-[#0a0a0a] rounded-xl">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Global_Support</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2">
              <div className="space-y-4">
                <div className="flex items-center gap-4 group">
                  <div className="w-8 h-8 rounded bg-white/[0.03] border border-white/[0.05] flex items-center justify-center shrink-0 group-hover:border-violet-500/50 transition-colors">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-white tracking-tight">Bakong & KHR</p>
                    <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-tighter">Native_bank_transfers</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-8 h-8 rounded bg-white/[0.03] border border-white/[0.05] flex items-center justify-center shrink-0 group-hover:border-violet-500/50 transition-colors">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-white tracking-tight">Multi-Currency</p>
                    <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-tighter">Global_tax_compliant</p>
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
