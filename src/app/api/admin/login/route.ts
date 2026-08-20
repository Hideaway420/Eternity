import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, SESSION_COOKIE_OPTIONS, signSession } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const expectedUser = process.env.ADMIN_USERNAME;
    const expectedPassword = process.env.ADMIN_PASSWORD;

    // Fail closed. No hardcoded fallback credentials.
    if (!expectedUser || !expectedPassword || !process.env.ADMIN_SESSION_SECRET) {
      console.error("Admin login blocked: ADMIN_USERNAME, ADMIN_PASSWORD or ADMIN_SESSION_SECRET is unset.");
      return NextResponse.json(
        { success: false, error: "Admin login is not configured on this deployment." },
        { status: 503 }
      );
    }

    const cleanUser = String(username ?? "").trim().toLowerCase();
    const isUserValid = cleanUser === expectedUser.trim().toLowerCase();

    if (isUserValid && password === expectedPassword) {
      const token = await signSession();
      if (!token) {
        return NextResponse.json({ success: false, error: "Session signing unavailable." }, { status: 503 });
      }

      const cookieStore = await cookies();
      cookieStore.set(ADMIN_COOKIE, token, SESSION_COOKIE_OPTIONS);

      return NextResponse.json({ success: true, message: "Login successful!" });
    }

    return NextResponse.json(
      { success: false, error: "Invalid username or password." },
      { status: 401 }
    );
  } catch {
    // Never echo raw error text to the client.
    return NextResponse.json({ success: false, error: "Login failed." }, { status: 500 });
  }
}
