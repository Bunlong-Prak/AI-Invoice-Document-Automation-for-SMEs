"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  FileText,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Upload,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UploadedFile {
  id?: string;
  file: File;
  status: "pending" | "uploading" | "uploaded" | "processing" | "done" | "error";
  progress: number;
  error?: string;
}

export default function UploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/tiff",
      "image/bmp",
      "application/pdf",
    ];
    const added: UploadedFile[] = [];

    Array.from(newFiles).forEach((file) => {
      if (!validTypes.includes(file.type)) {
        toast.error(`Unsupported format: ${file.name}`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File too large: ${file.name} (max 10MB)`);
        return;
      }
      added.push({ file, status: "pending", progress: 0 });
    });

    setFiles((prev) => [...prev, ...added]);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files?.length) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) {
        addFiles(e.target.files);
      }
    },
    [addFiles]
  );

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadAndProcess = async () => {
    const pendingFiles = files.filter((f) => f.status === "pending");
    if (pendingFiles.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      if (files[i].status !== "pending") continue;

      setFiles((prev) =>
        prev.map((f, idx) =>
          idx === i ? { ...f, status: "uploading", progress: 30 } : f
        )
      );

      try {
        const formData = new FormData();
        formData.append("files", files[i].file);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("Upload failed");

        const { results } = await uploadRes.json();
        const result = results[0];

        if (result.error) {
          setFiles((prev) =>
            prev.map((f, idx) =>
              idx === i
                ? { ...f, status: "error", error: result.error, progress: 100 }
                : f
            )
          );
          continue;
        }

        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i
              ? { ...f, id: result.id, status: "processing", progress: 65 }
              : f
          )
        );

        const processRes = await fetch("/api/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentId: result.id }),
        });

        if (processRes.ok) {
          setFiles((prev) =>
            prev.map((f, idx) =>
              idx === i ? { ...f, status: "done", progress: 100 } : f
            )
          );
          toast.success(`Extracted: ${files[i].file.name}`);
        } else {
          const err = await processRes.json();
          setFiles((prev) =>
            prev.map((f, idx) =>
              idx === i
                ? {
                    ...f,
                    status: "error",
                    error: err.message || "Extraction failed",
                    progress: 100,
                  }
                : f
            )
          );
        }
      } catch {
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i
              ? { ...f, status: "error", error: "Upload failed", progress: 100 }
              : f
          )
        );
      }
    }
  };

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const doneCount = files.filter((f) => f.status === "done").length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-[#e6e6e2]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Upload Invoices
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Drop supplier invoices and receipts for automated data extraction.
          </p>
        </div>
        {doneCount > 0 && (
          <Link href="/dashboard">
            <Button size="sm" variant="outline" className="text-xs border-[#e6e6e2] shadow-xs">
              View in Dashboard
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        )}
      </div>

      {/* Drop Zone */}
      <Card className="border border-[#e6e6e2] bg-white rounded-lg shadow-xs overflow-hidden">
        <CardContent className="p-8">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-input")?.click()}
            className={cn(
              "flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg transition-all cursor-pointer text-center",
              dragActive
                ? "border-slate-900 bg-stone-50"
                : "border-slate-300 hover:border-slate-500 hover:bg-[#fbfbfa]"
            )}
          >
            <input
              id="file-input"
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.tiff,.bmp"
              onChange={handleFileInput}
              className="hidden"
            />
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-stone-100 text-slate-700 mb-4 border border-[#e6e6e2]">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-slate-900">
              Drag & drop invoice files here, or click to browse
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports PDF, JPG, PNG, TIFF, and BMP — Up to 10MB per document
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded File Queue */}
      {files.length > 0 && (
        <Card className="border border-[#e6e6e2] bg-white rounded-lg shadow-xs overflow-hidden">
          <CardHeader className="py-4 px-6 border-b border-[#e6e6e2] bg-[#fbfbfa]">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <span>Selected Documents ({files.length})</span>
                {doneCount > 0 && (
                  <span className="text-xs text-emerald-700 font-normal bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {doneCount} processed
                  </span>
                )}
              </CardTitle>
              {pendingCount > 0 && (
                <Button
                  size="sm"
                  onClick={uploadAndProcess}
                  className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-medium h-8 px-4 rounded-md shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  Process {pendingCount} {pendingCount === 1 ? "File" : "Files"}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {files.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-3.5 rounded-lg border border-[#e6e6e2] bg-[#fbfbfa]"
              >
                <div className="w-8 h-8 rounded bg-white border border-[#e6e6e2] flex items-center justify-center shrink-0 text-slate-600">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {f.file.name}
                    </p>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {(f.file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  {(f.status === "uploading" || f.status === "processing") && (
                    <div className="mt-2">
                      <Progress value={f.progress} className="h-1 bg-slate-200" />
                    </div>
                  )}
                  {f.error && (
                    <p className="text-xs text-rose-600 mt-1">{f.error}</p>
                  )}
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  {f.status === "pending" && (
                    <Badge variant="outline" className="text-[11px] border-[#e6e6e2] text-slate-600 font-normal bg-white">
                      Ready
                    </Badge>
                  )}
                  {f.status === "uploading" && (
                    <Badge className="text-[11px] bg-amber-50 text-amber-700 border border-amber-200 font-normal">
                      <Loader2 className="w-2.5 h-2.5 mr-1 animate-spin" />
                      Uploading
                    </Badge>
                  )}
                  {f.status === "processing" && (
                    <Badge className="text-[11px] bg-slate-100 text-slate-800 border border-slate-300 font-normal">
                      <Loader2 className="w-2.5 h-2.5 mr-1 animate-spin" />
                      Extracting
                    </Badge>
                  )}
                  {f.status === "done" && (
                    <Badge className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-normal">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Done
                    </Badge>
                  )}
                  {f.status === "error" && (
                    <Badge className="text-[11px] bg-rose-50 text-rose-700 border border-rose-200 font-normal">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Failed
                    </Badge>
                  )}
                  {(f.status === "pending" || f.status === "error") && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-slate-400 hover:text-slate-700"
                      onClick={() => removeFile(i)}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
