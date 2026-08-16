import React from "react";
import Link from "next/link";
import { db, initTables } from "@/db";
import { purchaseOrders } from "@/db/schema";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ShoppingCart, Plus } from "lucide-react";

export const revalidate = 0;

export default async function AdminPurchaseOrdersPage() {
  await initTables();

  const pos = await db.select().from(purchaseOrders).all();

  return (
    <div className="min-h-screen bg-[#F6F2EC] text-on-surface">
      {/* Near-White Global Backend Admin Navigation Bar */}
      <AdminHeader />

      <main className="container mx-auto px-4 lg:px-8 py-10 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold flex items-center">
              <ShoppingCart className="w-7 h-7 text-gold mr-3" /> Purchase Orders & Imports
            </h1>
            <p className="text-xs text-outline mt-1">Landed cost allocation engine (proportional freight + duty + inland distribution)</p>
          </div>

          <button className="px-5 py-3 bg-gold text-on-surface text-xs font-bold rounded-xl hover:bg-gold-hover shadow-gold flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>New Ikonic India PO</span>
          </button>
        </div>

        {/* PO List */}
        <div className="bg-surface-lowest rounded-2xl border border-outline-variant p-6 space-y-4 shadow-soft">
          <h3 className="font-serif font-bold text-base border-b border-outline-variant pb-3">Active Imports</h3>
          
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-surface-low border border-outline-variant/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-sm text-on-surface">PO-2026-0801</span>
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold uppercase text-[10px]">In Transit (Customs)</span>
                </div>
                <p className="text-outline mt-1">Supplier: Ikonic World India • FX Rate: 1.60 (NPR per INR)</p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <span className="block text-outline">Foreign Subtotal: INR 450,000</span>
                  <span className="font-bold text-on-surface block font-mono">Est. Landed: NPR 840,000</span>
                </div>
                <button className="px-4 py-2 bg-gold text-on-surface font-bold rounded-xl hover:bg-gold-hover text-xs">
                  Run Landed Cost Engine
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
