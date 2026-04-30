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
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center transition-transform group-hover:rotate-6">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
          <span className="font-bold text-xl tracking-tighter">InvoiceAI</span>
        </Link>
        <nav className="ml-12 hidden md:flex gap-10 text-[12px] font-mono uppercase tracking-[0.15em] text-zinc-500">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="#api" className="hover:text-white transition-colors">API</Link>
          <Link href="/playground" className="text-violet-400 hover:text-violet-300 transition-colors tracking-[0.2em] font-bold">Playground</Link>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/5 text-xs font-semibold rounded-full px-6">Sign In</Button>
          </Link>
          <Link href="/login">
            <Button className="bg-white text-black hover:bg-zinc-200 rounded-full px-8 h-10 text-xs font-bold transition-all hover:scale-[1.05] active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-6 pt-24 pb-36 border-b border-white/[0.05] relative overflow-hidden">
          {/* Mesh Gradient Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[120px] rounded-full animate-pulse"></div>
            <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-indigo-600/10 blur-[100px] rounded-full"></div>
          </div>
          
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center relative z-10">
            <div className="space-y-12 text-left">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-[10px] font-mono uppercase tracking-[0.25em] text-violet-400 shadow-inner">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                </span>
                Engine v4.2 // Llama 3.1
              </div>
              <h1 className="text-7xl md:text-[92px] font-bold tracking-[-0.04em] text-white leading-[0.85]">
                High-Fidelity <br /> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/40">Invoice</span> <br /> 
                Automation.
              </h1>
              <p className="text-xl text-zinc-400 max-w-md leading-relaxed font-medium">
                The world's fastest extraction API. <br />
                Turn any document into structured <br />
                JSON data in less than 2 seconds.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-5 pt-4">
                <Link href="/playground">
                  <Button size="lg" className="bg-white text-black hover:bg-zinc-200 rounded-full px-12 h-14 text-base font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl">
                    <Sparkles className="mr-2.5 w-4 h-4" />
                    Try Playground
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/5 rounded-full px-10 h-14 text-base font-semibold group">
                    View API Docs
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Visual Side */}
            <div className="relative group">
              <div className="absolute inset-0 bg-violet-500/10 blur-[120px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
              <div className="relative rounded-3xl bg-[#0a0a0a] border border-white/10 p-2.5 shadow-2xl transition-transform duration-700 hover:scale-[1.01]">
                <div className="rounded-2xl bg-black border border-white/[0.05] overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05] bg-white/[0.02]">
                    <div className="flex gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/40"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/40"></div>
                    </div>
                    <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Live Extraction Preview</div>
                  </div>
                  <div className="p-10 space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em]">Status</div>
                        <div className="text-xs font-mono text-emerald-400 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                          READY_FOR_UPLOAD
                        </div>
                      </div>
                      <div className="text-right space-y-1.5">
                        <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em]">Latency</div>
                        <div className="text-xs font-mono text-white tracking-tighter">1.2s</div>
                      </div>
                    </div>
                    
                    <div className="rounded-2xl border border-dashed border-white/10 p-16 flex flex-col items-center justify-center gap-5 bg-white/[0.01] group-hover:bg-white/[0.03] group-hover:border-white/20 transition-all cursor-pointer">
                      <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <UploadCloud className="w-6 h-6 text-zinc-400" />
                      </div>
                      <div className="text-[11px] font-mono text-zinc-500 group-hover:text-zinc-300 transition-colors uppercase tracking-widest">DROP_INVOICE_HERE</div>
                    </div>

                    <div className="pt-6 border-t border-white/[0.05] grid grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em]">Tokens_Used</div>
                        <div className="text-xs font-mono text-zinc-500 italic">Calculating...</div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em]">Extraction_ID</div>
                        <div className="text-xs font-mono text-zinc-400">INV-8829-PX</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -bottom-8 -right-8 p-5 rounded-3xl bg-zinc-900/90 backdrop-blur-xl border border-white/10 shadow-2xl hidden md:block group-hover:translate-y-[-4px] transition-transform duration-500">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <Check className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white tracking-tight">99.8% Accuracy</div>
                    <div className="text-[10px] text-zinc-500 font-mono tracking-wider">VERIFIED_LLM_OUTPUT</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="px-6 py-32 border-b border-white/[0.05] bg-white/[0.01]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-6 mb-24">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Precision Infrastructure</h2>
              <p className="text-zinc-500 font-medium text-lg">Built for accuracy at massive scale.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
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
                <div key={i} className="p-10 rounded-3xl bg-[#0a0a0a] border border-white/[0.05] hover:border-violet-500/40 hover:bg-white/[0.02] transition-all duration-500 group flex flex-col justify-between h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/5 blur-[40px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-10">
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 group-hover:border-violet-500/30 transition-all">
                        <feature.icon className="w-5 h-5 text-violet-400" />
                      </div>
                      <span className="text-[10px] font-mono tracking-[0.2em] text-zinc-600 group-hover:text-violet-400 transition-colors">{feature.tag}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-4 tracking-tight group-hover:text-white transition-colors">{feature.title}</h3>
                    <p className="text-zinc-500 text-[15px] leading-relaxed group-hover:text-zinc-400 transition-colors">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* API Preview Section */}
        <section id="api" className="px-6 py-40 bg-black relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-violet-500/5 blur-[160px] rounded-full pointer-events-none"></div>
          <div className="max-w-7xl mx-auto grid lg:grid-cols-5 gap-24 items-start relative z-10">
            <div className="lg:col-span-2 space-y-10 sticky top-40">
              <h2 className="text-5xl md:text-6xl font-bold tracking-tighter leading-[0.95]">Built for <br /> <span className="text-violet-500">Developers.</span></h2>
              <p className="text-zinc-400 text-lg leading-relaxed font-medium">
                No complex SDKs. No proprietary formats. Just a clean REST API that accepts your file and returns beautiful, structured JSON.
              </p>
              <ul className="space-y-6">
                {[
                  "Single endpoint for all document types",
                  "Support for PDF, JPG, PNG, and BMP",
                  "Automated line item extraction",
                  "Real-time usage metrics in headers"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-5 group">
                    <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-violet-500/50 transition-all duration-300">
                      <Check className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-zinc-300 font-medium group-hover:text-white transition-colors">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="lg:col-span-3 space-y-8">
              <div className="rounded-[2rem] bg-[#0a0a0a] border border-white/10 overflow-hidden shadow-2xl transition-all duration-700 hover:shadow-violet-500/10 hover:border-white/20">
                <div className="bg-white/[0.03] px-6 py-5 flex items-center justify-between border-b border-white/[0.05]">
                  <div className="flex gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/40 border border-red-500/20"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/40 border border-amber-500/20"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/40 border border-emerald-500/20"></div>
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2.5">
                    <Terminal className="w-3.5 h-3.5" />
                    bash — extract.sh
                  </div>
                </div>
                <div className="p-10 overflow-x-auto font-mono text-[14px] leading-relaxed">
                  <div className="flex gap-5 mb-8 items-center bg-white/[0.03] w-fit px-4 py-1.5 rounded-full border border-white/5">
                    <span className="text-emerald-400 font-bold tracking-tighter">POST</span>
                    <span className="text-zinc-500 tracking-tight">https://api.invoiceai.com/v1/extract</span>
                  </div>
                  <div className="space-y-6">
                    <div className="text-zinc-600 italic">// Request</div>
                    <div className="p-6 rounded-2xl bg-black border border-white/[0.05] text-violet-300/90 shadow-inner">
                      curl -X POST -H "Authorization: Bearer sk_live_..." \\ <br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-F "file=@invoice_001.pdf"
                    </div>
                    
                    <div className="text-zinc-600 italic pt-4">// Response (200 OK)</div>
                    <div className="p-6 rounded-2xl bg-black border border-white/[0.05] shadow-inner">
                      <pre className="text-emerald-400/90 leading-loose">
{`{
  "vendor": "Cambodia Beverage Co.",
  "invoice_id": "INV-290013",
  "total": 2439.19,
  "currency": "USD",
  "line_items": [
    { 
      "desc": "Coke Zero 330ml", 
      "qty": 39, 
      "price": 8.60 
    }
  ]
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="p-8 rounded-[2rem] bg-[#0a0a0a] border border-white/10 space-y-3 group hover:border-violet-500/30 transition-all">
                  <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em] group-hover:text-violet-400 transition-colors">Speed</div>
                  <div className="text-3xl font-bold text-white tracking-tighter">120ms</div>
                  <div className="text-[10px] text-zinc-500 font-mono">AVG_PROCESSING_TIME</div>
                </div>
                <div className="p-8 rounded-[2rem] bg-[#0a0a0a] border border-white/10 space-y-3 group hover:border-violet-500/30 transition-all">
                  <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em] group-hover:text-violet-400 transition-colors">Uptime</div>
                  <div className="text-3xl font-bold text-white tracking-tighter">99.99%</div>
                  <div className="text-[10px] text-zinc-500 font-mono">SLA_GUARANTEED</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="px-6 py-32 bg-white/[0.02]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-6 mb-24">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Simple, Precise Pricing</h2>
              <p className="text-zinc-400 text-lg">Scalable plans for businesses of all sizes.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-10">
              {plans.map((plan, i) => (
                <PricingCard key={i} plan={plan} isLoggedIn={isLoggedIn} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-40 text-center relative overflow-hidden">
          <div className="max-w-4xl mx-auto space-y-10 bg-gradient-to-br from-violet-600 via-indigo-700 to-violet-800 p-20 rounded-[3rem] shadow-[0_0_100px_rgba(139,92,246,0.2)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[30rem] h-[30rem] bg-white/10 blur-[100px] rounded-full transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-12"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[20rem] h-[20rem] bg-black/20 blur-[80px] rounded-full transition-transform duration-1000 group-hover:scale-125"></div>
            
            <h2 className="text-5xl md:text-6xl font-bold tracking-tighter leading-tight relative z-10">Ready to automate <br /> your documents?</h2>
            <p className="text-violet-100/80 text-xl font-medium max-w-xl mx-auto relative z-10">
              Join 500+ businesses who save 20+ hours every week on manual data entry.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6 relative z-10">
              <Link href="/login">
                <Button size="lg" className="bg-white text-black hover:bg-zinc-100 rounded-full px-12 h-14 text-lg font-bold shadow-2xl transition-all hover:scale-105 active:scale-95">
                  Get Started for Free
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-8 py-24 border-t border-white/[0.05] bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-16">
          <div className="flex flex-col items-center md:items-start gap-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
              <span className="font-bold text-2xl tracking-tighter text-white">InvoiceAI</span>
            </Link>
            <p className="text-zinc-600 text-[11px] font-mono uppercase tracking-[0.3em]">© 2026 InvoiceAI Inc. // Precision_Automation_v4</p>
          </div>
          <div className="flex gap-16 text-[12px] font-mono uppercase tracking-[0.2em] text-zinc-500">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="https://github.com" className="hover:text-white transition-colors flex items-center gap-2.5 group">
              <Code className="w-4 h-4 group-hover:text-violet-400" />
              GitHub
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
