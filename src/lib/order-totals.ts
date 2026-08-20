import { calculateVat } from "@/lib/money";

// Free inside the valley, flat NPR 500 (paisa) everywhere else. Mirrors the old client-side
// rule that used to live in checkout/page.tsx - now the only place that decides delivery cost.
const INSIDE_VALLEY_DISTRICTS = new Set(["Kathmandu", "Lalitpur", "Bhaktapur"]);
const OUTSIDE_VALLEY_DELIVERY_PAISA = 50000; // NPR 500

export interface OrderLineInput {
  priceNpr: number; // paisa, per unit - always the current DB price, never a client-supplied one
  qty: number;
}

// Pure money math, kept out of route.ts (a Next.js route file may only export HTTP method
// handlers) so it can be covered by scripts/test-order-totals.ts without touching the database.
export function computeOrderTotals(lines: OrderLineInput[], district: string) {
  const subtotalNpr = lines.reduce((sum, l) => sum + l.priceNpr * l.qty, 0);
  const isValley = INSIDE_VALLEY_DISTRICTS.has(district);
  const deliveryNpr = isValley ? 0 : OUTSIDE_VALLEY_DELIVERY_PAISA;
  const totalNpr = subtotalNpr + deliveryNpr;
  // Listed prices are VAT-inclusive (per project rules), so vat_npr records the VAT already
  // folded into subtotalNpr for bookkeeping - it is never added a second time on top of the total.
  const { vatPaisa } = calculateVat(subtotalNpr);
  return { subtotalNpr, isValley, deliveryNpr, vatNpr: vatPaisa, totalNpr };
}
