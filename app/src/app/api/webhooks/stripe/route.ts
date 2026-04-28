import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }

  const session = event.data.object as any;

  if (event.type === "checkout.session.completed") {
    const userId = session.metadata.userId;
    const plan = session.metadata.plan;

    if (userId && plan) {
      await db
        .update(users)
        .set({ subscriptionTier: plan })
        .where(eq(users.id, userId));
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as any;
    // You would typically look up the user by Stripe customer ID
    // For simplicity, we'll need to store stripeCustomerId in the users table
  }

  return NextResponse.json({ received: true });
}
