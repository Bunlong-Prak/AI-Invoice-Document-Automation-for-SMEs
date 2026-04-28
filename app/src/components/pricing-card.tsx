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
    <Card className={`bg-white/[0.03] border-white/10 text-white relative flex flex-col ${
      plan.popular ? "border-violet-500 shadow-[0_0_40px_-10px_rgba(139,92,246,0.3)]" : ""
    }`}>
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-violet-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
          Most Popular
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <div className="flex items-baseline gap-1 mt-2">
          <span className="text-4xl font-bold">{plan.price}</span>
          <span className="text-zinc-400">/month</span>
        </div>
        <CardDescription className="text-zinc-400 pt-2">{plan.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 flex-1 flex flex-col justify-between">
        <ul className="space-y-3">
          {plan.features.map((feature, j) => (
            <li key={j} className="flex items-center gap-2 text-sm text-zinc-300">
              <Check className="w-4 h-4 text-violet-400" />
              {feature}
            </li>
          ))}
        </ul>
        <Button 
          onClick={handleCheckout}
          disabled={isLoading}
          className={`w-full rounded-full h-11 mt-6 ${
            plan.popular ? "bg-violet-600 hover:bg-violet-700 text-white" : "bg-white text-black hover:bg-zinc-200"
          }`}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : plan.cta}
        </Button>
      </CardContent>
    </Card>
  );
}
