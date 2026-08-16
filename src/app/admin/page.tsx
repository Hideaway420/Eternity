import React from "react";
import Link from "next/link";
import { db, initTables } from "@/db";
import { orders, inventory, products } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { formatNpr } from "@/lib/money";
import { PhoneCall, AlertTriangle, ArrowRight } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  await initTables();

  const allOrders = await db.select().from(orders).all();
  const pendingCodOrders = allOrders.filter((o) => o.status === "pending" && o.payment_method === "cod");
  
  const lowStockItems = await db
    .select({
      id: inventory.id,
      productName: products.name,
      sku: products.sku,
      qtyOnHand: inventory.qty_on_hand,
      reorderPoint: inventory.reorder_point,
    })
    .from(inventory)
    .innerJoin(products, eq(inventory.product_id, products.id))
    .where(sql`${inventory.qty_on_hand} <= ${inventory.reorder_point}`)
    .all();

  return (
    <div className="min-h-screen bg-[#F6F2EC] text-on-surface">
      {/* Near-White Global Backend Admin Navigation Bar */}
      <AdminHeader pendingCodCount={pendingCodOrders.length} />

      <main className="container mx-auto px-4 lg:px-8 py-10 space-y-10">
        <div>
          <span className="text-xs uppercase tracking-widest text-gold font-bold">Operations Hub</span>
          <h1 className="font-serif text-3xl font-bold mt-1">Daily Operations Overview</h1>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-surface-lowest p-6 rounded-2xl border border-outline-variant space-y-2 shadow-soft">
            <span className="text-xs text-outline font-semibold uppercase">Pending COD Confirmation</span>
            <div className="text-3xl font-bold font-mono text-gold">{pendingCodOrders.length}</div>
            <Link href="/admin/cod-queue" className="text-xs text-gold font-bold hover:underline inline-flex items-center">
              Open Queue <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>

          <div className="bg-surface-lowest p-6 rounded-2xl border border-outline-variant space-y-2 shadow-soft">
            <span className="text-xs text-outline font-semibold uppercase">Total Platform Orders</span>
            <div className="text-3xl font-bold font-mono text-on-surface">{allOrders.length}</div>
            <p className="text-[11px] text-outline">Across D2C & B2B channels</p>
          </div>

          <div className="bg-surface-lowest p-6 rounded-2xl border border-outline-variant space-y-2 shadow-soft">
            <span className="text-xs text-outline font-semibold uppercase">Low Stock Reorder Alerts</span>
            <div className="text-3xl font-bold font-mono text-red-600">{lowStockItems.length}</div>
            <p className="text-[11px] text-outline">Below safety stock thresholds</p>
          </div>

          <div className="bg-surface-lowest p-6 rounded-2xl border border-outline-variant space-y-2 shadow-soft">
            <span className="text-xs text-outline font-semibold uppercase">Catalog Product Manager</span>
            <div className="text-3xl font-bold font-mono text-on-surface">Manage</div>
            <Link href="/admin/products" className="text-xs text-gold font-bold hover:underline inline-flex items-center mt-1">
              Add & Edit Catalog <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
        </div>

        {/* Priority COD Confirmation Queue Teaser */}
        <section className="bg-surface-lowest p-6 rounded-2xl border border-gold/40 shadow-soft space-y-4">
          <div className="flex justify-between items-center border-b border-outline-variant pb-4">
            <div>
              <h2 className="font-serif text-xl font-bold flex items-center">
                <PhoneCall className="w-5 h-5 mr-2 text-gold" /> Priority COD Confirmation Queue
              </h2>
              <p className="text-xs text-outline mt-0.5">Staff phone confirmation is required before COD orders transition to Confirmed status</p>
            </div>
            <Link href="/admin/cod-queue" className="px-4 py-2 bg-gold text-on-surface text-xs font-bold rounded-xl hover:bg-gold-hover">
              Open Full COD Queue
            </Link>
          </div>

          {pendingCodOrders.length === 0 ? (
            <p className="text-xs text-outline py-4 text-center">No pending COD orders requiring phone confirmation.</p>
          ) : (
            <div className="divide-y divide-outline-variant/60 text-xs">
              {pendingCodOrders.slice(0, 5).map((o) => (
                <div key={o.id} className="py-3 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-on-surface font-mono">{o.order_number}</span>
                    <span className="mx-2 text-outline">•</span>
                    <span className="text-on-surface-variant font-semibold">Dist: {o.courier || "Kathmandu"}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-on-surface font-mono">{formatNpr(o.total_npr)}</span>
                    <Link href="/admin/cod-queue" className="px-3 py-1 bg-surface-low rounded-lg font-bold hover:bg-gold hover:text-on-surface transition-colors">
                      Call Customer
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Low Stock Reorder Alerts Box */}
        <section className="bg-surface-lowest p-6 rounded-2xl border border-outline-variant space-y-4">
          <div className="flex justify-between items-center border-b border-outline-variant pb-4">
            <h2 className="font-serif text-xl font-bold flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-600" /> Low Stock Reorder Alerts
            </h2>
          </div>

          <div className="divide-y divide-outline-variant/60 text-xs">
            {lowStockItems.map((item) => (
              <div key={item.id} className="py-3 flex justify-between items-center">
                <div>
                  <span className="font-bold text-on-surface">{item.productName}</span>
                  <span className="mx-2 text-outline">({item.sku})</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-red-600 font-bold">Qty: {item.qtyOnHand} (Reorder at {item.reorderPoint})</span>
                  <button className="px-3 py-1 bg-gold text-on-surface font-bold rounded-lg hover:bg-gold-hover text-[11px]">
                    1-Click Create PO
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
