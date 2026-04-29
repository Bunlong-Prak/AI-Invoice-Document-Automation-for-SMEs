"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  UploadCloud,
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
    <div className="min-h-screen bg-black text-white selection:bg-violet-500/30 font-sans">
      {/* Header */}
      <header className="px-8 h-20 flex items-center border-b border-white/[0.05] sticky top-0 bg-black/80 backdrop-blur-xl z-50">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-white flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
          <span className="font-bold text-xl tracking-tighter">InvoiceAI</span>
        </Link>
        <span className="ml-4 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 uppercase tracking-widest">
          Lab_Env_v1
        </span>
        <div className="ml-auto flex items-center gap-4">
          <Link href="/#pricing">
            <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white text-xs font-semibold">
              Pricing
            </Button>
          </Link>
          <Link href="/login">
            <Button size="sm" className="bg-white text-black hover:bg-zinc-200 rounded-full px-6 h-10 text-xs font-bold transition-all hover:scale-[1.05]">
              Get API Key
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-16">
        {/* Title */}
        <div className="mb-16 space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-white">
            Precision Extraction Lab.
          </h1>
          <p className="text-zinc-500 text-lg max-w-2xl leading-relaxed font-medium">
            Drop any document to test the Llama 3.1 extraction engine. <br />
            Zero-latency OCR and structural parsing in real-time.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: Upload */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
                Source_Document
              </h2>
              {file && (
                <button onClick={reset} className="text-zinc-500 hover:text-red-400 text-[10px] font-mono uppercase tracking-widest flex items-center gap-2 transition-colors">
                  <X className="w-3 h-3" /> [RESET_FILE]
                </button>
              )}
            </div>

            {/* Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => !file && inputRef.current?.click()}
              className={`relative rounded-2xl border border-dashed transition-all cursor-pointer min-h-[320px] flex flex-col items-center justify-center gap-6 ${
                dragging
                  ? "border-violet-500 bg-violet-500/5"
                  : file
                  ? "border-white/20 bg-[#0a0a0a] cursor-default"
                  : "border-white/10 bg-[#0a0a0a] hover:border-white/20 hover:bg-white/[0.02]"
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
                <div className="text-center space-y-4 p-8">
                  <div className="w-16 h-16 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto">
                    <FileText className="w-8 h-8 text-zinc-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-white truncate max-w-[320px] tracking-tight">{file.name}</p>
                    <p className="text-zinc-600 text-[10px] font-mono uppercase tracking-widest">
                      {(file.size / 1024).toFixed(1)} KB // {file.type.split("/")[1].toUpperCase()}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4 p-8">
                  <div className="w-16 h-16 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto">
                    <UploadCloud className="w-6 h-6 text-zinc-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-zinc-400 tracking-tight uppercase text-xs">Drop_Source_Document</p>
                    <p className="text-zinc-600 text-[10px] font-mono uppercase tracking-widest">or click to browse local files</p>
                  </div>
                  <p className="text-zinc-700 text-[9px] font-mono uppercase tracking-[0.2em] mt-4">PDF_JPG_PNG_TIFF_BMP_MAX_5MB</p>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 text-xs font-mono uppercase tracking-widest">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <Button
              onClick={extract}
              disabled={!file || loading}
              className="w-full h-14 bg-white text-black hover:bg-zinc-200 rounded-full text-base font-bold disabled:opacity-20 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  RUNNING_EXTRACTION...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 w-4 h-4" />
                  EXECUTE EXTRACTION
                </>
              )}
            </Button>

            {/* Curl example */}
            <div className="rounded-2xl bg-[#0a0a0a] border border-white/10 overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.05] bg-white/[0.02]">
                <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
                  <Terminal className="w-3.5 h-3.5" />
                  API_REQUEST_PREVIEW
                </div>
                <button
                  onClick={copyCurl}
                  className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-zinc-600 hover:text-white transition-colors"
                >
                  {copiedCurl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedCurl ? "COPIED" : "COPY_CURL"}
                </button>
              </div>
              <pre className="p-6 text-[11px] font-mono text-violet-400 overflow-x-auto leading-relaxed">
                {CURL_EXAMPLE}
              </pre>
            </div>
          </div>

          {/* Right: Result */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
                Extracted_Output_JSON
              </h2>
              {result && (
                <button
                  onClick={copyJson}
                  className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-zinc-600 hover:text-white transition-colors"
                >
                  {copiedJson ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedJson ? "COPIED" : "COPY_JSON"}
                </button>
              )}
            </div>

            <div className="rounded-2xl bg-[#0a0a0a] border border-white/10 min-h-[400px] overflow-hidden flex flex-col shadow-2xl relative">
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-6 p-12 text-center">
                  <div className="relative">
                    <Loader2 className="w-12 h-12 text-violet-500 animate-spin" />
                    <div className="absolute inset-0 bg-violet-500/20 blur-xl rounded-full animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-white font-bold tracking-tight uppercase text-xs">Extracting_Data...</p>
                    <p className="text-zinc-600 text-[10px] font-mono uppercase tracking-widest">Running OCR + Llama 3.1 Inference</p>
                  </div>
                </div>
              ) : result ? (
                <div className="flex-1 overflow-auto">
                  <div className="p-8">
                    <pre className="text-[13px] font-mono text-emerald-400/90 leading-relaxed">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-6 p-12 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center group-hover:border-white/10 transition-colors">
                    <FileText className="w-10 h-10 text-zinc-800" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-zinc-600 font-bold uppercase text-xs tracking-tight">Awaiting_Input</p>
                    <p className="text-zinc-700 text-[10px] font-mono uppercase tracking-widest">Upload a document to begin structural parsing</p>
                  </div>
                  <div className="text-left w-full max-w-[320px] rounded-xl bg-black border border-white/[0.05] p-6 mt-4">
                    <p className="text-zinc-800 text-[11px] font-mono leading-relaxed select-none">
                      {`{
  "vendor": "...",
  "id": "INV-...",
  "date": "...",
  "total": 0.00,
  "items": [...]
}`}
                    </p>
                  </div>
                </div>
              )}
              
              {result && (
                <div className="absolute bottom-4 right-4 text-[9px] font-mono text-zinc-700 uppercase tracking-widest bg-black/50 backdrop-blur px-2 py-1 rounded border border-white/5">
                  LATENCY: 1.2s // TOKENS: 452
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="rounded-2xl bg-[#0a0a0a] border border-white/10 p-8 space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Sparkles className="w-24 h-24 text-white" />
              </div>
              <div className="space-y-3 relative">
                <h3 className="text-xl font-bold text-white tracking-tight">Scale to Production.</h3>
                <p className="text-zinc-500 text-sm leading-relaxed max-w-sm">
                  Get a dedicated API key and process thousands of documents per minute with our high-throughput cluster.
                </p>
              </div>
              <Link href="/login" className="inline-block relative">
                <Button className="bg-white text-black hover:bg-zinc-200 rounded-full px-8 h-12 font-bold transition-all hover:scale-[1.05]">
                  Get Production Keys
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
