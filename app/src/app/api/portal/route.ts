import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { billing } from "@/lib/billing";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [user] = await db
    .select({
      lemonsqueezySubscriptionId: users.lemonsqueezySubscriptionId,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user?.lemonsqueezySubscriptionId) {
    return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
  }

  try {
    const url = await billing.getCustomerPortalUrl(user.lemonsqueezySubscriptionId);
    if (!url) {
      return NextResponse.json({ error: "Failed to generate portal URL" }, { status: 500 });
    }

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error("Portal error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
