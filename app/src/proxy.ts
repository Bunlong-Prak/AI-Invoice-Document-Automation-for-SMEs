import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const protectedPaths = ["/dashboard", "/upload", "/invoices"];

export default auth((request) => {
  const session = request.auth;
  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  // Bypass authentication redirection for now
  // if (isProtected && !session?.user) {
  //   return NextResponse.redirect(new URL("/login", request.url));
  // }

  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/upload/:path*", "/invoices/:path*", "/login"],
};
