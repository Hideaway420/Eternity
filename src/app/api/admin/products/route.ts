import { NextResponse } from "next/server";
import { db, initTables } from "@/db";
import { products, productImages, inventory, warehouses } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    await initTables();

    const allProducts = await db
      .select({
        id: products.id,
        sku: products.sku,
        slug: products.slug,
        name: products.name,
        description: products.description,
        price_npr: products.price_npr,
        compare_at_npr: products.compare_at_npr,
        cost_npr: products.cost_npr,
        line: products.line,
        status: products.status,
        imageUrl: productImages.url,
      })
      .from(products)
      .leftJoin(productImages, eq(products.id, productImages.product_id))
      .orderBy(desc(products.created_at))
      .all();

    return NextResponse.json({ success: true, products: allProducts });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await initTables();
    const body = await req.json();

    const {
      sku,
      name,
      slug: customSlug,
      category_id,
      line,
      price_npr,
      compare_at_npr,
      cost_npr,
      description,
      imageUrl,
      status,
    } = body;

    if (!sku || !name || !price_npr) {
      return NextResponse.json(
        { success: false, error: "SKU, Name, and Price are required." },
        { status: 400 }
      );
    }

    const generatedSlug = customSlug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const productId = `prod-${sku.toLowerCase()}`;
    const now = new Date().toISOString();

    const pricePaisa = Math.round(parseFloat(price_npr) * 100);
    const comparePaisa = compare_at_npr ? Math.round(parseFloat(compare_at_npr) * 100) : null;
    const costPaisa = cost_npr ? Math.round(parseFloat(cost_npr) * 100) : null;

    // Insert Product
    await db
      .insert(products)
      .values({
        id: productId,
        sku: sku.trim(),
        slug: generatedSlug,
        name: name.trim(),
        description: description || `${name} imported directly from Ikonic India by Eternity Products Nepal.`,
        category_id: category_id || null,
        line: line || "traffic",
        price_npr: pricePaisa,
        compare_at_npr: comparePaisa,
        cost_npr: costPaisa,
        status: status || "active",
        created_at: now,
        updated_at: now,
      })
      .run();

    // Insert Primary Product Image
    const imgUrl = imageUrl || "/products/ikonic_straightener_1786231866243.jpg";
    await db
      .insert(productImages)
      .values({
        id: `img-${productId}`,
        product_id: productId,
        url: imgUrl,
        alt: name,
        is_primary: true,
      })
      .run();

    // Insert Default Warehouse Inventory
    await db
      .insert(inventory)
      .values({
        id: `inv-${productId}`,
        product_id: productId,
        warehouse_id: "wh-main",
        qty_on_hand: 10,
        qty_reserved: 0,
        qty_incoming: 0,
        reorder_point: 3,
        safety_stock: 1,
        bin_location: null,
      })
      .run();

    return NextResponse.json({
      success: true,
      message: "Product created successfully!",
      product: {
        id: productId,
        sku,
        slug: generatedSlug,
        name,
        price_npr: pricePaisa,
        imageUrl: imgUrl,
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
