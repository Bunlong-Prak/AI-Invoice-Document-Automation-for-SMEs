import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { checkUsageLimit, SUBSCRIPTION_LIMITS } from "@/lib/usage";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [user] = await db
    .select({ subscriptionTier: users.subscriptionTier })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const tier = user?.subscriptionTier || "free";
  const usage = await checkUsageLimit(session.user.id, tier);

  return NextResponse.json({
    tier,
    used: usage.used,
    limit: usage.limit,
    remaining: usage.remaining,
    hasReachedLimit: usage.hasReachedLimit,
  });
}
