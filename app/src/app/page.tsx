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
  Terminal,
  UploadCloud
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
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-violet-500/30 font-sans">
      {/* Header */}
      <header className="px-8 h-20 flex items-center border-b border-white/[0.05] sticky top-0 bg-black/80 backdrop-blur-xl z-50">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
          <span className="font-bold text-xl tracking-tighter">InvoiceAI</span>
        </Link>
        <nav className="ml-12 hidden md:flex gap-8 text-[11px] font-mono uppercase tracking-widest text-zinc-500">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="#api" className="hover:text-white transition-colors">API</Link>
          <Link href="/playground" className="text-violet-400 hover:text-violet-300 transition-colors tracking-[0.2em]">Playground</Link>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-zinc-500 hover:text-white text-xs font-semibold">Sign In</Button>
          </Link>
          <Link href="/login">
            <Button className="bg-white text-black hover:bg-zinc-200 rounded-full px-6 h-10 text-xs font-bold transition-all hover:scale-[1.05]">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-6 pt-20 pb-32 border-b border-white/[0.05] relative overflow-hidden">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-[10px] font-mono uppercase tracking-[0.2em] text-violet-400">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-violet-500"></span>
                </span>
                Engine v4.2 // Llama 3.1
              </div>
              <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-white leading-[0.9]">
                High-Fidelity <br /> Invoice <br /> Automation.
              </h1>
              <p className="text-xl text-zinc-500 max-w-lg leading-relaxed font-medium">
                The world's fastest extraction API. <br />
                Turn any document into structured <br />
                JSON data in less than 2 seconds.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                <Link href="/playground">
                  <Button size="lg" className="bg-white text-black hover:bg-zinc-200 rounded-full px-10 h-14 text-base font-bold transition-all hover:scale-[1.02] active:scale-[0.98]">
                    <Sparkles className="mr-2 w-4 h-4" />
                    Try Playground
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="ghost" className="text-zinc-400 hover:text-white rounded-full px-8 h-14 text-base font-semibold">
                    View API Docs
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Visual Side */}
            <div className="relative group">
              <div className="absolute inset-0 bg-violet-500/5 blur-[100px] rounded-full group-hover:bg-violet-500/10 transition-colors"></div>
              <div className="relative rounded-2xl bg-[#0a0a0a] border border-white/10 p-2 shadow-2xl">
                <div className="rounded-xl bg-black border border-white/[0.05] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05] bg-white/[0.02]">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-white/10"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-white/10"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-white/10"></div>
                    </div>
                    <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Live Extraction Preview</div>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Status</div>
                        <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                          READY_FOR_UPLOAD
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Latency</div>
                        <div className="text-xs font-mono text-white tracking-tighter">1.2s</div>
                      </div>
                    </div>
                    
                    <div className="rounded-xl border border-dashed border-white/10 p-12 flex flex-col items-center justify-center gap-4 bg-white/[0.01] group-hover:bg-white/[0.02] transition-colors">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                        <UploadCloud className="w-5 h-5 text-zinc-500" />
                      </div>
                      <div className="text-xs font-mono text-zinc-500">DROP_INVOICE_HERE</div>
                    </div>

                    <div className="pt-4 border-t border-white/[0.05] grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Tokens_Used</div>
                        <div className="text-xs font-mono text-zinc-400 italic">Calculating...</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Extraction_ID</div>
                        <div className="text-xs font-mono text-zinc-400">INV-8829-PX</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -right-6 p-4 rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl hidden md:block">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Check className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white tracking-tight">99.8% Accuracy</div>
                    <div className="text-[10px] text-zinc-500 font-mono">VERIFIED_LLM_OUTPUT</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="px-6 py-24 border-b border-white/[0.05]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl font-bold tracking-tight">Precision Infrastructure</h2>
              <p className="text-zinc-500 font-medium">Built for accuracy at massive scale.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Ultra-Fast OCR",
                  description: "GPU-accelerated layout analysis for matching speed with Llama 3.",
                  icon: Zap,
                  tag: "ENGINE"
                },
                {
                  title: "AI Structuring",
                  description: "Complex line items and vendor details parsed into valid JSON.",
                  icon: Sparkles,
                  tag: "LOGIC"
                },
                {
                  title: "Developer First",
                  description: "Stateless REST API with multi-language support. Deploy in minutes.",
                  icon: Code,
                  tag: "API"
                },
                {
                  title: "Global Reach",
                  description: "Full currency support including USD, EUR, GBP, and KHR.",
                  icon: Globe,
                  tag: "CURRENCY"
                },
                {
                  title: "Usage Analytics",
                  description: "Real-time metrics for throughput, latency, and success rates.",
                  icon: BarChart,
                  tag: "METRICS"
                },
                {
                  title: "SOC2 Compliance",
                  description: "Bank-grade encryption and secure document lifecycle management.",
                  icon: Shield,
                  tag: "SECURITY"
                }
              ].map((feature, i) => (
                <div key={i} className="p-8 rounded-xl bg-[#0a0a0a] border border-white/[0.05] hover:border-violet-500/50 transition-all group flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <feature.icon className="w-5 h-5 text-violet-400" />
                      <span className="text-[9px] font-mono tracking-widest text-zinc-600 group-hover:text-violet-500 transition-colors">{feature.tag}</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-3 tracking-tight">{feature.title}</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* API Preview Section */}
        <section id="api" className="px-6 py-32">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-5 gap-16 items-start">
            <div className="lg:col-span-2 space-y-8 sticky top-32">
              <h2 className="text-5xl font-bold tracking-tighter leading-tight">Built for <br /> Developers.</h2>
              <p className="text-zinc-500 text-lg leading-relaxed">
                No complex SDKs. No proprietary formats. Just a clean REST API that accepts your file and returns beautiful, structured JSON.
              </p>
              <ul className="space-y-5">
                {[
                  "Single endpoint for all document types",
                  "Support for PDF, JPG, PNG, and BMP",
                  "Automated line item extraction",
                  "Real-time usage metrics in headers"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 group">
                    <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-violet-500/50 transition-colors">
                      <Check className="w-3 h-3 text-emerald-400" />
                    </div>
                    <span className="text-zinc-300 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="lg:col-span-3 space-y-6">
              <div className="rounded-2xl bg-[#0a0a0a] border border-white/10 overflow-hidden shadow-2xl">
                <div className="bg-white/[0.03] px-5 py-4 flex items-center justify-between border-b border-white/[0.05]">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/40"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/40"></div>
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Terminal className="w-3 h-3" />
                    bash — extract.sh
                  </div>
                </div>
                <div className="p-8 overflow-x-auto font-mono text-[13px] leading-relaxed">
                  <div className="flex gap-4 mb-6 items-center">
                    <span className="text-emerald-400 font-bold">POST</span>
                    <span className="text-zinc-400 tracking-tight">https://api.invoiceai.com/v1/extract</span>
                  </div>
                  <div className="space-y-4">
                    <div className="text-zinc-500 italic">// Request</div>
                    <div className="p-4 rounded-lg bg-black border border-white/[0.05] text-violet-300">
                      curl -X POST -H "Authorization: Bearer sk_live_..." \\ <br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-F "file=@invoice_001.pdf"
                    </div>
                    
                    <div className="text-zinc-500 italic pt-4">// Response (200 OK)</div>
                    <div className="p-4 rounded-lg bg-black border border-white/[0.05]">
                      <pre className="text-emerald-400/90">
{`{
  "vendor": "Cambodia Beverage Co.",
  "invoice_id": "INV-290013",
  "total": 2439.19,
  "currency": "USD",
  "line_items": [
    { "desc": "Coke Zero 330ml", "qty": 39, "price": 8.60 }
  ]
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/10 space-y-2">
                  <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Speed</div>
                  <div className="text-2xl font-bold text-white tracking-tighter">120ms</div>
                  <div className="text-[10px] text-zinc-500">AVG_PROCESSING_TIME</div>
                </div>
                <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/10 space-y-2">
                  <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Uptime</div>
                  <div className="text-2xl font-bold text-white tracking-tighter">99.99%</div>
                  <div className="text-[10px] text-zinc-500">SLA_GUARANTEED</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="px-6 py-24 bg-white/[0.02]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Simple, Precise Pricing</h2>
              <p className="text-zinc-400">Scalable plans for businesses of all sizes.</p>
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
      <footer className="px-8 py-16 border-t border-white/[0.05] bg-[#050505]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex flex-col items-center md:items-start gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded bg-white flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-black" />
              </div>
              <span className="font-bold text-lg tracking-tighter text-white">InvoiceAI</span>
            </Link>
            <p className="text-zinc-600 text-[10px] font-mono uppercase tracking-widest">© 2026 InvoiceAI Inc. // Precision_Automation_v4</p>
          </div>
          <div className="flex gap-12 text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-500">
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
