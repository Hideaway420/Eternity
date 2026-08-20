/**
 * Self-check for the checkout money path (paisa arithmetic only, no DB writes).
 * Run: npx tsx scripts/test-order-totals.ts
 */
import assert from "node:assert/strict";
import { computeOrderTotals } from "../src/lib/order-totals";

function main() {
  // Inside-valley order: free delivery, single line.
  // Ikonic Gleam 3.0 Straightener: NPR 1,258 -> 125800 paisa, qty 1.
  const inValley = computeOrderTotals([{ priceNpr: 125800, qty: 1 }], "Kathmandu");
  assert.equal(inValley.subtotalNpr, 125800, "inside-valley subtotal must equal unit price x qty");
  assert.equal(inValley.deliveryNpr, 0, "Kathmandu/Lalitpur/Bhaktapur must ship free");
  assert.equal(inValley.totalNpr, 125800, "inside-valley total must equal subtotal when delivery is free");
  assert.equal(inValley.vatNpr, 125800 - Math.round(125800 / 1.13), "13% VAT must be extracted from the VAT-inclusive subtotal");

  // Outside-valley order: flat NPR 500 (50000 paisa) delivery on top of the subtotal.
  const outsideValley = computeOrderTotals([{ priceNpr: 125800, qty: 1 }], "Pokhara (Kaski)");
  assert.equal(outsideValley.subtotalNpr, 125800, "outside-valley subtotal must equal unit price x qty");
  assert.equal(outsideValley.deliveryNpr, 50000, "outside-valley delivery must be flat NPR 500");
  assert.equal(outsideValley.totalNpr, 175800, "outside-valley total must be subtotal + delivery");

  // Multi-item, multi-qty order: two different SKUs, qty > 1 on one line.
  const multiItem = computeOrderTotals(
    [
      { priceNpr: 125800, qty: 2 }, // 251600
      { priceNpr: 66000, qty: 1 }, // 66000
    ],
    "Bhaktapur"
  );
  assert.equal(multiItem.subtotalNpr, 251600 + 66000, "multi-item subtotal must sum every line's price x qty");
  assert.equal(multiItem.deliveryNpr, 0, "Bhaktapur is inside the valley and must ship free");
  assert.equal(multiItem.totalNpr, 251600 + 66000, "multi-item total must equal subtotal when delivery is free");
  assert.ok(Number.isInteger(multiItem.subtotalNpr), "money must stay integer paisa, never floats");
  assert.ok(Number.isInteger(multiItem.vatNpr), "VAT must stay integer paisa, never floats");

  console.log("order totals self-check: all assertions passed");
}

main();
