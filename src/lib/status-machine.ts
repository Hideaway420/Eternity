import { db } from "@/db";
import { orders, orderItems, stockMovements } from "@/db/schema";
import { eq } from "drizzle-orm";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "dispatched"
  | "delivered"
  | "cancelled"
  | "returned";

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["packed", "cancelled"],
  packed: ["dispatched", "cancelled"],
  dispatched: ["delivered", "returned"],
  delivered: [],
  cancelled: [],
  returned: [],
};

export async function transitionOrderStatus(
  orderId: string,
  targetStatus: OrderStatus,
  staffUserId?: string
): Promise<{ success: boolean; message?: string }> {
  const order = await db.select().from(orders).where(eq(orders.id, orderId)).get();
  if (!order) {
    return { success: false, message: "Order not found" };
  }

  const currentStatus = order.status as OrderStatus;
  const allowed = VALID_TRANSITIONS[currentStatus];

  if (!allowed || !allowed.includes(targetStatus)) {
    return {
      success: false,
      message: `Invalid status transition from ${currentStatus} to ${targetStatus}`,
    };
  }

  // COD confirmation requirement rule
  if (targetStatus === "confirmed" && order.payment_method === "cod" && !order.cod_confirmed_at) {
    return {
      success: false,
      message: "COD orders require phone confirmation before moving to confirmed status",
    };
  }

  const now = new Date().toISOString();
  const items = await db.select().from(orderItems).where(eq(orderItems.order_id, orderId)).all();
  const defaultWarehouseId = "wh-main";

  // Stock Deduction on dispatched
  if (targetStatus === "dispatched") {
    for (const item of items) {
      // Stock movement ledger entry
      await db.insert(stockMovements)
        .values({
          id: `sm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          product_id: item.product_id,
          variant_id: item.variant_id,
          warehouse_id: defaultWarehouseId,
          type: "sale",
          qty_delta: -item.qty,
          ref_type: "order",
          ref_id: orderId,
          unit_cost_npr: item.unit_cost_npr,
          reason: `Sale order ${order.order_number}`,
          created_by: staffUserId || "system",
          created_at: now,
        });
    }
  }

  // Stock Return on returned
  if (targetStatus === "returned") {
    for (const item of items) {
      await db.insert(stockMovements)
        .values({
          id: `sm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          product_id: item.product_id,
          variant_id: item.variant_id,
          warehouse_id: defaultWarehouseId,
          type: "return",
          qty_delta: item.qty,
          ref_type: "order",
          ref_id: orderId,
          unit_cost_npr: item.unit_cost_npr,
          reason: `Return order ${order.order_number}`,
          created_by: staffUserId || "system",
          created_at: now,
        });
    }
  }

  // Update order record
  const updatePayload: Record<string, any> = { status: targetStatus };
  if (targetStatus === "dispatched") updatePayload.dispatched_at = now;
  if (targetStatus === "delivered") updatePayload.delivered_at = now;
  if (targetStatus === "cancelled") updatePayload.cancelled_at = now;

  await db.update(orders).set(updatePayload).where(eq(orders.id, orderId));

  return { success: true };
}
