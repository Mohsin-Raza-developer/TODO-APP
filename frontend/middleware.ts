/**
 * Next.js Middleware for Route Protection
 *
 * Implements first line of defense for protected routes (triple-layer security)
 *
 * Security Layers:
 * 1. Middleware (this file) - Fast cookie-based redirect
 * 2. Server Components - Full session verification with database
 * 3. Client Hooks - Reactive UI (conditional rendering)
 *
 * Features:
 * - Checks for Better Auth session cookie (lightweight)
 * - Redirects unauthenticated users to /login
 * - Protects /dashboard/* routes
 * - Preserves original URL for post-login redirect
 *
 * Performance:
 * - Runs on Edge runtime (fast, minimal latency)
 * - No database queries (cookie check only)
 * - Server components verify actual session validity
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware function
 *
 * Runs before every request matching the config matcher
 *
 * @param request - Next.js request object
 * @returns Response (redirect or next)
 */
export async function middleware(request: NextRequest) {
  const isProtectedRoute = request.nextUrl.pathname.startsWith("/dashboard");

  if (isProtectedRoute) {
    // Check for Better Auth session cookie (lightweight check)
    // Better Auth stores session in cookie named 'better-auth.session_token'
    const sessionCookie = request.cookies.get("better-auth.session_token");

    // Redirect to login if no session cookie found
    if (!sessionCookie) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Cookie exists - let request proceed
    // Server component will verify actual session validity with database
  }

  // Allow request to proceed
  return NextResponse.next();
}

/**
 * Middleware configuration
 *
 * Specifies which routes this middleware applies to
 */
export const config = {
  matcher: [
    "/dashboard/:path*", // All dashboard routes
  ],
};
