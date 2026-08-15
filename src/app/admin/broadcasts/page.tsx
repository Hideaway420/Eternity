import React from "react";
import Link from "next/link";
import { db, initTables } from "@/db";
import { broadcasts, salonAccounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Send, ShieldAlert } from "lucide-react";

export const revalidate = 0;

export default async function AdminBroadcastsPage() {
  await initTables();

  const optedInAccounts = await db
    .select()
    .from(salonAccounts)
    .where(eq(salonAccounts.broadcast_opt_in, true))
    .all();

  const optedInCount = optedInAccounts.length;

  return (
    <div className="min-h-screen bg-surface-low text-on-surface">
      <header className="bg-surface-lowest border-b border-outline-variant px-6 py-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Link href="/admin" className="font-serif text-xl font-bold hover:text-gold transition-colors">
              ← Staff Operations
            </Link>
            <span className="text-outline">/</span>
            <span className="font-bold text-gold">Salon Community Broadcasts</span>
          </div>

          <span className="text-xs px-3 py-1 bg-green-50 text-green-700 font-bold rounded-full border border-green-200">
            {optedInCount} Opted-In Salon Accounts
          </span>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-8 py-10 space-y-8 max-w-4xl">
        <div>
          <h1 className="font-serif text-3xl font-bold">Compose Salon Broadcast</h1>
          <p className="text-xs text-outline mt-1">Broadcast new Ikonic product shipments directly to Viber / SMS opted-in parlours</p>
        </div>

        {/* Rules Alert */}
        <div className="p-4 rounded-2xl bg-gold/15 border border-gold/40 text-xs space-y-1">
          <div className="flex items-center text-gold font-bold">
            <ShieldAlert className="w-4 h-4 mr-1.5" /> Enforced Broadcast Rules
          </div>
          <p className="text-on-surface-variant">
            1. Only accounts with <strong className="text-on-surface">broadcast_opt_in = true</strong> receive messages.
            <br />
            2. Individual reorder nudges are sent as direct DMs based on <strong className="text-on-surface">next_nudge_at</strong> date, not public broadcasts.
          </p>
        </div>

        {/* Composer Form */}
        <form className="bg-surface-lowest rounded-2xl p-6 border border-outline-variant space-y-6 shadow-soft">
          <div>
            <label className="block text-xs font-semibold text-outline mb-1">Campaign Title</label>
            <input
              type="text"
              placeholder="e.g. New Ikonic Hair Straighteners & Curler Shipment Arrived in Kathmandu!"
              className="w-full bg-surface-low border border-outline-variant rounded-xl p-3 text-sm focus:outline-none focus:border-gold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-outline mb-1">Primary Channel</label>
              <select className="w-full bg-surface-low border border-outline-variant rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-gold">
                <option value="viber">💜 Viber Business (Priority in Nepal)</option>
                <option value="sms">📱 SMS (Sparrow SMS Gateway Fallback)</option>
                <option value="email">📧 Email Newsletter</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-outline mb-1">Target Audience</label>
              <select className="w-full bg-surface-low border border-outline-variant rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-gold">
                <option value="all">All Opted-In Salon Accounts ({optedInCount})</option>
                <option value="gold">Gold Tier Partners Only</option>
                <option value="platinum">Platinum Tier Partners Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-outline mb-1">Message Body (Nepali Romanized / English)</label>
            <textarea
              rows={4}
              placeholder="e.g. Namaste! New Ikonic straightener stock arrived at Kathmandu warehouse. Order now at your 15% Gold Net Price..."
              className="w-full bg-surface-low border border-outline-variant rounded-xl p-3 text-sm focus:outline-none focus:border-gold"
            />
          </div>

          <button
            type="button"
            className="w-full py-4 rounded-xl bg-gold hover:bg-gold-hover text-on-surface font-bold text-sm shadow-gold transition-colors flex justify-center items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Send Broadcast to {optedInCount} Parlours</span>
          </button>
        </form>
      </main>
    </div>
  );
}
