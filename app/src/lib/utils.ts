import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string | null, currency = "USD"): string {
  if (amount === null || amount === undefined || amount === "") return "—";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(num);
}

export function formatDate(date: string | Date | null): string {
  if (!date) return "—";
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return String(date);
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "processed":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "processing":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "error":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    case "uploaded":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "…";
}

/**
 * Sanitizes input numbers/strings for PostgreSQL numeric columns.
 * Strips currency symbols, commas, and invalid characters.
 * Returns null if the value is empty, null, or not a valid number.
 */
export function parseNumeric(val: string | number | null | undefined): string | null {
  if (val === null || val === undefined) return null;
  const str = String(val).trim();
  if (!str) return null;
  // Strip currency symbols and commas, keep digits, decimal point, negative sign
  const cleaned = str.replace(/[^0-9.-]/g, "");
  if (!cleaned || isNaN(Number(cleaned))) return null;
  return cleaned;
}
