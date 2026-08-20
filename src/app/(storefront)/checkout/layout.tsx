import React from "react";
import type { Metadata } from "next";

// checkout/page.tsx is a 'use client' component (interactive form + cart state), so it cannot
// export `metadata` itself. This sibling server layout is the small wrapper that keeps the
// checkout flow out of search results, same pattern as src/app/admin/layout.tsx.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
