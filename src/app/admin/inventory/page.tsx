import React from "react";
import Link from "next/link";
import { db, initTables } from "@/db";
import { inventory, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Boxes, Plus } from "lucide-react";

export const revalidate = 0;

export default async function AdminInventoryPage() {
  await initTables();

  const stockItems = await db
    .select({
      id: inventory.id,
      productName: products.name,
      sku: products.sku,
      line: products.line,
      priceNpr: products.price_npr,
      qtyOnHand: inventory.qty_on_hand,
      qtyReserved: inventory.qty_reserved,
      reorderPoint: inventory.reorder_point,
    })
    .from(inventory)
    .innerJoin(products, eq(inventory.product_id, products.id))
    .all();

  return (
    <div className="min-h-screen bg-[#F6F2EC] text-on-surface">
      {/* Near-White Global Backend Admin Navigation Bar */}
      <AdminHeader />

      <main className="container mx-auto px-4 lg:px-8 py-10 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold flex items-center">
              <Boxes className="w-7 h-7 text-gold mr-3" /> Warehouse Stock Counts & Ledger
            </h1>
            <p className="text-xs text-outline mt-1">Kathmandu Central Warehouse Stock Control & Multi-Location Auditing</p>
          </div>

          <button className="px-5 py-3 bg-gold text-on-surface text-xs font-bold rounded-xl hover:bg-gold-hover shadow-gold flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Stock Adjustment</span>
          </button>
        </div>

        {/* Stock Counts Table */}
        <div className="bg-surface-lowest rounded-2xl border border-outline-variant overflow-hidden shadow-soft">
          <div className="p-4 bg-surface-low border-b border-outline-variant font-serif font-bold text-sm">
            Current Physical Inventory Level
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[600px]">
              <thead className="bg-surface-low text-outline font-semibold uppercase tracking-wider border-b border-outline-variant">
                <tr>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Line</th>
                  <th className="p-3 text-right">On Hand</th>
                  <th className="p-3 text-right">Reserved</th>
                  <th className="p-3 text-right">Available</th>
                  <th className="p-3 text-right">Reorder Point</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {stockItems.map((item) => {
                  const available = (item.qtyOnHand || 0) - (item.qtyReserved || 0);
                  const isLow = available <= (item.reorderPoint || 0);
                  return (
                    <tr key={item.id} className="hover:bg-surface-low/50">
                      <td className="p-3 font-mono font-bold text-outline">{item.sku}</td>
                      <td className="p-3 font-medium text-on-surface">{item.productName}</td>
                      <td className="p-3 font-semibold uppercase text-[10px]">
                        <span className={`px-2 py-0.5 rounded ${item.line === "profit" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"}`}>
                          {item.line}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold">{item.qtyOnHand}</td>
                      <td className="p-3 text-right font-mono text-outline">{item.qtyReserved}</td>
                      <td className={`p-3 text-right font-mono font-bold ${isLow ? "text-red-600" : "text-green-700"}`}>
                        {available}
                      </td>
                      <td className="p-3 text-right font-mono text-outline">{item.reorderPoint}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
