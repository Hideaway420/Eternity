import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, verifySession } from "@/lib/session";

// Routes reachable without a session: the login page and the login endpoint itself.
const PUBLIC_PATHS = new Set(["/admin/login", "/api/admin/login"]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  if (await verifySession(request.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.next();
  }

  // API callers get a real 401 so the admin UI can react; page routes stay cloaked as 404.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.rewrite(new URL("/not-found", request.url));
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/salon/:path*"],
};
