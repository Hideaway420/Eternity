import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const expectedUser = process.env.ADMIN_USERNAME || "admin";
    const expectedPhone = "9868089892";
    const expectedPassword = process.env.ADMIN_PASSWORD || "eternity2026";

    const cleanUser = (username || "").trim().toLowerCase();
    const isUserValid =
      cleanUser === expectedUser ||
      cleanUser === expectedPhone ||
      cleanUser === `+977${expectedPhone}` ||
      cleanUser === "eternity";

    if (isUserValid && password === expectedPassword) {
      const cookieStore = await cookies();
      cookieStore.set("eternity_admin_session", "authenticated_staff_owner", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days session
      });

      return NextResponse.json({ success: true, message: "Login successful!" });
    }

    return NextResponse.json(
      { success: false, error: "Invalid username/phone or password." },
      { status: 401 }
    );
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
