import React from "react";
import Link from "next/link";
import { db, initTables } from "@/db";
import { inventory, products, stockMovements } from "@/db/schema";
import { eq } from "drizzle-orm";

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

  const recentMovements = await db.select().from(stockMovements).limit(10).all();

  return (
    <div className="min-h-screen bg-surface-low text-on-surface">
      <header className="bg-surface-lowest border-b border-outline-variant px-6 py-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Link href="/admin" className="font-serif text-xl font-bold hover:text-gold transition-colors">
              ← Staff Operations
            </Link>
            <span className="text-outline">/</span>
            <span className="font-bold text-gold">Warehouse & Inventory Ledger</span>
          </div>

          <button className="px-4 py-2 bg-gold text-on-surface text-xs font-bold rounded-xl hover:bg-gold-hover">
            + Stock Adjustment
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-8 py-10 space-y-10">
        <div>
          <h1 className="font-serif text-3xl font-bold">Stock Counts & Ledger</h1>
          <p className="text-xs text-outline mt-1">Kathmandu Central Warehouse Stock Control</p>
        </div>

        {/* Stock Counts Table */}
        <div className="bg-surface-lowest rounded-2xl border border-outline-variant overflow-hidden shadow-soft">
          <div className="p-4 bg-surface-low border-b border-outline-variant font-serif font-bold text-sm">
            Current Inventory Level
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
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
