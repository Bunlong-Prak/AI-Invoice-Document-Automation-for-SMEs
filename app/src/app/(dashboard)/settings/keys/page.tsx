"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Copy, Trash2, Plus, Key, BarChart3, Loader2, Check, Terminal, ExternalLink } from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  isActive: number;
  createdAt: string;
  lastUsedAt: string | null;
}

interface UsageStats {
  tier: string;
  used: number;
  limit: number;
  remaining: number;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchKeys();
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const res = await fetch("/api/usage");
      if (res.ok) setUsage(await res.json());
    } catch {}
  };

  const fetchKeys = async () => {
    try {
      const res = await fetch("/api/keys");
      const data = await res.json();
      if (data.keys) {
        setKeys(data.keys);
      }
    } catch {
      toast.error("Failed to fetch API keys");
    } finally {
      setIsLoading(false);
    }
  };

  const createKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a key name");
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      const data = await res.json();
      if (data.key) {
        setKeys([...keys, data.key]);
        setNewKeyName("");
        toast.success("API key generated successfully");
      }
    } catch {
      toast.error("Failed to generate API key");
    } finally {
      setIsCreating(false);
    }
  };

  const deleteKey = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this API key? Applications using it will lose access immediately.")) {
      return;
    }

    try {
      const res = await fetch(`/api/keys/${id}`, { method: "DELETE" });
      if (res.ok) {
        setKeys(keys.filter((k) => k.id !== id));
        toast.success("API key revoked");
      }
    } catch {
      toast.error("Failed to revoke API key");
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("API key copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Title & Description */}
      <div className="border-b border-[#e6e6e2] pb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-[#111827]">
          API Keys & Programmatic Access
        </h1>
        <p className="text-sm text-[#71717a] mt-1 leading-relaxed">
          Manage bearer tokens for direct integration with your ERP, accounting software, or backend automation pipelines.
        </p>
      </div>

      {/* Top 2 Cards: Generator & Usage */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Create Key Card */}
        <Card className="border-[#e6e6e2] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-[#111827]">
              Generate Secret Key
            </CardTitle>
            <CardDescription className="text-xs text-[#71717a]">
              Create a unique API token with standard read/write extraction permissions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-1">
            <div className="flex gap-2">
              <Input
                placeholder="e.g. QuickBooks Sync Worker"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createKey()}
                className="border-[#e6e6e2] bg-white text-xs text-[#111827] focus-visible:ring-1 focus-visible:ring-[#111827]"
              />
              <Button
                onClick={createKey}
                disabled={isCreating}
                className="bg-[#111827] hover:bg-black text-white text-xs font-semibold px-4 h-9 shadow-sm shrink-0"
              >
                {isCreating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Generate
                  </>
                )}
              </Button>
            </div>
            <p className="text-[11px] text-[#71717a]">
              Keys inherit your organization's active plan limits and document retention rules.
            </p>
          </CardContent>
        </Card>

        {/* Usage Card */}
        <Card className="border-[#e6e6e2] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-[#111827]">
                API Usage & Quota
              </CardTitle>
              <Badge
                variant="outline"
                className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border-[#e6e6e2] bg-[#f7f7f5] text-[#111827]"
              >
                {usage?.tier || "Free"} Plan
              </Badge>
            </div>
            <CardDescription className="text-xs text-[#71717a]">
              Monthly document extraction volume for the current billing cycle.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-1">
            <div className="flex items-baseline justify-between mb-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono text-[#111827]">
                  {usage?.used ?? 0}
                </span>
                <span className="text-xs text-[#71717a]">
                  / {usage?.limit ?? 100} documents
                </span>
              </div>
              <span className="text-xs font-medium text-[#71717a]">
                {usage ? `${Math.round((usage.used / usage.limit) * 100)}%` : "0%"} used
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-[#f0f0ee] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#111827] rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(
                    100,
                    usage ? (usage.used / usage.limit) * 100 : 0
                  )}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Keys Table Card */}
      <Card className="border-[#e6e6e2] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] rounded-xl overflow-hidden">
        <CardHeader className="pb-3 border-b border-[#f0f0ee]">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-[#111827]">
                Active API Keys
              </CardTitle>
              <CardDescription className="text-xs text-[#71717a]">
                Tokens currently authorized to authenticate against the v1 REST endpoints.
              </CardDescription>
            </div>
            <span className="text-xs text-[#71717a] font-mono">
              {keys.length} key{keys.length === 1 ? "" : "s"}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-6 w-6 animate-spin text-[#71717a]" />
            </div>
          ) : keys.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-10 h-10 rounded-full bg-[#f7f7f5] border border-[#e6e6e2] flex items-center justify-center mx-auto mb-3 text-[#71717a]">
                <Key className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-[#111827]">No active API keys</p>
              <p className="text-xs text-[#71717a] mt-1">
                Generate a key above to start integrating with the API.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#fafaf9]">
                  <TableRow className="border-b border-[#e6e6e2]">
                    <TableHead className="text-xs font-semibold text-[#71717a] py-2.5 px-4">
                      Key Name
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-[#71717a] py-2.5 px-4">
                      Token Secret
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-[#71717a] py-2.5 px-4">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-[#71717a] py-2.5 px-4">
                      Last Used
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-[#71717a] py-2.5 px-4">
                      Created
                    </TableHead>
                    <TableHead className="text-right text-xs font-semibold text-[#71717a] py-2.5 px-4">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keys.map((key) => (
                    <TableRow
                      key={key.id}
                      className="border-b border-[#f0f0ee] hover:bg-[#fafaf9] transition-colors"
                    >
                      <TableCell className="py-3 px-4 font-medium text-xs text-[#111827]">
                        {key.name}
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <code className="bg-[#f7f7f5] border border-[#e6e6e2] px-2 py-0.5 rounded text-[11px] font-mono text-[#111827]">
                          {key.key.substring(0, 8)}••••••••{key.key.substring(key.key.length - 4)}
                        </code>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-medium px-2 py-0.5 rounded border capitalize ${
                            key.isActive
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-neutral-100 text-neutral-600 border-neutral-200"
                          }`}
                        >
                          {key.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-xs text-[#71717a]">
                        {key.lastUsedAt
                          ? new Date(key.lastUsedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Never"}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-xs text-[#71717a]">
                        {new Date(key.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 border-[#e6e6e2] hover:bg-[#f7f7f5] text-[#111827]"
                            onClick={() => copyToClipboard(key.key, key.id)}
                            title="Copy key"
                          >
                            {copiedId === key.id ? (
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 border-[#e6e6e2] hover:bg-rose-50 text-[#71717a] hover:text-rose-600"
                            onClick={() => deleteKey(key.id)}
                            title="Revoke key"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Integration Quickstart */}
      <Card className="border-[#e6e6e2] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] rounded-xl overflow-hidden">
        <CardHeader className="pb-3 border-b border-[#f0f0ee]">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#71717a]" />
            <CardTitle className="text-sm font-semibold text-[#111827]">
              Integration Quickstart
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-[#71717a]">
            Submit multipart form uploads with your key in the standard Bearer header.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 bg-[#fbfbfa]">
          <pre className="text-xs font-mono text-[#374151] bg-white p-4 rounded-lg border border-[#e6e6e2] overflow-x-auto leading-relaxed">
{`curl -X POST https://your-domain.com/api/v1/extract \\
  -H "Authorization: Bearer <YOUR_API_KEY>" \\
  -F "file=@invoice_2024.pdf"`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
