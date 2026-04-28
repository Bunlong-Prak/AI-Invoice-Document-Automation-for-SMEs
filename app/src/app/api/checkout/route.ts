import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { billing, SubscriptionTier } from "@/lib/billing";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { plan } = await request.json();
    
    const validTiers: Exclude<SubscriptionTier, "free">[] = ["starter", "growth", "business"];
    
    if (!plan || !validTiers.includes(plan as any)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const { url } = await billing.createCheckoutSession(
      session.user.id,
      session.user.email,
      plan as Exclude<SubscriptionTier, "free">
    );

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
