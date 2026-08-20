"use client";

/**
 * One call site for funnel events. Fires to whichever pixels are configured; silently no-ops
 * for the ones that are not. Before this, the site emitted zero events, so no CRO change
 * could be measured and no pricing test could be judged.
 *
 * Values are passed in NPR (not paisa) because that is what ad platforms expect.
 */
type FunnelEvent = "view_item" | "add_to_cart" | "begin_checkout" | "purchase";

interface EventPayload {
  currency?: string;
  value?: number;
  items?: Array<{ id: string; name: string; price: number; quantity?: number }>;
  transaction_id?: string;
}

// GA4 uses the event names above verbatim; Meta and TikTok use their own vocabulary.
const META_EVENTS: Record<FunnelEvent, string> = {
  view_item: "ViewContent",
  add_to_cart: "AddToCart",
  begin_checkout: "InitiateCheckout",
  purchase: "Purchase",
};

const TIKTOK_EVENTS: Record<FunnelEvent, string> = {
  view_item: "ViewContent",
  add_to_cart: "AddToCart",
  begin_checkout: "InitiateCheckout",
  purchase: "CompletePayment",
};

export function track(event: FunnelEvent, payload: EventPayload = {}) {
  if (typeof window === "undefined") return;

  const data = { currency: "NPR", ...payload };
  const w = window as unknown as {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    ttq?: { track?: (...args: unknown[]) => void };
  };

  try {
    w.gtag?.("event", event, data);
    w.fbq?.("track", META_EVENTS[event], { currency: data.currency, value: data.value });
    w.ttq?.track?.(TIKTOK_EVENTS[event], { currency: data.currency, value: data.value });
  } catch {
    // Analytics must never break a purchase.
  }
}
