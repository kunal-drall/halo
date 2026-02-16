import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = [
  "/dashboard",
  "/circles",
  "/trust-score",
  "/profile",
  "/wallet",
  "/governance",
  "/insurance",
  "/yield",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if path is protected
  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  if (isProtected) {
    const session = request.cookies.get("halo_session");
    if (!session?.value) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // Add security headers for API routes
  if (pathname.startsWith("/api/")) {
    const response = NextResponse.next();
    const origin = request.headers.get("origin") || "";
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];
    // In development allow all origins; in production restrict to configured origins
    const corsOrigin =
      process.env.NODE_ENV === "production" && allowedOrigins.length > 0
        ? allowedOrigins.includes(origin) ? origin : allowedOrigins[0]
        : "*";
    response.headers.set("Access-Control-Allow-Origin", corsOrigin);
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|offline.html).*)",
  ],
};
