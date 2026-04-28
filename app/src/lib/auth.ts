import NextAuth from "next-auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, user.email))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(users).values({
          email: user.email,
          name: user.name ?? null,
          image: user.image ?? null,
        });
      }

      return true;
    },
    async session({ session }) {
      if (session.user?.email) {
        const dbUser = await db
          .select()
          .from(users)
          .where(eq(users.email, session.user.email))
          .limit(1);

        if (dbUser[0]) {
          session.user.id = dbUser[0].id;
        }
      }
      return session;
    },
  },
});

// Bypass authentication with a mock local user
export const auth = async () => ({
  user: {
    id: "00000000-0000-0000-0000-000000000000",
    name: "Local Offline User",
    email: "local@example.com",
    image: "",
  },
});
