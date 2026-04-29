"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PricingCardProps {
  plan: {
    name: string;
    price: string;
    description: string;
    features: string[];
    cta: string;
    popular: boolean;
    id: string;
  };
  isLoggedIn: boolean;
}

export function PricingCard({ plan, isLoggedIn }: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    if (plan.id === "free") {
      router.push("/dashboard");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: plan.id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Failed to start checkout");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`bg-[#0a0a0a] border-white/[0.05] text-white relative flex flex-col transition-all hover:border-white/10 overflow-visible ${
      plan.popular ? "border-violet-500/50 ring-1 ring-violet-500/20" : ""
    }`}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[10px] font-mono font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-violet-400/30 shadow-[0_0_20px_rgba(139,92,246,0.3)] z-10">
          Optimal Choice
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-xl tracking-tight font-semibold">{plan.name}</CardTitle>
        <div className="flex items-baseline gap-1 mt-2">
          <span className="text-4xl font-bold font-mono tracking-tighter">{plan.price}</span>
          <span className="text-zinc-500 text-sm font-medium">/month</span>
        </div>
        <CardDescription className="text-zinc-500 pt-2 text-sm leading-relaxed">{plan.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 flex-1 flex flex-col justify-between">
        <ul className="space-y-3">
          {plan.features.map((feature, j) => (
            <li key={j} className="flex items-center gap-2 text-sm text-zinc-400">
              <Check className="w-3.5 h-3.5 text-emerald-500/80" />
              {feature}
            </li>
          ))}
        </ul>
        <Button 
          onClick={handleCheckout}
          disabled={isLoading}
          className={`w-full rounded-full h-11 mt-6 font-semibold transition-all ${
            plan.popular 
              ? "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/20" 
              : "bg-white text-black hover:bg-zinc-200"
          }`}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : plan.cta}
        </Button>
      </CardContent>
    </Card>
  );
}
