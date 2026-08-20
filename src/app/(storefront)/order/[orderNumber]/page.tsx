import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { db, initTables } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatNpr } from "@/lib/money";
import { CheckCircle2, Clock, Truck, Package, ShieldCheck, XCircle } from "lucide-react";

export const revalidate = 0;

// Order pages are personalised to one customer's order and must never be indexed.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

interface OrderTrackingPageProps {
  params: Promise<{ orderNumber: string }>;
}

const STEPS = [
  { key: "pending", label: "Order Placed", icon: Clock },
  { key: "confirmed", label: "COD Call Verified", icon: CheckCircle2 },
  { key: "packed", label: "Packed & Sealed", icon: Package },
  { key: "dispatched", label: "Out for Delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: ShieldCheck },
];

export default async function OrderTrackingPage({ params }: OrderTrackingPageProps) {
  const resolvedParams = await params;
  const orderNum = resolvedParams.orderNumber;

  // A public route: if the orders table hasn't been migrated onto this deployment yet, fail
  // to a real "not found" state instead of 500-ing for every visitor.
  let order: typeof orders.$inferSelect | undefined;
  let items: (typeof orderItems.$inferSelect)[] = [];
  try {
    await initTables();
    order = await db.select().from(orders).where(eq(orders.order_number, orderNum)).get();
    if (order) {
      items = await db.select().from(orderItems).where(eq(orderItems.order_id, order.id)).all();
    }
  } catch (err) {
    console.error("Error loading order:", err);
    order = undefined;
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-surface text-on-surface">
        <Header />
        <main className="flex-1 py-12 container mx-auto px-4 lg:px-8 max-w-4xl">
          <div className="bg-surface-lowest rounded-3xl p-8 sm:p-10 border border-outline-variant shadow-soft text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8" />
            </div>
            <h1 className="font-serif text-2xl font-bold">Order Not Found</h1>
            <p className="text-sm text-outline">
              We could not find an order matching <strong className="font-mono text-on-surface">#{orderNum}</strong>.
              Double check the order number, or contact us if you believe this is a mistake.
            </p>
            <div className="flex justify-center gap-4 pt-2">
              <Link href="/" className="px-6 py-3 rounded-xl bg-gold text-on-surface font-bold text-xs shadow-gold hover:bg-gold-hover transition-colors">
                Back to Eternity Shop
              </Link>
              <a
                href="https://wa.me/9779868089892"
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-xl bg-surface-container text-on-surface font-semibold text-xs border border-outline-variant"
              >
                Contact Support
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentStatus = order.status;
  const currentStepIdx = STEPS.findIndex((s) => s.key === currentStatus);
  const isTerminalIssue = currentStatus === "cancelled" || currentStatus === "returned";
  const activeIdx = currentStepIdx >= 0 ? currentStepIdx : 0;

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      <Header />

      <main className="flex-1 py-12 container mx-auto px-4 lg:px-8 max-w-4xl">
        <div className="bg-surface-lowest rounded-3xl p-8 sm:p-10 border border-outline-variant shadow-soft space-y-8">
          <div>
            <span className="text-xs font-mono text-gold font-bold uppercase tracking-widest block">Live Order Tracking</span>
            <h1 className="font-serif text-3xl font-bold mt-1">Order #{orderNum}</h1>
            <p className="text-xs text-outline mt-1">Guest tracking active — No account login required</p>
          </div>

          {/* Stepper Bar */}
          {!isTerminalIssue && (
            <div className="py-6 border-y border-outline-variant/60">
              <div className="grid grid-cols-5 gap-2 text-center">
                {STEPS.map((step, idx) => {
                  const IconComp = step.icon;
                  const isCompleted = idx <= activeIdx;
                  return (
                    <div key={step.key} className="space-y-2">
                      <div
                        className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center text-xs font-bold transition-all ${
                          isCompleted ? "bg-gold text-on-surface shadow-gold" : "bg-surface-low text-outline border border-outline-variant"
                        }`}
                      >
                        <IconComp className="w-5 h-5" />
                      </div>
                      <span className={`text-[11px] font-semibold block leading-tight ${isCompleted ? "text-on-surface" : "text-outline"}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Status Alert Box */}
          <div className={`p-5 rounded-2xl border text-xs space-y-2 ${isTerminalIssue ? "bg-red-50 border-red-200" : "bg-surface-low border-outline-variant/60"}`}>
            <h4 className="font-serif font-bold text-sm text-on-surface">Current Status: {currentStatus.toUpperCase()}</h4>
            <p className="text-on-surface-variant">
              {isTerminalIssue
                ? "This order was cancelled or returned. Contact us on WhatsApp if you have questions."
                : "Your parcel is assigned to our Kathmandu central dispatch team. Our courier will contact your phone before arrival. Open the outer box to inspect your Ikonic unit before making payment."}
            </p>
          </div>

          {/* Order Items & Totals */}
          <div className="p-5 rounded-2xl bg-surface-low border border-outline-variant/60 text-xs space-y-3">
            <h4 className="font-serif font-bold text-sm text-on-surface">Order Items</h4>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span className="text-outline">
                    {item.qty}x {item.name_snapshot} <span className="font-mono">({item.sku_snapshot})</span>
                  </span>
                  <span className="font-mono text-on-surface">{formatNpr(item.line_total_npr)}</span>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-outline-variant space-y-1.5">
              <div className="flex justify-between text-outline">
                <span>Subtotal</span>
                <span className="font-mono">{formatNpr(order.subtotal_npr)}</span>
              </div>
              <div className="flex justify-between text-outline">
                <span>Delivery</span>
                <span className="font-mono">{order.delivery_npr === 0 ? "FREE" : formatNpr(order.delivery_npr || 0)}</span>
              </div>
              <div className="flex justify-between font-bold text-on-surface pt-1.5 border-t border-outline-variant">
                <span>Total ({order.payment_method?.toUpperCase()})</span>
                <span className="font-mono text-gold text-sm">{formatNpr(order.total_npr)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs text-outline">
            <Link href="/" className="hover:underline">← Back to Eternity Shop</Link>
            <a href="https://wa.me/9779868089892" target="_blank" rel="noreferrer" className="font-bold text-gold hover:underline">
              Need Support? WhatsApp +977 9868089892
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
