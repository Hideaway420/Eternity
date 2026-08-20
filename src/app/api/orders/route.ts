import { NextResponse } from "next/server";
import { z } from "zod";
import { eq, inArray } from "drizzle-orm";
import { db, initTables } from "@/db";
import { products, orders, orderItems, customers, addresses } from "@/db/schema";
import { isValidNepalPhone, normalizePhone } from "@/lib/phone";
import { DEPOSIT_CATEGORY_IDS } from "@/lib/taxonomy";
import { computeOrderTotals } from "@/lib/order-totals";

const PAYMENT_METHODS = ["cod", "esewa", "khalti", "bank"] as const;

const orderItemSchema = z.object({
  sku: z.string().trim().min(1),
  qty: z.coerce.number().int().min(1).max(50),
});

const placeOrderSchema = z.object({
  phone: z.string().trim().min(1, "Phone number is required."),
  recipient: z.string().trim().min(1, "Recipient name is required.").max(200),
  district: z.string().trim().min(1, "District is required.").max(100),
  city: z.string().trim().min(1, "City / area is required.").max(200),
  landmark: z.string().trim().max(300).optional().default(""),
  paymentMethod: z.enum(PAYMENT_METHODS).default("cod"),
  items: z.array(orderItemSchema).min(1, "Cart is empty."),
});

function randomId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function generateUniqueOrderNumber(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `ETP-${Math.floor(100000 + Math.random() * 900000)}`;
    const existing = await db.select({ id: orders.id }).from(orders).where(eq(orders.order_number, candidate)).get();
    if (!existing) return candidate;
  }
  // Practically unreachable after 5 random misses, but guarantees uniqueness without another retry loop.
  return `ETP-${Date.now().toString().slice(-6)}`;
}

export async function POST(req: Request) {
  try {
    await initTables();

    const json = await req.json().catch(() => null);
    if (!json) {
      return NextResponse.json({ success: false, error: "Invalid JSON body." }, { status: 400 });
    }

    const parsed = placeOrderSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid order payload." },
        { status: 400 }
      );
    }

    const { phone, recipient, district, city, landmark, paymentMethod, items } = parsed.data;

    if (!isValidNepalPhone(phone)) {
      return NextResponse.json({ success: false, error: "Enter a valid Nepal phone number." }, { status: 400 });
    }
    const normalizedPhone = normalizePhone(phone);

    // Price tampering is trivial if we trust anything the client sends. The client only supplies
    // SKU + qty; every price below comes straight from the current DB row.
    const skus = [...new Set(items.map((i) => i.sku))];
    const dbProducts = await db.select().from(products).where(inArray(products.sku, skus)).all();
    const productBySku = new Map(dbProducts.map((p) => [p.sku, p]));

    const lines: { product: (typeof dbProducts)[number]; qty: number; lineTotalNpr: number }[] = [];
    for (const item of items) {
      const product = productBySku.get(item.sku);
      if (!product) {
        return NextResponse.json({ success: false, error: `Unknown product SKU: ${item.sku}` }, { status: 400 });
      }
      if (product.price_npr === 0) {
        return NextResponse.json(
          { success: false, error: `${product.name} is not currently available for order.` },
          { status: 400 }
        );
      }
      lines.push({ product, qty: item.qty, lineTotalNpr: product.price_npr * item.qty });
    }

    const { subtotalNpr, isValley, deliveryNpr, vatNpr, totalNpr } = computeOrderTotals(
      lines.map((l) => ({ priceNpr: l.product.price_npr, qty: l.qty })),
      district
    );
    // Only manicure/pedicure spa furniture is built to order and takes a deposit. Keying off
    // line === "profit" also swept in luxury salon chairs, which ship cash on delivery, so chair
    // buyers were shown deposit-only payment options.
    const isSpaOrder = lines.some(
      (l) => l.product.category_id && DEPOSIT_CATEGORY_IDS.has(l.product.category_id)
    );

    const orderNumber = await generateUniqueOrderNumber();

    // Identity here is the phone number, not an account - find or create the customer by phone.
    const existingCustomer = await db
      .select({ id: customers.id })
      .from(customers)
      .where(eq(customers.phone, normalizedPhone))
      .get();
    const customerId = existingCustomer?.id ?? randomId("cust");
    if (!existingCustomer) {
      await db
        .insert(customers)
        .values({
          id: customerId,
          name: recipient,
          phone: normalizedPhone,
          type: "retail",
          created_at: new Date().toISOString(),
        })
        .run();
    }

    await db
      .insert(addresses)
      .values({
        id: randomId("addr"),
        customer_id: customerId,
        label: "Delivery",
        recipient,
        phone: normalizedPhone,
        district,
        city,
        landmark: landmark || null,
        inside_valley: isValley,
      })
      .run();

    const orderId = randomId("ord");
    await db
      .insert(orders)
      .values({
        id: orderId,
        order_number: orderNumber,
        customer_id: customerId,
        status: "pending",
        payment_method: paymentMethod,
        payment_status: "unpaid",
        subtotal_npr: subtotalNpr,
        discount_npr: 0,
        delivery_npr: deliveryNpr,
        vat_npr: vatNpr,
        total_npr: totalNpr,
        address_snapshot: JSON.stringify({
          recipient,
          phone: normalizedPhone,
          district,
          city,
          landmark: landmark || null,
          insideValley: isValley,
        }),
        placed_at: new Date().toISOString(),
      })
      .run();

    for (const line of lines) {
      await db
        .insert(orderItems)
        .values({
          id: randomId("oi"),
          order_id: orderId,
          product_id: line.product.id,
          name_snapshot: line.product.name,
          sku_snapshot: line.product.sku,
          qty: line.qty,
          unit_price_npr: line.product.price_npr,
          unit_cost_npr: line.product.cost_npr ?? null,
          line_total_npr: line.lineTotalNpr,
        })
        .run();
    }

    return NextResponse.json(
      {
        success: true,
        orderNumber,
        order: {
          orderNumber,
          status: "pending",
          paymentMethod,
          isSpaOrder,
          items: lines.map((l) => ({
            name: l.product.name,
            sku: l.product.sku,
            qty: l.qty,
            unitPriceNpr: l.product.price_npr,
            lineTotalNpr: l.lineTotalNpr,
          })),
          subtotalNpr,
          deliveryNpr,
          vatNpr,
          totalNpr,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error creating order:", err);
    return NextResponse.json(
      { success: false, error: "Could not place order. Please try again or contact us on WhatsApp." },
      { status: 500 }
    );
  }
}
