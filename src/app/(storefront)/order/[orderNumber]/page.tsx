import React from "react";
import Link from "next/link";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { db, initTables } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatNpr } from "@/lib/money";
import { CheckCircle2, Clock, Truck, Package, ShieldCheck } from "lucide-react";

export const revalidate = 0;

interface OrderTrackingPageProps {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ phone?: string }>;
}

export default async function OrderTrackingPage({ params, searchParams }: OrderTrackingPageProps) {
  await initTables();
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const orderNum = resolvedParams.orderNumber;
  const order = await db.select().from(orders).where(eq(orders.order_number, orderNum)).get();

  const currentStatus = order ? order.status : "confirmed";

  const steps = [
    { key: "pending", label: "Order Placed", icon: Clock },
    { key: "confirmed", label: "COD Call Verified", icon: CheckCircle2 },
    { key: "packed", label: "Packed & Sealed", icon: Package },
    { key: "dispatched", label: "Out for Delivery", icon: Truck },
    { key: "delivered", label: "Delivered", icon: ShieldCheck },
  ];

  const currentStepIdx = steps.findIndex((s) => s.key === currentStatus);
  const activeIdx = currentStepIdx >= 0 ? currentStepIdx : 1;

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
          <div className="py-6 border-y border-outline-variant/60">
            <div className="grid grid-cols-5 gap-2 text-center">
              {steps.map((step, idx) => {
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

          {/* Status Alert Box */}
          <div className="p-5 rounded-2xl bg-surface-low border border-outline-variant/60 text-xs space-y-2">
            <h4 className="font-serif font-bold text-sm text-on-surface">Current Status: {currentStatus.toUpperCase()}</h4>
            <p className="text-on-surface-variant">
              Your parcel is assigned to our Kathmandu central dispatch team. Our courier will contact your phone before arrival. Open the outer box to inspect your Ikonic unit before making payment.
            </p>
          </div>

          <div className="flex justify-between items-center text-xs text-outline">
            <Link href="/" className="hover:underline">← Back to Eternity Shop</Link>
            <a href="tel:+9779801234567" className="font-bold text-gold hover:underline">Need Support? Call +977 9801234567</a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
