import React from "react";
import type { Metadata } from "next";

// Middleware gates every /admin route; this layout only keeps admin pages out of search results.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
