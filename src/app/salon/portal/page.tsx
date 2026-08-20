import React from "react";
import Link from "next/link";
import { db, initTables } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatNpr } from "@/lib/money";

export const revalidate = 0;

export default async function SalonPortalPage() {
  await initTables();

  // Explicit columns only. SELECT * would ship cost_npr into the client payload.
  const salonProducts = await db
    .select({
      id: products.id,
      sku: products.sku,
      slug: products.slug,
      name: products.name,
      price_npr: products.price_npr,
      compare_at_npr: products.compare_at_npr,
      line: products.line,
    })
    .from(products)
    .where(eq(products.status, "active"))
    .limit(10)
    .all();

  // Mock Gold Tier Salon Account Context
  const salonAccount = {
    salonName: "Luxe Beauty Parlour & Spa",
    ownerName: "Sunita Shrestha",
    tier: "Gold Tier Partner",
    discountPct: 15,
    creditLimitNpr: 50000000, // Paisa (NPR 500,000)
    creditUsedNpr: 12000000, // Paisa (NPR 120,000)
    creditDays: 30,
    viberOptIn: true,
  };

  return (
    <div className="min-h-screen flex flex-col trade-surface">
      {/* Trade Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md px-6 py-4 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="font-serif text-xl font-bold tracking-tight text-white flex items-center">
              <span className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center text-gold mr-2 text-sm">
                💈
              </span>
              ETERNITY <span className="text-gold ml-1 text-xs uppercase font-sans font-normal tracking-widest">Salon Trade Portal</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <div className="px-3 py-1.5 rounded-full bg-gold/15 text-gold border border-gold/40 font-bold uppercase tracking-wider">
              {salonAccount.tier} ({salonAccount.discountPct}% OFF NET)
            </div>
            <Link href="/" className="text-neutral-400 hover:text-white transition-colors">
              Exit to Retail Site →
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 py-10 container mx-auto px-4 lg:px-8 space-y-10">
        {/* Welcome Header */}
        <div className="trade-card rounded-3xl p-8 border border-neutral-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-gold font-bold">Authenticated Partner Dashboard</span>
            <h1 className="font-serif text-3xl font-bold text-white mt-1">{salonAccount.salonName}</h1>
            <p className="text-xs text-neutral-400 mt-1">Owner: {salonAccount.ownerName} • Registered District: Kathmandu</p>
          </div>

          <div className="flex gap-3">
            <button className="px-4 py-2.5 rounded-xl bg-gold text-on-surface text-xs font-bold shadow-gold hover:bg-gold-hover transition-colors">
              Fast 1-Click Reorder
            </button>
            <button className="px-4 py-2.5 rounded-xl bg-neutral-800 text-white text-xs font-semibold hover:bg-neutral-700 transition-colors">
              Request Furniture Quote
            </button>
          </div>
        </div>

        {/* Credit & Financial Summary (Gold/Platinum Tier Only) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="trade-card p-6 rounded-2xl border border-neutral-800 space-y-2">
            <span className="text-xs text-neutral-400 font-semibold block uppercase">Approved Credit Limit</span>
            <div className="text-2xl font-bold font-mono text-white">{formatNpr(salonAccount.creditLimitNpr)}</div>
            <p className="text-[11px] text-neutral-400">{salonAccount.creditDays}-day net terms activated</p>
          </div>

          <div className="trade-card p-6 rounded-2xl border border-neutral-800 space-y-2">
            <span className="text-xs text-neutral-400 font-semibold block uppercase">Outstanding Credit Used</span>
            <div className="text-2xl font-bold font-mono text-gold">{formatNpr(salonAccount.creditUsedNpr)}</div>
            <p className="text-[11px] text-green-400 font-semibold">Payment due in 18 days</p>
          </div>

          <div className="trade-card p-6 rounded-2xl border border-neutral-800 space-y-2">
            <span className="text-xs text-neutral-400 font-semibold block uppercase">Viber Reorder Broadcasts</span>
            <div className="text-sm font-bold text-white flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2" /> Opted In (+977 9801234567)
            </div>
            <p className="text-[11px] text-neutral-400">Receives exclusive distributor stock drop alerts</p>
          </div>
        </div>

        {/* Trade Catalogue (Displaying Net Tier Prices, NOT Retail Badges) */}
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-gold">Exclusive Trade Wholesale</span>
              <h2 className="font-serif text-2xl font-bold text-white mt-1">Your Net Wholesale Prices</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {salonProducts.map((p) => {
              const netPricePaisa = Math.round(p.price_npr * (1 - salonAccount.discountPct / 100));
              return (
                <div key={p.id} className="trade-card rounded-2xl p-5 border border-neutral-800 hover:border-gold/50 transition-all flex flex-col justify-between">
                  <div>
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-neutral-900 mb-4">
                      <img
                        src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80"
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 bg-gold/90 text-on-surface text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        {salonAccount.discountPct}% Gold Net Price
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">SKU: {p.sku}</span>
                    <h3 className="font-serif font-bold text-base text-white mt-1">{p.name}</h3>
                  </div>

                  <div className="mt-6 pt-4 border-t border-neutral-800 flex items-end justify-between">
                    <div>
                      <div className="text-xs text-neutral-400 line-through font-mono">Retail: {formatNpr(p.price_npr)}</div>
                      <div className="text-xl font-bold text-gold font-sans">{formatNpr(netPricePaisa)}</div>
                    </div>
                    <button className="px-4 py-2 rounded-xl bg-gold text-on-surface font-bold text-xs hover:bg-gold-hover transition-colors">
                      Quick Order
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
