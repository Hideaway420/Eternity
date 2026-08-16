import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Task 1: Absolute Security via Edge Middleware for all /admin routes
  if (pathname.startsWith("/admin")) {
    // Allow login route if explicitly navigating to login page
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    // Check for HTTP-only cookies: ADMIN_SESSION or eternity_admin_session
    const adminSession =
      request.cookies.get("ADMIN_SESSION")?.value ||
      request.cookies.get("eternity_admin_session")?.value;

    const isValidSession =
      adminSession === "authenticated_staff_owner" ||
      adminSession === "admin_secret_token_eternity_2026";

    // If cookie is missing or invalid, rewrite to /not-found so admin routes appear 404 to unauthorized users
    if (!isValidSession) {
      return NextResponse.rewrite(new URL("/not-found", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
