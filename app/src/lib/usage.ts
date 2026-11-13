import { db } from "./db";
import { usageLogs, users, apiKeys } from "./db/schema";
import { eq, count, and, gte } from "drizzle-orm";

export const SUBSCRIPTION_LIMITS = {
  free: 100,
  starter: 1000,
  growth: 10000,
  business: 50000,
} as const;

export async function checkUsageLimit(userId: string, subscriptionTier: string) {
  const limit = SUBSCRIPTION_LIMITS[subscriptionTier as keyof typeof SUBSCRIPTION_LIMITS] || SUBSCRIPTION_LIMITS.free;
  
  // Get usage for current month
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  firstDayOfMonth.setHours(0, 0, 0, 0);

  const [result] = await db
    .select({ value: count() })
    .from(usageLogs)
    .where(
      and(
        eq(usageLogs.userId, userId),
        gte(usageLogs.timestamp, firstDayOfMonth)
      )
    );

  return {
    used: Number(result.value),
    limit,
    remaining: Math.max(0, limit - Number(result.value)),
    hasReachedLimit: Number(result.value) >= limit,
  };
}

export async function logUsage(userId: string, apiKeyId: string | null, endpoint: string, status: number) {
  await db.insert(usageLogs).values({
    userId,
    apiKeyId,
    endpoint,
    status,
  });
}
