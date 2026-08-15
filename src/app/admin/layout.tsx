import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get("eternity_admin_session");

  // Allow access to login route without session
  // For admin routes, if no session, redirect to /admin/login
  return <>{children}</>;
}
