"use server";

import { db, initTables } from "@/db";
import { products, productImages, inventory, categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

export type CategorySlugType =
  | "eyewear"
  | "hair-straighteners"
  | "hair-dryers-curlers"
  | "luxury-chairs"
  | "manicure-pedicure-spa-furniture";

export interface AddProductInput {
  name: string;
  category_slug: CategorySlugType;
  price_npr: number;
  deposit_percentage: number;
  description: string;
  image_url: string;
  brand_name?: string;
}

export async function addProductAction(input: AddProductInput) {
  try {
    // "use server" actions are publicly invocable POST endpoints; middleware does not cover them.
    if (await requireAdmin()) {
      return { success: false, error: "Unauthorized." };
    }

    await initTables();

    // 1. Inputs Validation & Sanitization
    if (!input.name || input.price_npr === undefined || !input.category_slug) {
      return { success: false, error: "Product Name, Price, and Category are required." };
    }

    const priceNpr = Number(input.price_npr);
    if (isNaN(priceNpr) || priceNpr < 0) {
      return { success: false, error: "Please enter a valid price in NPR." };
    }

    // 2. Generate SKU Prefix by Category
    const skuPrefixMap: Record<CategorySlugType, string> = {
      eyewear: "ETP-EYE",
      "hair-straighteners": "ETP-STR",
      "hair-dryers-curlers": "ETP-DRY",
      "luxury-chairs": "ETP-LSC",
      "manicure-pedicure-spa-furniture": "ETP-SPA",
    };

    const slug = input.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const prefix = skuPrefixMap[input.category_slug] || "ETP-PROD";
    const randomCode = Math.floor(100 + Math.random() * 900);
    const sku = `${prefix}-${randomCode}`;
    const productId = `prod-${slug}-${Date.now().toString().slice(-4)}`;

    // 3. Map Category ID
    const catMap: Record<CategorySlugType, string> = {
      eyewear: "cat-eyewear",
      "hair-straighteners": "cat-straighteners",
      "hair-dryers-curlers": "cat-dryers",
      "luxury-chairs": "cat-chairs",
      "manicure-pedicure-spa-furniture": "cat-spa",
    };
    let categoryId = catMap[input.category_slug] || "cat-spa";

    const catDb = await db.select().from(categories).where(eq(categories.slug, input.category_slug)).get();
    if (catDb) categoryId = catDb.id;

    const pricePaisa = Math.round(priceNpr * 100);
    const now = new Date().toISOString();

    const isPlaceholder = priceNpr === 0;

    // 4. SQL Insert into Turso DB via Drizzle/libsql
    await db
      .insert(products)
      .values({
        id: productId,
        sku,
        slug,
        name: input.name.trim(),
        description:
          input.description?.trim() ||
          `${input.name} imported and distributed by Eternity Products Nepal. Authentic quality with open-box cash on delivery.`,
        category_id: categoryId,
        line: input.category_slug === "hair-straighteners" || input.category_slug === "hair-dryers-curlers" ? "traffic" : "profit",
        price_npr: pricePaisa,
        // compare_at_npr and cost_npr stay null until a real figure is entered in the admin panel.
        compare_at_npr: null,
        cost_npr: null,
        status: isPlaceholder ? "out_of_stock" : "active",
        created_at: now,
        updated_at: now,
      })
      .run();

    // 5. Insert Primary Image
    const defaultImage = input.category_slug === "eyewear" ? "/products/eyewear_placeholder_1.jpg" : "/products/spa_chair_classic.jpg";
    const imgUrl = input.image_url?.trim() || defaultImage;

    await db
      .insert(productImages)
      .values({
        id: `img-${productId}`,
        product_id: productId,
        url: imgUrl,
        alt: `${input.name} - Eternity Nepal Official`,
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
        qty_on_hand: isPlaceholder ? 0 : 5,
        qty_reserved: 0,
        qty_incoming: isPlaceholder ? 5 : 2,
      })
      .run();

    // 7. Instant Cache Revalidation Across Storefront
    revalidatePath("/");
    revalidatePath(`/c/${input.category_slug}`);
    revalidatePath("/c/[category]", "page");
    revalidatePath("/p/[slug]", "page");

    return {
      success: true,
      message: `Product "${input.name}" (${sku}) added successfully to ${input.category_slug}!`,
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
