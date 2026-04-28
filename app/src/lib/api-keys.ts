import { randomBytes } from "node:crypto";
import { db } from "./db";
import { apiKeys } from "./db/schema";
import { eq, and } from "drizzle-orm";

export function generateApiKey() {
  const bytes = randomBytes(32);
  return `inv_${bytes.toString("hex")}`;
}

export async function validateApiKey(key: string) {
  const result = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.key, key), eq(apiKeys.isActive, 1)))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  // Update last used at
  await db
    .update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, result[0].id));

  return result[0];
}
