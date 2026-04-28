import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiKeys } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { generateApiKey } from "@/lib/api-keys";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keys = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.userId, session.user.id))
    .orderBy(apiKeys.createdAt);

  return NextResponse.json({ keys });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name } = body;

    const key = generateApiKey();

    const [newKey] = await db
      .insert(apiKeys)
      .values({
        userId: session.user.id,
        key,
        name: name || "New Key",
      })
      .returning();

    return NextResponse.json({ key: newKey });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create key" }, { status: 500 });
  }
}
