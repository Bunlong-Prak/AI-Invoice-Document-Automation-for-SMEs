"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Upload,
  FileText,
  Loader2,
  ArrowRight,
  Copy,
  Check,
  X,
  Terminal,
  AlertCircle,
} from "lucide-react";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/tiff", "image/bmp", "application/pdf"];
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
  rate_limit: { remaining: number; limit: number; window: string };
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
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setError("Unsupported file type. Use PDF, JPG, PNG, TIFF, or BMP.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("File too large (max 5MB for demo).");
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
    } catch {
      setError("Network error. Make sure the service is running.");
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
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="px-6 h-16 flex items-center border-b border-white/5 sticky top-0 bg-black/80 backdrop-blur-xl z-50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">InvoiceAI</span>
        </Link>
        <span className="ml-3 text-xs font-medium px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
          Playground
        </span>
        <div className="ml-auto flex items-center gap-3">
          <Link href="/#pricing">
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
              Pricing
            </Button>
          </Link>
          <Link href="/login">
            <Button size="sm" className="bg-white text-black hover:bg-zinc-200 rounded-full px-5">
              Get API Key
              <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="text-center mb-12 space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            Try Invoice Extraction Live
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Drop any invoice, receipt, or financial document. Get structured JSON back in seconds. No account needed.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Upload */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm text-zinc-300 uppercase tracking-wider">
                Your Document
              </h2>
              {file && (
                <button onClick={reset} className="text-zinc-500 hover:text-white text-xs flex items-center gap-1 transition-colors">
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            {/* Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => !file && inputRef.current?.click()}
              className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer min-h-[280px] flex flex-col items-center justify-center gap-4 ${
                dragging
                  ? "border-violet-500 bg-violet-500/10"
                  : file
                  ? "border-white/10 bg-white/[0.02] cursor-default"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
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
                <div className="text-center space-y-3 p-8">
                  <div className="w-16 h-16 rounded-2xl bg-violet-500/15 flex items-center justify-center mx-auto">
                    <FileText className="w-8 h-8 text-violet-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white truncate max-w-[280px]">{file.name}</p>
                    <p className="text-zinc-500 text-sm mt-1">{(file.size / 1024).toFixed(1)} KB · {file.type.split("/")[1].toUpperCase()}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-3 p-8">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto">
                    <Upload className="w-8 h-8 text-zinc-400" />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-300">Drop your document here</p>
                    <p className="text-zinc-500 text-sm mt-1">or click to browse</p>
                  </div>
                  <p className="text-zinc-600 text-xs">PDF, JPG, PNG, TIFF, BMP · max 5MB</p>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            <Button
              onClick={extract}
              disabled={!file || loading}
              className="w-full h-12 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-base font-medium disabled:opacity-40"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 w-4 h-4" />
                  Extract Data
                </>
              )}
            </Button>

            {result && (
              <p className="text-center text-zinc-500 text-xs">
                {result.rate_limit.remaining} free demo request{result.rate_limit.remaining !== 1 ? "s" : ""} remaining this hour
              </p>
            )}

            {/* Curl example */}
            <div className="rounded-xl bg-zinc-900 border border-white/5 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-zinc-800/40">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Terminal className="w-3.5 h-3.5" />
                  API Usage
                </div>
                <button
                  onClick={copyCurl}
                  className="flex items-center gap-1 text-xs text-zinc-500 hover:text-white transition-colors"
                >
                  {copiedCurl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedCurl ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="p-4 text-xs text-violet-300 overflow-x-auto leading-relaxed">
                {CURL_EXAMPLE}
              </pre>
            </div>
          </div>

          {/* Right: Result */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm text-zinc-300 uppercase tracking-wider">
                Extracted JSON
              </h2>
              {result && (
                <button
                  onClick={copyJson}
                  className="flex items-center gap-1 text-xs text-zinc-500 hover:text-white transition-colors"
                >
                  {copiedJson ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedJson ? "Copied" : "Copy JSON"}
                </button>
              )}
            </div>

            <div className="rounded-2xl bg-zinc-900 border border-white/5 min-h-[280px] overflow-hidden flex flex-col">
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
                  <Loader2 className="w-10 h-10 text-violet-400 animate-spin" />
                  <div>
                    <p className="text-zinc-300 font-medium">Processing document...</p>
                    <p className="text-zinc-500 text-sm mt-1">OCR + AI extraction running</p>
                  </div>
                </div>
              ) : result ? (
                <div className="flex-1 overflow-auto">
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm text-emerald-300 leading-relaxed">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center">
                    <FileText className="w-8 h-8 text-zinc-600" />
                  </div>
                  <div>
                    <p className="text-zinc-500 font-medium">No result yet</p>
                    <p className="text-zinc-600 text-sm mt-1">Upload a document and hit Extract</p>
                  </div>
                  <div className="text-left w-full max-w-[280px] rounded-xl bg-white/[0.02] border border-white/5 p-4 mt-2">
                    <p className="text-zinc-600 text-xs font-mono leading-relaxed">
                      {`{
  "vendor_name": "...",
  "invoice_number": "...",
  "date": "YYYY-MM-DD",
  "currency": "USD",
  "total_amount": "...",
  "line_items": [...]
}`}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/20 p-6 space-y-3">
              <h3 className="font-semibold text-white">Ready to integrate?</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Get an API key and start extracting from your own app. Free plan includes 100 requests/month.
              </p>
              <Link href="/login">
                <Button className="bg-white text-black hover:bg-zinc-200 rounded-full px-6 mt-2">
                  Get Your API Key
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
