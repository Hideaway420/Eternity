import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifySession } from "@/lib/session";

/**
 * Guard for route handlers and server actions. Middleware alone does not cover them.
 * Returns a 401 response to return early, or null when the caller is authenticated.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const ok = await verifySession(cookieStore.get(ADMIN_COOKIE)?.value);
  if (ok) return null;
  return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
}
