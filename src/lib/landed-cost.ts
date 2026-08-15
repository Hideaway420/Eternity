import { db } from "@/db";
import { purchaseOrders, poLines, stockMovements, inventory } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function allocatePOLandedCosts(poId: string, receivedByUserId: string = "system") {
  const po = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, poId)).get();
  if (!po) throw new Error("Purchase Order not found");

  const lines = await db.select().from(poLines).where(eq(poLines.po_id, poId)).all();
  if (lines.length === 0) throw new Error("PO has no items");

  const fxRate = (po.fx_rate || 160) / 100; // e.g. 160 / 100 = 1.60
  const totalOverheadNpr =
    (po.freight_npr || 0) +
    (po.duty_npr || 0) +
    (po.clearing_npr || 0) +
    (po.inland_npr || 0);

  const totalForeignSubtotal = po.subtotal_foreign;
  const now = new Date().toISOString();

  for (const line of lines) {
    const lineForeignTotal = line.unit_cost_foreign * line.qty_ordered;
    const valueShareRatio = totalForeignSubtotal > 0 ? lineForeignTotal / totalForeignSubtotal : 1 / lines.length;
    
    // Base unit cost in NPR
    const baseUnitCostNpr = Math.round(line.unit_cost_foreign * fxRate * 100);
    // Overhead portion allocated to each unit
    const allocatedOverheadPerUnit = Math.round(
      (totalOverheadNpr * valueShareRatio) / line.qty_ordered
    );

    const landedUnitCostNpr = baseUnitCostNpr + allocatedOverheadPerUnit;

    // Update PO line landed cost
    await db.update(poLines)
      .set({
        landed_unit_cost_npr: landedUnitCostNpr,
        qty_received: line.qty_ordered,
      })
      .where(eq(poLines.id, line.id));

    // Record receipt stock movement
    await db.insert(stockMovements)
      .values({
        id: `sm-po-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        product_id: line.product_id,
        variant_id: line.variant_id,
        warehouse_id: po.warehouse_id,
        type: "receipt",
        qty_delta: line.qty_ordered,
        ref_type: "po",
        ref_id: poId,
        unit_cost_npr: landedUnitCostNpr,
        reason: `PO Receipt ${po.po_number}`,
        created_by: receivedByUserId,
        created_at: now,
      });
  }

  // Update PO status to received
  await db.update(purchaseOrders)
    .set({
      status: "received",
      received_at: now,
    })
    .where(eq(purchaseOrders.id, poId));

  return { success: true };
}
