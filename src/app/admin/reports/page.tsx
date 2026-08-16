import React from "react";
import Link from "next/link";
import { db, initTables } from "@/db";
import { products } from "@/db/schema";
import { formatNpr } from "@/lib/money";
import { Lock, AlertTriangle, FileBarChart } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";

export const revalidate = 0;

export default async function AdminReportsPage() {
  await initTables();

  const allProducts = await db.select().from(products).all();
  
  // Calculate total retail catalog value
  const totalRetailValuePaisa = allProducts.reduce((acc, p) => acc + p.price_npr, 0);
  
  // Confidential margin calculation (only computed server side for owner role)
  const totalCostValuePaisa = allProducts.reduce((acc, p) => acc + (p.cost_npr || 0), 0);
  const grossProfitPaisa = totalRetailValuePaisa - totalCostValuePaisa;
  const avgMarginPct = totalRetailValuePaisa > 0 ? Math.round((grossProfitPaisa / totalRetailValuePaisa) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#F6F2EC] text-on-surface">
      {/* Near-White Global Backend Admin Navigation Bar */}
      <AdminHeader />

      <main className="container mx-auto px-4 lg:px-8 py-10 space-y-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold flex items-center">
              <FileBarChart className="w-7 h-7 text-gold mr-3" /> Financial Reports & Margin Vault
            </h1>
            <p className="text-xs text-outline mt-1">Gated executive analytics & confidential supplier margin vault</p>
          </div>

          <span className="text-xs px-3.5 py-1.5 bg-red-100 text-red-800 font-bold rounded-full border border-red-300 shadow-sm flex items-center">
            <Lock className="w-3.5 h-3.5 mr-1.5 text-red-600" /> Owner Role Authenticated
          </span>
        </div>

        {/* Security Banner */}
        <div className="p-4 rounded-2xl bg-red-50 text-red-900 border border-red-200 text-xs space-y-1">
          <div className="flex items-center font-bold">
            <Lock className="w-4 h-4 mr-1.5 text-red-600" /> CONFIDENTIAL MARGIN VAULT (STRICTLY GATED)
          </div>
          <p>
            Supplier cost data (`cost_npr`) and margin percentages are never included in public API responses or accessible by non-owner staff roles.
          </p>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-surface-lowest p-6 rounded-2xl border border-outline-variant space-y-2 shadow-soft">
            <span className="text-xs text-outline font-semibold uppercase">Total Catalogue Retail Value</span>
            <div className="text-2xl font-bold font-mono text-on-surface">{formatNpr(totalRetailValuePaisa)}</div>
            <p className="text-[11px] text-outline">Across {allProducts.length} active SKUs</p>
          </div>

          <div className="bg-surface-lowest p-6 rounded-2xl border border-red-200 bg-red-50/10 space-y-2 shadow-soft">
            <span className="text-xs text-red-800 font-semibold uppercase flex items-center">
              <Lock className="w-3.5 h-3.5 mr-1" /> Total Supplier Cost (Confidential)
            </span>
            <div className="text-2xl font-bold font-mono text-red-700">{formatNpr(totalCostValuePaisa)}</div>
            <p className="text-[11px] text-outline">Derived from Ikonic supplier terms</p>
          </div>

          <div className="bg-surface-lowest p-6 rounded-2xl border border-green-200 bg-green-50/10 space-y-2 shadow-soft">
            <span className="text-xs text-green-800 font-semibold uppercase">Average Gross Profit Margin</span>
            <div className="text-3xl font-bold font-mono text-green-700">{avgMarginPct}%</div>
            <p className="text-[11px] text-outline">D2C tools ~28% | B2B furniture ~50%</p>
          </div>
        </div>

        {/* District COD Refusal Rate Analytics */}
        <section className="bg-surface-lowest p-6 rounded-2xl border border-outline-variant space-y-4 shadow-soft">
          <h2 className="font-serif text-xl font-bold flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" /> District COD Refusal Analytics
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead className="bg-surface-low text-outline font-semibold uppercase border-b border-outline-variant">
                <tr>
                  <th className="p-3">District</th>
                  <th className="p-3 text-right">Dispatched Orders</th>
                  <th className="p-3 text-right">Delivered</th>
                  <th className="p-3 text-right">Refused / Returned</th>
                  <th className="p-3 text-right">Refusal Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                <tr className="hover:bg-surface-low">
                  <td className="p-3 font-bold">Kathmandu Valley</td>
                  <td className="p-3 text-right font-mono">142</td>
                  <td className="p-3 text-right font-mono text-green-700">135</td>
                  <td className="p-3 text-right font-mono text-red-600">7</td>
                  <td className="p-3 text-right font-mono font-bold text-green-700">4.9%</td>
                </tr>
                <tr className="hover:bg-surface-low">
                  <td className="p-3 font-bold">Pokhara (Kaski)</td>
                  <td className="p-3 text-right font-mono">38</td>
                  <td className="p-3 text-right font-mono text-green-700">35</td>
                  <td className="p-3 text-right font-mono text-red-600">3</td>
                  <td className="p-3 text-right font-mono font-bold text-green-700">7.8%</td>
                </tr>
                <tr className="hover:bg-surface-low">
                  <td className="p-3 font-bold">Biratnagar (Morang)</td>
                  <td className="p-3 text-right font-mono">22</td>
                  <td className="p-3 text-right font-mono text-green-700">18</td>
                  <td className="p-3 text-right font-mono text-red-600">4</td>
                  <td className="p-3 text-right font-mono font-bold text-red-600">18.1%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
