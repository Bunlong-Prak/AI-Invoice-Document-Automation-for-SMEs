"use client";

import { useState, useCallback } from "react";
import {
  UploadCloud,
  FileText,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  FileUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

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
        toast.error(`Unsupported type: ${file.name}`);
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

    // Upload files
    for (let i = 0; i < files.length; i++) {
      if (files[i].status !== "pending") continue;

      // Set uploading
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

        // Set uploaded, start processing
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i
              ? { ...f, id: result.id, status: "processing", progress: 60 }
              : f
          )
        );

        // Trigger processing
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
          toast.success(`Processed: ${files[i].file.name}`);
        } else {
          const err = await processRes.json();
          setFiles((prev) =>
            prev.map((f, idx) =>
              idx === i
                ? {
                    ...f,
                    status: "error",
                    error: err.message || "Processing failed",
                    progress: 100,
                  }
                : f
            )
          );
        }
      } catch (err) {
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Upload Documents</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Upload invoices and receipts for AI-powered data extraction
        </p>
      </div>

      {/* Drop Zone */}
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg transition-all cursor-pointer ${
              dragActive
                ? "border-violet-500 bg-violet-500/5"
                : "border-border/60 hover:border-violet-500/50 hover:bg-accent/30"
            }`}
            onClick={() =>
              document.getElementById("file-input")?.click()
            }
          >
            <input
              id="file-input"
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.tiff,.bmp"
              onChange={handleFileInput}
              className="hidden"
            />
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 mb-4">
              <FileUp className="w-8 h-8 text-violet-500" />
            </div>
            <p className="text-lg font-semibold mb-1">
              Drop files here or click to browse
            </p>
            <p className="text-sm text-muted-foreground">
              Supports PDF, JPG, PNG, TIFF, BMP — Max 10MB each
            </p>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Files ({files.length})
                {doneCount > 0 && (
                  <span className="text-emerald-500 ml-2 text-sm font-normal">
                    {doneCount} processed
                  </span>
                )}
              </CardTitle>
              {pendingCount > 0 && (
                <Button
                  onClick={uploadAndProcess}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                >
                  <UploadCloud className="w-4 h-4 mr-2" />
                  Upload & Process ({pendingCount})
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {files.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-3 rounded-lg bg-accent/30 border border-border/30"
              >
                <FileText className="w-8 h-8 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {f.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(f.file.size / 1024).toFixed(1)} KB
                  </p>
                  {(f.status === "uploading" || f.status === "processing") && (
                    <div className="mt-2">
                      <Progress value={f.progress} className="h-1" />
                    </div>
                  )}
                  {f.error && (
                    <p className="text-xs text-red-400 mt-1">{f.error}</p>
                  )}
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  {f.status === "pending" && (
                    <Badge variant="outline" className="text-xs">
                      Ready
                    </Badge>
                  )}
                  {f.status === "uploading" && (
                    <Badge
                      variant="outline"
                      className="text-xs text-amber-500"
                    >
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Uploading
                    </Badge>
                  )}
                  {f.status === "processing" && (
                    <Badge
                      variant="outline"
                      className="text-xs text-blue-500"
                    >
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Processing
                    </Badge>
                  )}
                  {f.status === "done" && (
                    <Badge
                      variant="outline"
                      className="text-xs text-emerald-500"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Done
                    </Badge>
                  )}
                  {f.status === "error" && (
                    <Badge
                      variant="outline"
                      className="text-xs text-red-500"
                    >
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Error
                    </Badge>
                  )}
                  {(f.status === "pending" || f.status === "error") && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => removeFile(i)}
                    >
                      <X className="w-4 h-4" />
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
