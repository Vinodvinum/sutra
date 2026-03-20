import { NextRequest, NextResponse } from "next/server";

const PROTECTED_MATCH = [
  "/dashboard",
  "/circles",
  "/intel",
  "/brahma",
  "/finance",
  "/identity",
];

export function middleware(request: NextRequest) {
  const hasSession = request.cookies.get("sutra_session")?.value === "1";
  const path = request.nextUrl.pathname;
  const requiresAuth = PROTECTED_MATCH.some((route) => path === route || path.startsWith(`${route}/`));

  if (requiresAuth && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if ((path === "/login" || path === "/signup") && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/circles/:path*", "/intel/:path*", "/brahma/:path*", "/finance/:path*", "/identity/:path*", "/login", "/signup"],
};
