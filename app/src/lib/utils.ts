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
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "processing":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "error":
      return "bg-rose-50 text-rose-800 border-rose-200";
    case "uploaded":
      return "bg-sky-50 text-sky-800 border-sky-200";
    default:
      return "bg-neutral-100 text-neutral-700 border-neutral-200";
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
