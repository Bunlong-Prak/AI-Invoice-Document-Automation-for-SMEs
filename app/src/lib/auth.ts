import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
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
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
});
