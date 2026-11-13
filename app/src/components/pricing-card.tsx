"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      className={cn(
        "bg-white border text-slate-900 relative flex flex-col transition-all rounded-lg overflow-visible shadow-xs",
        plan.popular
          ? "border-slate-900 ring-1 ring-slate-900/10"
          : "border-[#e6e6e2] hover:border-slate-300"
      )}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-6 bg-slate-900 text-white text-[11px] font-medium px-2.5 py-0.5 rounded-full shadow-xs">
          Recommended
        </div>
      )}
      <CardHeader className="pt-6 pb-4">
        <CardTitle className="text-lg font-bold tracking-tight text-slate-900">
          {plan.name}
        </CardTitle>
        <div className="flex items-baseline gap-1 mt-3">
          <span className="text-3xl font-bold font-mono tracking-tight text-slate-900">
            {plan.price}
          </span>
          <span className="text-slate-500 text-xs font-normal">/month</span>
        </div>
        <CardDescription className="text-slate-500 pt-2 text-xs leading-relaxed">
          {plan.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 flex-1 flex flex-col justify-between pt-0">
        <ul className="space-y-2.5 border-t border-[#e6e6e2] pt-4">
          {plan.features.map((feature, j) => (
            <li key={j} className="flex items-start gap-2.5 text-xs text-slate-600">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Button
          onClick={handleCheckout}
          disabled={isLoading}
          className={cn(
            "w-full h-10 text-xs font-semibold rounded-md transition-all shadow-xs",
            plan.popular
              ? "bg-slate-900 hover:bg-slate-800 text-white"
              : "bg-stone-100 hover:bg-stone-200 text-slate-900 border border-[#e6e6e2]"
          )}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : plan.cta}
        </Button>
      </CardContent>
    </Card>
  );
}
