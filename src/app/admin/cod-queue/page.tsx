import React from "react";
import Link from "next/link";
import { db, initTables } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatNpr } from "@/lib/money";
import { PhoneCall, Check, X, PhoneOff, AlertTriangle } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";

export const revalidate = 0;

export default async function CodQueuePage() {
  await initTables();

  const pendingCodOrders = await db
    .select({
      id: orders.id,
      orderNumber: orders.order_number,
      totalNpr: orders.total_npr,
      placedAt: orders.placed_at,
      status: orders.status,
      district: orders.courier,
      notes: orders.notes,
    })
    .from(orders)
    .where(eq(orders.payment_method, "cod"))
    .all();

  // Priority COD queue rows
  const queueData = [
    {
      id: "ord-sample-1",
      orderNumber: "ETP-984120",
      customerName: "Rajan Maharjan",
      phone: "+977 9841234567",
      itemsSummary: "Ikonic Professional Hair Straightener x 1",
      totalNpr: 1292000,
      district: "Kathmandu",
      historyTag: "new" as const,
      attempts: 0,
    },
    {
      id: "ord-sample-2",
      orderNumber: "ETP-985210",
      customerName: "Anu Shrestha",
      phone: "+977 9851098765",
      itemsSummary: "Ikonic Pro Blow Dryer 2500W x 1",
      totalNpr: 850000,
      district: "Pokhara",
      historyTag: "repeat" as const,
      attempts: 1,
    },
    {
      id: "ord-sample-3",
      orderNumber: "ETP-981100",
      customerName: "Bikash Gurung",
      phone: "+977 9812345678",
      itemsSummary: "Ikonic Reclining Barber Chair x 1",
      totalNpr: 18493000,
      district: "Biratnagar",
      historyTag: "previously_refused" as const,
      attempts: 2,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6F2EC] text-on-surface">
      {/* Near-White Global Backend Admin Navigation Bar */}
      <AdminHeader pendingCodCount={queueData.length} />

      <main className="container mx-auto px-4 lg:px-8 py-10 space-y-6">
        <div>
          <h1 className="font-serif text-3xl font-bold flex items-center">
            <PhoneCall className="w-7 h-7 text-gold mr-3" /> COD Confirmation Call Center
          </h1>
          <p className="text-xs text-outline mt-1">
            Calling and confirming COD orders before dispatch reduces Nepal courier refusal rates by 40%.
          </p>
        </div>

        {/* Priority Call List */}
        <div className="space-y-4">
          {queueData.map((item) => (
            <div
              key={item.id}
              className={`bg-surface-lowest rounded-2xl p-6 border shadow-soft flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 ${
                item.historyTag === "previously_refused"
                  ? "border-red-300 bg-red-50/20"
                  : "border-outline-variant"
              }`}
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-3">
                  <span className="font-serif font-bold text-lg font-mono text-on-surface">
                    {item.orderNumber}
                  </span>
                  
                  {item.historyTag === "new" && (
                    <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase">
                      New Customer
                    </span>
                  )}
                  {item.historyTag === "repeat" && (
                    <span className="px-2.5 py-0.5 rounded-md bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold uppercase">
                      Repeat Customer (Verified)
                    </span>
                  )}
                  {item.historyTag === "previously_refused" && (
                    <span className="px-2.5 py-0.5 rounded-md bg-red-100 text-red-800 border border-red-300 text-[10px] font-bold uppercase flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-1 text-red-600" /> High Refusal Risk
                    </span>
                  )}
                </div>

                <div className="text-xs text-on-surface-variant space-y-1">
                  <div>
                    <strong>Customer:</strong> {item.customerName} •{" "}
                    <a
                      href={`tel:${item.phone}`}
                      className="font-mono text-gold font-bold hover:underline text-sm"
                    >
                      📞 {item.phone} (Click to Call)
                    </a>
                  </div>
                  <div>
                    <strong>District:</strong> {item.district} | <strong>Items:</strong> {item.itemsSummary}
                  </div>
                  <div>
                    <strong>Order Total:</strong> <span className="font-mono font-bold text-on-surface">{formatNpr(item.totalNpr)}</span> |{" "}
                    <strong>Call Attempts:</strong> {item.attempts}/3
                  </div>
                </div>
              </div>

              {/* Call Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <button className="px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs flex items-center shadow-sm">
                  <Check className="w-4 h-4 mr-1.5" /> Confirmed
                </button>
                <button className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center shadow-sm">
                  <PhoneOff className="w-4 h-4 mr-1.5" /> Could Not Reach ({item.attempts + 1})
                </button>
                <button className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center shadow-sm">
                  <X className="w-4 h-4 mr-1.5" /> Cancel Order
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
