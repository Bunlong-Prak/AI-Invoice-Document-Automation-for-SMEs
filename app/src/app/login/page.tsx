"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  TableProperties,
  ArrowRight,
  Lock,
} from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#fbfbfa] text-[#111827]">
      {/* Left panel - Editorial Brand Story (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#f7f7f5] border-r border-[#e6e6e2] p-12 lg:p-16 flex-col justify-between">
        <div>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#111827] flex items-center justify-center text-white font-bold text-xs">
              AI
            </div>
            <span className="font-semibold text-lg tracking-tight text-[#111827]">
              InvoiceAI
            </span>
          </Link>
          <span className="inline-block text-xs text-[#71717a] mt-1">
            Precision Document Automation for SMEs
          </span>
        </div>

        {/* Editorial Content */}
        <div className="space-y-8 my-auto py-12 max-w-lg">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-[#111827] leading-snug">
              Modern invoice processing built for serious accounting teams.
            </h1>
            <p className="text-sm text-[#71717a] leading-relaxed">
              Extract itemized line items, tax subtotals, and vendor metadata with high accuracy.
              Eliminate hours of manual ledger re-entry.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {[
              {
                icon: TableProperties,
                title: "Complete Line Item Extraction",
                desc: "Parses dense multi-page invoice tables into editable ledger rows.",
              },
              {
                icon: ShieldCheck,
                title: "Accounting Validation & Math Check",
                desc: "Automatically recalculates line item totals against the invoice summary total.",
              },
              {
                icon: FileText,
                title: "Universal Document Ingestion",
                desc: "Processes standard PDFs, high-res scans, receipts, and photos instantly.",
              },
            ].map((feat) => (
              <div key={feat.title} className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#e6e6e2] flex items-center justify-center text-[#111827] shrink-0 mt-0.5">
                  <feat.icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#111827]">
                    {feat.title}
                  </h4>
                  <p className="text-xs text-[#71717a] mt-0.5 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonial Quote */}
          <div className="p-4 rounded-xl bg-white border border-[#e6e6e2] shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-2">
            <p className="text-xs text-[#374151] italic leading-relaxed">
              "We dropped our invoice turnaround time from 2 days to under 2 minutes. The clean line-item breakdown is indispensable for month-end close."
            </p>
            <div className="text-[11px] text-[#71717a]">
              <strong className="text-[#111827] font-semibold">Sarah Jenkins</strong> • Controller, Apex Logistics
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center gap-2 text-xs text-[#71717a]">
          <Lock className="w-3.5 h-3.5 text-[#a1a1aa]" />
          <span>Encrypted data in transit and at rest. Documents are never used to train public models.</span>
        </div>
      </div>

      {/* Right panel - Sign in */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg bg-[#111827] flex items-center justify-center text-white font-bold text-xs">
              AI
            </div>
            <span className="font-semibold text-lg tracking-tight text-[#111827]">
              InvoiceAI
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[#111827]">
              Sign in to your account
            </h2>
            <p className="text-xs text-[#71717a] mt-1.5">
              Access your documents, ledger review workspace, and API keys.
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              variant="outline"
              size="lg"
              className="w-full h-11 text-xs font-semibold gap-3 border-[#e6e6e2] bg-white hover:bg-[#f7f7f5] text-[#111827] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="p-3.5 rounded-lg bg-[#f7f7f5] border border-[#e6e6e2] text-[11px] text-[#71717a] space-y-1">
              <p className="font-medium text-[#111827]">New to InvoiceAI?</p>
              <p>Signing in automatically provisions your free account with 10 monthly document credits.</p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#e6e6e2] text-center space-y-2">
            <p className="text-[11px] text-[#71717a]">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
            <div>
              <Link
                href="/"
                className="text-xs text-[#111827] hover:underline font-medium inline-flex items-center gap-1"
              >
                Return to homepage
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
