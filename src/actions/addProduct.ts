"use server";

import { db, initTables } from "@/db";
import { products, productImages, inventory, categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface AddProductInput {
  name: string;
  category_slug: "luxury-chairs" | "manicure-pedicure-spa-furniture";
  price_npr: number;
  deposit_percentage: number;
  description: string;
  image_url: string;
}

export async function addProductAction(input: AddProductInput) {
  try {
    await initTables();

    // 1. Inputs Validation & Sanitization
    if (!input.name || !input.price_npr || !input.category_slug) {
      return { success: false, error: "Product Name, Price, and Category are required." };
    }

    const priceNpr = Number(input.price_npr);
    if (isNaN(priceNpr) || priceNpr <= 0) {
      return { success: false, error: "Please enter a valid price in NPR." };
    }

    // 2. Generate SKU & Slug
    const slug = input.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const skuPrefix = input.category_slug === "luxury-chairs" ? "ETP-LSC" : "ETP-SPA";
    const randomCode = Math.floor(100 + Math.random() * 900);
    const sku = `${skuPrefix}-${randomCode}`;
    const productId = `prod-${slug}-${Date.now().toString().slice(-4)}`;

    // 3. Map Category ID
    let categoryId = input.category_slug === "luxury-chairs" ? "cat-chairs" : "cat-spa";
    const catDb = await db.select().from(categories).where(eq(categories.slug, input.category_slug)).get();
    if (catDb) categoryId = catDb.id;

    const pricePaisa = Math.round(priceNpr * 100);
    const compareAtPaisa = Math.round(pricePaisa * 1.05); // 5% anchor
    const costPaisa = Math.round(pricePaisa * 0.65); // 65% confidential cost
    const now = new Date().toISOString();

    // 4. SQL Insert into Turso DB via Drizzle/libsql
    await db
      .insert(products)
      .values({
        id: productId,
        sku,
        slug,
        name: input.name.trim(),
        description: input.description?.trim() || `${input.name} imported by Eternity Products Nepal.`,
        category_id: categoryId,
        line: "profit",
        price_npr: pricePaisa,
        compare_at_npr: compareAtPaisa,
        cost_npr: costPaisa,
        status: "active",
        created_at: now,
        updated_at: now,
      })
      .run();

    // 5. Insert Primary Image
    const imgUrl = input.image_url.trim() || "/products/spa_chair_classic.jpg";
    await db
      .insert(productImages)
      .values({
        id: `img-${productId}`,
        product_id: productId,
        url: imgUrl,
        alt: `${input.name} - Eternity Luxury Collection`,
        is_primary: true,
        sort_order: 0,
      })
      .run();

    // 6. Insert Warehouse Inventory
    await db
      .insert(inventory)
      .values({
        id: `inv-${productId}`,
        product_id: productId,
        warehouse_id: "wh-main",
        qty_on_hand: 5,
        qty_reserved: 0,
        qty_incoming: 2,
      })
      .run();

    // 7. Instant Cache Revalidation
    revalidatePath("/");
    revalidatePath(`/c/${input.category_slug}`);
    revalidatePath("/c/[category]", "page");
    revalidatePath("/p/[slug]", "page");

    return {
      success: true,
      message: `Product "${input.name}" (${sku}) added successfully!`,
      product: {
        id: productId,
        sku,
        slug,
        name: input.name,
        price_npr: priceNpr,
        category_slug: input.category_slug,
        imageUrl: imgUrl,
      },
    };
  } catch (err: any) {
    console.error("❌ Error in addProductAction:", err);
    return { success: false, error: err.message || "Failed to insert product into Turso database." };
  }
}
