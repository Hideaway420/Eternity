"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function StorefrontError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Storefront error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface px-6 text-center gap-5">
      <h1 className="font-serif text-2xl font-bold text-on-surface">Something went wrong</h1>
      <p className="text-sm text-on-surface-variant max-w-md">
        We could not load this page. Please try again, or message us on WhatsApp and we will help
        you directly.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={reset}
          className="min-h-[44px] px-6 rounded-xl bg-gold hover:bg-gold-hover text-on-surface font-bold text-xs active:scale-[0.98] transition-colors"
        >
          Try again
        </button>
        <a
          href="https://wa.me/9779868089892"
          target="_blank"
          rel="noreferrer"
          className="min-h-[44px] px-6 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs flex items-center justify-center active:scale-[0.98] transition-colors"
        >
          WhatsApp us
        </a>
        <Link
          href="/"
          className="min-h-[44px] px-6 rounded-xl border border-outline-variant font-bold text-xs flex items-center justify-center active:scale-[0.98]"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
