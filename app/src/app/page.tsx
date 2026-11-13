import { auth } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  FileText,
  ArrowRight,
  Check,
  Code,
  Shield,
  Layers,
  Sparkles,
  Receipt,
  Download,
  Terminal,
} from "lucide-react";
import { PricingCard } from "@/components/pricing-card";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    description: "For testing and personal side projects.",
    features: [
      "100 document extractions / month",
      "PDFs and high-res receipt images",
      "Line item & tax table extraction",
      "CSV bulk export",
      "Personal API key",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    id: "starter",
    name: "Starter",
    price: "$29",
    description: "For small businesses and independent bookkeepers.",
    features: [
      "1,000 document extractions / month",
      "Full API access with Bearer tokens",
      "Multi-currency normalization (USD, EUR, KHR, GBP)",
      "Interactive field editor & line item recalculation",
      "Priority inference queue",
    ],
    cta: "Start Starter",
    popular: true,
  },
  {
    id: "growth",
    name: "Growth",
    price: "$99",
    description: "For growing accounting firms and logistics teams.",
    features: [
      "10,000 document extractions / month",
      "Custom accounting field mapping",
      "High-throughput concurrent processing",
      "Automated webhook integrations",
      "Dedicated email support",
    ],
    cta: "Start Growth",
    popular: false,
  },
];

export default async function Home() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <div className="flex flex-col min-h-screen bg-[#fbfbfa] text-slate-900 font-sans selection:bg-slate-200">
      {/* Navigation */}
      <header className="px-6 lg:px-12 h-16 flex items-center justify-between border-b border-[#e6e6e2] bg-[#fbfbfa]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-slate-900 flex items-center justify-center text-white shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <span className="font-bold text-base tracking-tight text-slate-900">
              InvoiceAI
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600">
            <Link href="#how-it-works" className="hover:text-slate-950 transition-colors">
              How It Works
            </Link>
            <Link href="#features" className="hover:text-slate-950 transition-colors">
              Features
            </Link>
            <Link href="#api" className="hover:text-slate-950 transition-colors">
              API
            </Link>
            <Link href="#pricing" className="hover:text-slate-950 transition-colors">
              Pricing
            </Link>
            <Link
              href="/playground"
              className="text-slate-900 font-semibold hover:text-slate-700 transition-colors flex items-center gap-1"
            >
              Playground
              <span className="bg-slate-100 text-slate-600 text-[10px] font-medium px-1.5 py-0.2 rounded border border-[#e6e6e2]">
                Demo
              </span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <Link href="/dashboard">
              <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-medium h-9 px-4 rounded-md shadow-xs">
                Dashboard
                <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 text-xs font-medium h-9 px-3">
                  Sign In
                </Button>
              </Link>
              <Link href="/login">
                <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-medium h-9 px-4 rounded-md shadow-xs">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-6 pt-20 pb-24 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#e6e6e2] text-xs text-slate-600 mb-6 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            <span>Multimodal OCR + Vision AI for SMEs</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] max-w-3xl mx-auto">
            Turn supplier invoices into structured data in seconds.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mt-6 leading-relaxed">
            Stop manual bookkeeping. Extract vendor headers, line items, and tax amounts from messy PDFs and receipts with multimodal precision — ready to review and export to CSV.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Link href="/playground">
              <Button size="lg" className="bg-slate-900 text-white hover:bg-slate-800 text-sm font-semibold h-11 px-6 rounded-md shadow-xs">
                <Sparkles className="w-4 h-4 mr-2" />
                Try Interactive Demo
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-[#e6e6e2] bg-white hover:bg-stone-50 text-slate-800 text-sm font-semibold h-11 px-6 rounded-md shadow-xs">
                Sign In with Google
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <p className="text-xs text-slate-400 mt-4">
            Free tier includes 100 extractions every month. No credit card required.
          </p>
        </section>

        {/* Tactile Invoice Transformation Mockup */}
        <section className="px-6 pb-28 max-w-5xl mx-auto">
          <div className="border border-[#e6e6e2] bg-white rounded-xl shadow-xs overflow-hidden">
            {/* Window chrome */}
            <div className="px-4 py-3 bg-[#f7f7f5] border-b border-[#e6e6e2] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                <span className="text-xs font-medium text-slate-500 ml-2">
                  Sample Transformation — Invoice #INV-290013
                </span>
              </div>
              <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                100% Extracted
              </span>
            </div>

            <div className="p-6 lg:p-8 grid md:grid-cols-2 gap-8 items-start bg-white">
              {/* Left: Input Document Preview */}
              <div className="border border-[#e6e6e2] bg-[#fbfbfa] rounded-lg p-6 space-y-4 font-mono text-xs text-slate-600">
                <div className="flex justify-between items-start border-b border-[#e6e6e2] pb-4">
                  <div>
                    <p className="font-bold text-slate-900 text-sm font-sans">
                      Cambodia Beverage Co. Ltd.
                    </p>
                    <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                      142 Monivong Blvd, Phnom Penh
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-semibold text-slate-900">INVOICE</p>
                    <p className="text-[11px] text-slate-500">INV-290013</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-[11px] py-2 border-b border-[#e6e6e2]">
                  <div>
                    <span className="text-slate-400">Date:</span> 2026-04-29
                  </div>
                  <div>
                    <span className="text-slate-400">Currency:</span> USD ($)
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-[11px] text-slate-400 border-b border-dashed border-[#e6e6e2] pb-1">
                    <span>ITEM</span>
                    <span>QTY × RATE</span>
                    <span>TOTAL</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-800">Coke Zero 330ml Can (24pk)</span>
                    <span className="text-slate-500">39 × $8.60</span>
                    <span className="font-semibold text-slate-900">$335.40</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-800">Sprite Lemon-Lime (24pk)</span>
                    <span className="text-slate-500">120 × $8.60</span>
                    <span className="font-semibold text-slate-900">$1,032.00</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-800">Dasani Mineral Water 500ml</span>
                    <span className="text-slate-500">200 × $4.25</span>
                    <span className="font-semibold text-slate-900">$850.00</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#e6e6e2] space-y-1 text-right text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span>$2,217.40</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>VAT (10%):</span>
                    <span>$221.74</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-[#e6e6e2]">
                    <span>Total Due:</span>
                    <span>$2,439.19</span>
                  </div>
                </div>
              </div>

              {/* Right: Extracted Structured Record */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#e6e6e2]">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Extracted Fields
                  </p>
                  <span className="text-xs font-mono text-slate-400">
                    Confidence: 99.4%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-md bg-[#fbfbfa] border border-[#e6e6e2]">
                    <p className="text-[11px] text-slate-500 font-medium">Vendor</p>
                    <p className="font-semibold text-slate-900 mt-0.5 truncate">
                      Cambodia Beverage Co. Ltd.
                    </p>
                  </div>
                  <div className="p-3 rounded-md bg-[#fbfbfa] border border-[#e6e6e2]">
                    <p className="text-[11px] text-slate-500 font-medium">Invoice Number</p>
                    <p className="font-semibold font-mono text-slate-900 mt-0.5">
                      INV-290013
                    </p>
                  </div>
                  <div className="p-3 rounded-md bg-[#fbfbfa] border border-[#e6e6e2]">
                    <p className="text-[11px] text-slate-500 font-medium">Date</p>
                    <p className="font-semibold text-slate-900 mt-0.5">
                      2026-04-29
                    </p>
                  </div>
                  <div className="p-3 rounded-md bg-[#fbfbfa] border border-[#e6e6e2]">
                    <p className="text-[11px] text-slate-500 font-medium">Total Amount</p>
                    <p className="font-semibold font-mono text-emerald-700 mt-0.5">
                      $2,439.19 USD
                    </p>
                  </div>
                </div>

                <div className="border border-[#e6e6e2] rounded-md overflow-hidden bg-white mt-4">
                  <div className="px-3 py-2 bg-[#f7f7f5] border-b border-[#e6e6e2] text-[11px] font-semibold text-slate-600 flex justify-between">
                    <span>Parsed Line Items (3)</span>
                    <span className="text-slate-400">Ready for CSV</span>
                  </div>
                  <div className="divide-y divide-[#e6e6e2] text-xs">
                    <div className="p-2.5 flex justify-between items-center">
                      <span className="truncate max-w-[200px] text-slate-800">Coke Zero 330ml Can</span>
                      <span className="font-mono text-slate-500 text-[11px]">39 pcs</span>
                      <span className="font-mono font-medium text-slate-900">$335.40</span>
                    </div>
                    <div className="p-2.5 flex justify-between items-center">
                      <span className="truncate max-w-[200px] text-slate-800">Sprite Lemon-Lime</span>
                      <span className="font-mono text-slate-500 text-[11px]">120 pcs</span>
                      <span className="font-mono font-medium text-slate-900">$1,032.00</span>
                    </div>
                    <div className="p-2.5 flex justify-between items-center">
                      <span className="truncate max-w-[200px] text-slate-800">Dasani Mineral Water</span>
                      <span className="font-mono text-slate-500 text-[11px]">200 pcs</span>
                      <span className="font-mono font-medium text-slate-900">$850.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="px-6 py-20 border-t border-[#e6e6e2] bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-xl mx-auto mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                How InvoiceAI Works
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                A simple three-step pipeline designed to replace manual bookkeeping entry.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 rounded-lg border border-[#e6e6e2] bg-[#fbfbfa] space-y-3">
                <div className="w-8 h-8 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h3 className="font-bold text-base text-slate-900">Upload Documents</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Drop digital PDFs, scanned receipts, phone snapshots, or multi-page supplier statements directly into your dashboard or via API.
                </p>
              </div>

              <div className="p-6 rounded-lg border border-[#e6e6e2] bg-[#fbfbfa] space-y-3">
                <div className="w-8 h-8 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h3 className="font-bold text-base text-slate-900">Multimodal AI Extraction</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Llama 3.3 and Llama 3.2 Vision extract vendor details, currency, issue dates, and full line item tables in under two seconds.
                </p>
              </div>

              <div className="p-6 rounded-lg border border-[#e6e6e2] bg-[#fbfbfa] space-y-3">
                <div className="w-8 h-8 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <h3 className="font-bold text-base text-slate-900">Review & Export</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Edit fields inline with auto-sanitization, recalculate lines, and download standardized CSV exports ready for QuickBooks or Excel.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section id="features" className="px-6 py-20 border-t border-[#e6e6e2] bg-[#fbfbfa]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-xl mx-auto mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Built for Accurate Accounting
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Engineered for financial accuracy without the complexity.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-lg border border-[#e6e6e2] bg-white space-y-2 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <Receipt className="w-4 h-4 text-slate-900" />
                  Itemized Line Item Parsing
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Unlike basic OCR tools that only capture total balance, InvoiceAI captures the complete item table with description, quantity, unit price, and extended line totals.
                </p>
              </div>

              <div className="p-6 rounded-lg border border-[#e6e6e2] bg-white space-y-2 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <Layers className="w-4 h-4 text-slate-900" />
                  Multi-Currency & VAT/GST Normalization
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Native handling of USD, EUR, KHR, GBP, and global currency codes. Standardizes dates to ISO-8601 and formats decimal points cleanly.
                </p>
              </div>

              <div className="p-6 rounded-lg border border-[#e6e6e2] bg-white space-y-2 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <Code className="w-4 h-4 text-slate-900" />
                  Programmatic Developer REST API
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Integrate automated extraction into your custom invoicing pipelines with a single cURL call using personal bearer API tokens.
                </p>
              </div>

              <div className="p-6 rounded-lg border border-[#e6e6e2] bg-white space-y-2 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <Shield className="w-4 h-4 text-slate-900" />
                  Private Storage & Automatic Cleanup
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Documents are stored in tenant-isolated directories with automatic deletion of physical files when records are removed.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* API Section */}
        <section id="api" className="px-6 py-20 border-t border-[#e6e6e2] bg-white">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Simple, Predictable REST API
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Connect your logistics software, ERP, or internal scripts in minutes. Send a multipart form with your invoice file and receive clean, typed JSON in return.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Bearer token authentication with instant revocation</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Automatic handling of PDFs, JPG, PNG, and TIFF</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Remaining quota headers included on every response</span>
                </li>
              </ul>
              <div className="pt-2">
                <Link href="/settings/keys">
                  <Button variant="outline" size="sm" className="text-xs border-[#e6e6e2] shadow-xs">
                    Get an API Key
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Clean Code Preview */}
            <div className="border border-[#e6e6e2] rounded-lg overflow-hidden bg-[#fbfbfa] text-xs font-mono shadow-xs">
              <div className="px-4 py-2.5 bg-[#f7f7f5] border-b border-[#e6e6e2] flex items-center justify-between text-slate-500">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-slate-500" />
                  <span>POST /api/v1/extract</span>
                </div>
                <span>HTTP 200 OK</span>
              </div>
              <div className="p-4 space-y-3 overflow-x-auto text-slate-800 leading-relaxed">
                <p className="text-slate-400"># Request</p>
                <p className="text-slate-700 bg-white p-2.5 rounded border border-[#e6e6e2]">
                  curl -X POST https://your-domain.com/api/v1/extract \<br />
                  &nbsp;&nbsp;-H &quot;Authorization: Bearer inv_live_...&quot; \<br />
                  &nbsp;&nbsp;-F &quot;file=@invoice_001.pdf&quot;
                </p>
                <p className="text-slate-400 pt-1"># Response JSON</p>
                <pre className="text-slate-900 bg-white p-2.5 rounded border border-[#e6e6e2] text-[11px]">
{`{
  "success": true,
  "data": {
    "vendor_name": "Acme Industrial Supplies",
    "invoice_number": "INV-2026-9042",
    "date": "2026-04-15",
    "currency": "USD",
    "total_amount": "1425.50",
    "tax_amount": "129.59",
    "line_items": [
      {
        "description": "Hydraulic Filter 24mm",
        "quantity": "5",
        "unit_price": "180.00",
        "total": "900.00"
      }
    ]
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="px-6 py-20 border-t border-[#e6e6e2] bg-[#fbfbfa]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-xl mx-auto mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Straightforward Pricing
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                No hidden fees. Upgrade or cancel anytime directly from your dashboard.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan, i) => (
                <PricingCard key={i} plan={plan} isLoggedIn={isLoggedIn} />
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="px-6 py-20 border-t border-[#e6e6e2] bg-white">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Start automating your invoice entry today.
            </h2>
            <p className="text-sm text-slate-600 max-w-xl mx-auto">
              Join accounting teams and small businesses that save hours every week on invoice and receipt transcription.
            </p>
            <div className="pt-2">
              <Link href="/login">
                <Button size="lg" className="bg-slate-900 text-white hover:bg-slate-800 text-sm font-semibold h-11 px-8 rounded-md shadow-xs">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-6 lg:px-12 py-12 border-t border-[#e6e6e2] bg-[#fbfbfa] text-xs text-slate-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-slate-900 flex items-center justify-center text-white">
              <FileText className="w-3 h-3" />
            </div>
            <span className="font-semibold text-slate-900">InvoiceAI</span>
            <span>— Document Automation for SMEs</span>
          </div>
          <div className="flex items-center gap-6 text-slate-600">
            <Link href="/playground" className="hover:text-slate-900 transition-colors">
              Playground
            </Link>
            <Link href="#pricing" className="hover:text-slate-900 transition-colors">
              Pricing
            </Link>
            <Link href="/settings/keys" className="hover:text-slate-900 transition-colors">
              API
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
