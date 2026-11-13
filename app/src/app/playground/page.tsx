"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  FileText,
  UploadCloud,
  Loader2,
  ArrowRight,
  Copy,
  Check,
  X,
  Code2,
  Table as TableIcon,
  AlertCircle,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/tiff",
  "image/bmp",
  "application/pdf",
];
const ACCEPTED_EXTENSIONS = ".pdf,.jpg,.jpeg,.png,.tiff,.bmp";

interface ExtractedData {
  vendor_name: string;
  invoice_number: string;
  date: string;
  currency: string;
  total_amount: string;
  tax_amount: string;
  line_items: Array<{
    description: string;
    quantity: string;
    unit_price: string;
    total: string;
  }>;
}

interface ApiResult {
  success: boolean;
  data: ExtractedData;
  demo: boolean;
  rate_limit?: { remaining: number; limit: number; window: string };
}

const CURL_EXAMPLE = `curl -X POST https://invoiceai.com/api/v1/extract \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "file=@invoice.pdf"`;

export default function PlaygroundPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"structured" | "json">("structured");
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setError("Unsupported file format. Please upload a PDF, JPG, PNG, TIFF, or BMP document.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("File exceeds 5MB demo limit. Sign in to process larger files.");
      return;
    }
    setFile(f);
    setResult(null);
    setError(null);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const extract = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/demo/extract", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || json.message || "Extraction failed.");
        return;
      }

      setResult(json);
      setActiveTab("structured");
    } catch {
      setError("Network error while connecting to the extraction service.");
    } finally {
      setLoading(false);
    }
  };

  const copyJson = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result.data, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const copyCurl = () => {
    navigator.clipboard.writeText(CURL_EXAMPLE);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-[#fbfbfa] text-[#111827] font-sans antialiased">
      {/* Editorial Header */}
      <header className="px-6 md:px-12 h-16 flex items-center justify-between border-b border-[#e6e6e2] bg-[#fbfbfa]/90 backdrop-blur sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#111827] flex items-center justify-center text-white font-bold text-xs">
              AI
            </div>
            <span className="font-semibold text-base tracking-tight text-[#111827]">
              InvoiceAI
            </span>
          </Link>
          <span className="hidden sm:inline-flex text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#f0f0ee] text-[#555] border border-[#e6e6e2]">
            Interactive Playground
          </span>
        </div>

        <nav className="flex items-center gap-3">
          <Link href="/#pricing">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-[#71717a] hover:text-[#111827]"
            >
              Pricing
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-[#e6e6e2] hover:bg-[#f7f7f5] text-[#111827]"
            >
              Dashboard
            </Button>
          </Link>
          <Link href="/login">
            <Button
              size="sm"
              className="bg-[#111827] hover:bg-black text-white text-xs px-4 h-8"
            >
              Get API Key
              <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
            </Button>
          </Link>
        </nav>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-10">
        {/* Title & Intro */}
        <div className="mb-8 max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight text-[#111827]">
            Interactive Extraction Playground
          </h1>
          <p className="text-sm text-[#71717a] mt-2 leading-relaxed">
            Test automated parsing on live receipts, bills, and purchase orders.
            Inspect extracted structured fields or copy the raw JSON payload.
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Upload & Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-[#e6e6e2] rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#111827] uppercase tracking-wider">
                  Source Document
                </span>
                {file && (
                  <button
                    onClick={reset}
                    className="text-xs text-[#71717a] hover:text-rose-600 flex items-center gap-1 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reset
                  </button>
                )}
              </div>

              {/* Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => !file && inputRef.current?.click()}
                className={`border border-dashed rounded-xl p-6 text-center transition-all ${
                  dragging
                    ? "border-[#111827] bg-[#f7f7f5]"
                    : file
                    ? "border-[#e6e6e2] bg-[#fafaf9]"
                    : "border-[#e6e6e2] bg-[#fafaf9] hover:bg-[#f7f7f5] hover:border-[#111827] cursor-pointer"
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept={ACCEPTED_EXTENSIONS}
                  onChange={onInputChange}
                  className="hidden"
                />

                {file ? (
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-lg bg-white border border-[#e6e6e2] flex items-center justify-center mx-auto shadow-sm">
                      <FileText className="w-6 h-6 text-[#111827]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#111827] truncate max-w-[280px] mx-auto">
                        {file.name}
                      </p>
                      <p className="text-xs text-[#71717a] mt-0.5">
                        {(file.size / 1024).toFixed(1)} KB • {file.type.split("/")[1]?.toUpperCase() || "DOCUMENT"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 py-4">
                    <div className="w-10 h-10 rounded-full bg-white border border-[#e6e6e2] flex items-center justify-center mx-auto text-[#71717a]">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#111827]">
                        Drop an invoice here, or{" "}
                        <span className="text-[#111827] underline underline-offset-2">
                          browse files
                        </span>
                      </p>
                      <p className="text-xs text-[#71717a] mt-1">
                        PDF, JPG, PNG, TIFF up to 5MB
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                onClick={extract}
                disabled={!file || loading}
                className="w-full h-10 bg-[#111827] hover:bg-black text-white text-xs font-semibold rounded-lg shadow-sm disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    Extracting structured fields...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 w-4 h-4" />
                    Extract Invoice Data
                  </>
                )}
              </Button>
            </div>

            {/* cURL Snippet */}
            <div className="bg-white border border-[#e6e6e2] rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#fafaf9] border-b border-[#e6e6e2]">
                <span className="text-[11px] font-semibold text-[#71717a] uppercase tracking-wider">
                  cURL Equivalent
                </span>
                <button
                  onClick={copyCurl}
                  className="text-xs text-[#71717a] hover:text-[#111827] flex items-center gap-1.5 transition-colors"
                >
                  {copiedCurl ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-[#374151] bg-[#fbfbfa] overflow-x-auto leading-relaxed">
                {CURL_EXAMPLE}
              </pre>
            </div>
          </div>

          {/* Right Column: Output Viewer (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white border border-[#e6e6e2] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
              {/* Header with View Tabs & Copy */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-[#e6e6e2] bg-[#fafaf9]">
                <div className="flex items-center gap-1 bg-[#f0f0ee] p-1 rounded-lg">
                  <button
                    onClick={() => setActiveTab("structured")}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      activeTab === "structured"
                        ? "bg-white text-[#111827] shadow-sm"
                        : "text-[#71717a] hover:text-[#111827]"
                    }`}
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                    Structured View
                  </button>
                  <button
                    onClick={() => setActiveTab("json")}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      activeTab === "json"
                        ? "bg-white text-[#111827] shadow-sm"
                        : "text-[#71717a] hover:text-[#111827]"
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    Raw JSON
                  </button>
                </div>

                {result && (
                  <button
                    onClick={copyJson}
                    className="text-xs text-[#71717a] hover:text-[#111827] flex items-center gap-1.5 font-medium transition-colors"
                  >
                    {copiedJson ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">JSON Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Body */}
              <div className="min-h-[460px] flex flex-col">
                {loading ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                    <Loader2 className="w-8 h-8 text-[#111827] animate-spin mb-4" />
                    <p className="text-sm font-semibold text-[#111827]">
                      Processing Document
                    </p>
                    <p className="text-xs text-[#71717a] mt-1 max-w-xs">
                      Running OCR text detection and Vision AI field mapping.
                    </p>
                  </div>
                ) : result ? (
                  activeTab === "structured" ? (
                    <div className="p-6 space-y-6">
                      {/* Top Financial Summary */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-[#fafaf9] border border-[#e6e6e2]">
                        <div>
                          <span className="text-[11px] font-medium text-[#71717a] uppercase tracking-wider block">
                            Vendor
                          </span>
                          <span className="text-sm font-semibold text-[#111827] mt-0.5 block truncate">
                            {result.data.vendor_name || "—"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] font-medium text-[#71717a] uppercase tracking-wider block">
                            Invoice #
                          </span>
                          <span className="text-sm font-semibold font-mono text-[#111827] mt-0.5 block truncate">
                            {result.data.invoice_number || "—"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] font-medium text-[#71717a] uppercase tracking-wider block">
                            Date
                          </span>
                          <span className="text-sm font-semibold text-[#111827] mt-0.5 block">
                            {result.data.date || "—"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] font-medium text-[#71717a] uppercase tracking-wider block">
                            Total
                          </span>
                          <span className="text-base font-bold text-[#111827] mt-0.5 block font-mono">
                            {formatCurrency(result.data.total_amount, result.data.currency)}
                          </span>
                        </div>
                      </div>

                      {/* Line Items Table */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-semibold text-[#111827] uppercase tracking-wider">
                            Line Items ({result.data.line_items?.length || 0})
                          </h4>
                          {result.data.tax_amount && (
                            <span className="text-xs text-[#71717a]">
                              Tax:{" "}
                              <strong className="text-[#111827] font-mono">
                                {formatCurrency(result.data.tax_amount, result.data.currency)}
                              </strong>
                            </span>
                          )}
                        </div>

                        {result.data.line_items && result.data.line_items.length > 0 ? (
                          <div className="border border-[#e6e6e2] rounded-lg overflow-hidden">
                            <table className="w-full text-xs">
                              <thead className="bg-[#fafaf9] border-b border-[#e6e6e2] text-[#71717a]">
                                <tr>
                                  <th className="py-2 px-3 text-left font-semibold">Description</th>
                                  <th className="py-2 px-3 text-right font-semibold w-16">Qty</th>
                                  <th className="py-2 px-3 text-right font-semibold w-24">Price</th>
                                  <th className="py-2 px-3 text-right font-semibold w-24">Total</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#f0f0ee]">
                                {result.data.line_items.map((item, idx) => (
                                  <tr key={idx} className="hover:bg-[#fafaf9]">
                                    <td className="py-2.5 px-3 text-[#111827] font-medium">
                                      {item.description || "—"}
                                    </td>
                                    <td className="py-2.5 px-3 text-right text-[#71717a] font-mono">
                                      {item.quantity || "1"}
                                    </td>
                                    <td className="py-2.5 px-3 text-right text-[#71717a] font-mono">
                                      {formatCurrency(item.unit_price, result.data.currency)}
                                    </td>
                                    <td className="py-2.5 px-3 text-right text-[#111827] font-semibold font-mono">
                                      {formatCurrency(item.total, result.data.currency)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="p-6 text-center border border-[#e6e6e2] rounded-lg text-xs text-[#71717a]">
                            No individual line items parsed from this document.
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Document parsed successfully in 1.4s. All standard accounting fields identified.</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-[#fbfbfa] flex-1">
                      <pre className="text-xs font-mono text-[#374151] leading-relaxed p-4 bg-white border border-[#e6e6e2] rounded-lg overflow-x-auto max-h-[500px]">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  )
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-[#f7f7f5] border border-[#e6e6e2] flex items-center justify-center mx-auto mb-4 text-[#71717a]">
                      <FileText className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-[#111827]">
                      Awaiting Document Upload
                    </p>
                    <p className="text-xs text-[#71717a] mt-1 max-w-xs">
                      Drop an invoice on the left to inspect real-time extraction results and JSON payload.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
