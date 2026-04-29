import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Zap, 
  Shield, 
  Code, 
  BarChart, 
  ArrowRight, 
  Check, 
  Globe,
  Terminal
} from "lucide-react";
import { PricingCard } from "@/components/pricing-card";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    description: "For small projects and testing.",
    features: ["100 requests/month", "All file types", "Community support", "API Access"],
    cta: "Get Started",
    popular: false
  },
  {
    id: "starter",
    name: "Starter",
    price: "$29",
    description: "For freelancers and startups.",
    features: ["1,000 requests/month", "Priority processing", "Email support", "Advanced analytics"],
    cta: "Choose Starter",
    popular: true
  },
  {
    id: "growth",
    name: "Growth",
    price: "$99",
    description: "For growing companies.",
    features: ["10,000 requests/month", "Custom training", "SLA guarantee", "Dedicated account manager"],
    cta: "Choose Growth",
    popular: false
  }
];

export default async function Home() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  
  if (session?.user?.email && session.user.email !== "local@example.com") {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-violet-500/30">
      {/* Header */}
      <header className="px-6 h-20 flex items-center border-b border-white/5 sticky top-0 bg-black/50 backdrop-blur-xl z-50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">InvoiceAI</span>
        </Link>
        <nav className="ml-auto hidden md:flex gap-8 text-sm font-medium text-zinc-400">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="#api" className="hover:text-white transition-colors">API Docs</Link>
          <Link href="/playground" className="hover:text-white transition-colors text-violet-400">Playground</Link>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-zinc-400 hover:text-white">Sign In</Button>
          </Link>
          <Link href="/login">
            <Button className="bg-white text-black hover:bg-zinc-200 rounded-full px-6">Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-6 pt-24 pb-32 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-violet-600/20 blur-[120px] rounded-full -z-10 opacity-30"></div>
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-violet-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
              </span>
              Now powered by Groq & Llama 3
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
              Automate Invoices with <br className="hidden md:block" /> AI-Powered Precision
            </h1>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              The world's fastest invoice OCR and extraction API. Turn messy receipts and complex invoices into structured data in seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/playground">
                <Button size="lg" className="bg-white text-black hover:bg-zinc-200 rounded-full px-8 h-12 text-base">
                  <Sparkles className="mr-2 w-4 h-4" />
                  Try it Live — No Signup
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-white/10 hover:bg-white/5 rounded-full px-8 h-12 text-base">
                  Get API Key
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="px-6 py-24 bg-white/[0.02] border-y border-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">Built for Modern Businesses</h2>
              <p className="text-zinc-400">Everything you need to handle documents at scale.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Ultra-Fast OCR",
                  description: "Powered by Docling and GPU-accelerated layout analysis for unmatched speed.",
                  icon: Zap
                },
                {
                  title: "AI Structuring",
                  description: "Advanced Llama 3 models extract line items, taxes, and vendor details with 99% accuracy.",
                  icon: Sparkles
                },
                {
                  title: "Developer First",
                  description: "Simple REST API with multi-language support. Integrate in less than 5 minutes.",
                  icon: Code
                },
                {
                  title: "Global Currency Support",
                  description: "Handles USD, EUR, GBP, KHR and dozens of other global currencies out of the box.",
                  icon: Globe
                },
                {
                  title: "Usage Analytics",
                  description: "Detailed breakdown of your API usage, status codes, and throughput in real-time.",
                  icon: BarChart
                },
                {
                  title: "Enterprise Security",
                  description: "Bank-grade encryption for all documents. GDPR and SOC2 ready architecture.",
                  icon: Shield
                }
              ].map((feature, i) => (
                <div key={i} className="p-8 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-violet-500/30 transition-colors group">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-6 group-hover:bg-violet-500/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-violet-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-zinc-400 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* API Preview Section */}
        <section id="api" className="px-6 py-24">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-bold">The API Developers <br /> Love to Use</h2>
              <p className="text-zinc-400 text-lg leading-relaxed">
                No complex SDKs. No proprietary formats. Just a clean REST API that accepts your file and returns beautiful JSON.
              </p>
              <ul className="space-y-4">
                {[
                  "Single endpoint for all document types",
                  "Support for PDF, JPG, PNG, and BMP",
                  "Automated line item extraction",
                  "Detailed usage metrics in headers"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-violet-400" />
                    </div>
                    <span className="text-zinc-300">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/playground">
                <Button size="lg" className="bg-violet-600 hover:bg-violet-500 text-white rounded-full px-8 h-12 text-base">
                  <Sparkles className="mr-2 w-4 h-4" />
                  Try it in the Playground
                </Button>
              </Link>
            </div>
            <div className="rounded-2xl bg-zinc-900 border border-white/10 overflow-hidden shadow-2xl">
              <div className="bg-zinc-800/50 px-4 py-3 flex gap-1.5 border-b border-white/5">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/40"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/40"></div>
              </div>
              <div className="p-6 overflow-x-auto font-mono text-sm">
                <div className="flex gap-4 mb-4">
                  <span className="text-emerald-400">POST</span>
                  <span className="text-zinc-400">/api/v1/extract</span>
                </div>
                <div className="space-y-1">
                  <p className="text-zinc-500">// Resulting JSON</p>
                  <pre className="text-violet-300">
{`{
  "vendor_name": "Cambodia Beverage Company Ltd.",
  "invoice_number": "290013578",
  "date": "2024-01-27",
  "currency": "USD",
  "total_amount": "2439.19",
  "line_items": [
    {
      "description": "Coke Zero Sugar 330ml 24 Sleek CAN SPF",
      "quantity": "39",
      "unit_price": "8.60",
      "total": "334.23"
    },
    {
      "description": "Samurai Mix 330ml 24 Sleek CAN",
      "quantity": "26",
      "unit_price": "8.45",
      "total": "218.92"
    },
    {
      "description": "Samurai Strawberry 330ml 24 Sleek CAN",
      "quantity": "70",
      "unit_price": "5.10",
      "total": "355.60"
    }
  ]
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="px-6 py-24 bg-white/[0.02]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">Simple, Scalable Pricing</h2>
              <p className="text-zinc-400">Start for free and scale as you grow.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan, i) => (
                <PricingCard key={i} plan={plan} isLoggedIn={isLoggedIn} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-32 text-center">
          <div className="max-w-3xl mx-auto space-y-8 bg-gradient-to-br from-violet-600 to-indigo-700 p-12 rounded-[2rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 blur-[80px] rounded-full transition-transform group-hover:scale-110"></div>
            <h2 className="text-4xl font-bold">Ready to automate your documents?</h2>
            <p className="text-violet-100 text-lg">
              Join 500+ businesses who save 20+ hours every week on manual data entry.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="bg-white text-black hover:bg-zinc-200 rounded-full px-8 h-12 text-base">
                  Get Started for Free
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-white">InvoiceAI</span>
            </Link>
            <p className="text-zinc-500 text-sm">© 2026 InvoiceAI Inc. All rights reserved.</p>
          </div>
          <div className="flex gap-8 text-sm text-zinc-400">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="https://github.com" className="hover:text-white transition-colors flex items-center gap-2">
              <Code className="w-4 h-4" />
              GitHub
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
