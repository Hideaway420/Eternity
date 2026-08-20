import { NextResponse } from "next/server";
import { z } from "zod";
import { db, initTables } from "@/db";
import {
  products,
  productImages,
  inventory,
  orderItems,
  poLines,
  stockMovements,
  productVariants,
} from "@/db/schema";
import { eq, or, desc, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { PILLARS, getPillarById } from "@/lib/taxonomy";

const GENERIC_ERROR = "The request could not be completed. Check the server logs for details.";
const PLACEHOLDER_IMAGE = "/products/ikonic_straightener_1786231866243.jpg";

const PRODUCT_COLUMNS = {
  id: products.id,
  sku: products.sku,
  slug: products.slug,
  name: products.name,
  description: products.description,
  price_npr: products.price_npr,
  compare_at_npr: products.compare_at_npr,
  cost_npr: products.cost_npr,
  price_range: products.price_range,
  category_id: products.category_id,
  line: products.line,
  status: products.status,
};

/* ------------------------------------------------------------------ *
 * Payload validation. Money is integer paisa (NPR * 100) in the DB,
 * so every price crosses this boundary through requiredPaisa/optionalPaisa
 * and a non-numeric value is rejected instead of inserted as NaN.
 * ------------------------------------------------------------------ */

const isBlank = (v: unknown) => v === null || v === undefined || (typeof v === "string" && v.trim() === "");
const isNumeric = (v: unknown) => Number.isFinite(Number(v)) && Number(v) >= 0;

const requiredPaisa = z
  .union([z.string(), z.number()])
  .refine((v) => !isBlank(v) && isNumeric(v), "must be a number in NPR (0 or more)")
  .transform((v) => Math.round(Number(v) * 100));

const optionalPaisa = z
  .union([z.string(), z.number(), z.null()])
  .optional()
  .refine((v) => isBlank(v) || isNumeric(v), "must be a number in NPR (0 or more), or left blank")
  .transform((v) => (isBlank(v) ? null : Math.round(Number(v) * 100)));

const openingStock = z
  .union([z.string(), z.number()])
  .optional()
  .refine((v) => isBlank(v) || isNumeric(v), "must be a whole number of units (0 or more)")
  .transform((v) => (isBlank(v) ? 0 : Math.trunc(Number(v))));

const CATEGORY_IDS = PILLARS.map((p) => p.id);

const productPayload = z.object({
  sku: z.string().trim().min(1, "SKU is required"),
  name: z.string().trim().min(1, "Product name is required"),
  slug: z.string().trim().optional(),
  category_id: z
    .string({ required_error: "Category is required" })
    .refine((v) => CATEGORY_IDS.includes(v), `must be one of the five official categories (${CATEGORY_IDS.join(", ")})`),
  line: z.enum(["traffic", "eyewear", "profit"]).optional(),
  price_npr: requiredPaisa,
  compare_at_npr: optionalPaisa,
  cost_npr: optionalPaisa,
  price_range: z.string().nullish(),
  priceRange: z.string().nullish(),
  description: z.string().nullish(),
  heroImageUrl: z.string().nullish(),
  imageUrl: z.string().nullish(),
  secondaryImageUrls: z.array(z.string()).optional(),
  imageUrls: z.array(z.string()).optional(),
  status: z.enum(["draft", "active", "out_of_stock", "archived"]).optional(),
  opening_stock: openingStock,
});

const updatePayload = productPayload.extend({
  id: z.string().trim().min(1, "Product ID is required"),
});

function validationError(error: z.ZodError) {
  return NextResponse.json(
    {
      success: false,
      error: error.issues.map((i) => `${i.path.join(".") || "body"} ${i.message}`).join(" · "),
      fieldErrors: error.flatten().fieldErrors,
    },
    { status: 400 }
  );
}

/** The storefront treats eyewear as its own line, everything else follows the pillar. */
function lineForCategory(categoryId: string, explicit?: string) {
  if (explicit) return explicit;
  const pillar = getPillarById(categoryId);
  if (!pillar) return "traffic";
  return pillar.slug === "eyewear" ? "eyewear" : pillar.line;
}

/** Hero first, then de-duplicated secondaries. Shared by POST and PUT. */
function orderImageUrls(p: {
  heroImageUrl?: string | null;
  imageUrl?: string | null;
  secondaryImageUrls?: string[];
  imageUrls?: string[];
}, fallbackHero: string | null) {
  const hero = p.heroImageUrl || p.imageUrl || p.imageUrls?.[0] || fallbackHero;
  const secondaries = p.secondaryImageUrls ?? (p.imageUrls || []).filter((u) => u !== hero);
  const rest = secondaries.filter((u) => u && u.trim() !== "" && u !== hero);
  return hero ? [hero, ...rest] : rest;
}

async function writeProductImages(productId: string, name: string, urls: string[]) {
  for (let i = 0; i < urls.length; i++) {
    try {
      await db
        .insert(productImages)
        .values({
          id: `img-${productId}-${i}-${Date.now()}`,
          product_id: productId,
          url: urls[i].trim(),
          alt: i === 0 ? `${name} - Hero Image` : `${name} - Secondary Photo ${i}`,
          sort_order: i,
          is_primary: i === 0,
        })
        .run();
    } catch (imgErr) {
      console.warn("productImages insert skipped:", imgErr);
    }
  }
}

function revalidateStorefront() {
  revalidatePath("/");
  revalidatePath("/c/[category]", "page");
  revalidatePath("/p/[slug]", "page");
}

export async function GET() {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    await initTables();

    let allProducts = await db
      .select(PRODUCT_COLUMNS)
      .from(products)
      .orderBy(desc(products.created_at))
      .all();

    // If DB has 0 items (e.g. read-only memory DB or post-migration reset), seed and re-read
    if (!allProducts || allProducts.length === 0) {
      await initTables();
      allProducts = await db.select(PRODUCT_COLUMNS).from(products).all();
    }

    if (!allProducts || allProducts.length === 0) {
      return NextResponse.json({ success: true, products: [] });
    }

    // Fetch images for all products
    const allImages = await db
      .select()
      .from(productImages)
      .orderBy(asc(productImages.sort_order))
      .all();

    const productsWithImages = allProducts.map((p) => {
      const pImgs = allImages.filter((img) => img.product_id === p.id);
      const heroImg = pImgs.find((img) => img.is_primary)?.url || pImgs[0]?.url || PLACEHOLDER_IMAGE;
      const secondaryImgs = pImgs.filter((img) => img.url !== heroImg).map((img) => img.url);

      return {
        ...p,
        heroImageUrl: heroImg,
        imageUrl: heroImg,
        secondaryImageUrls: secondaryImgs,
        imageUrls: pImgs.map((img) => img.url),
      };
    });

    return NextResponse.json({ success: true, products: productsWithImages });
  } catch (err: unknown) {
    console.error("Error fetching admin products:", err);
    return NextResponse.json(
      { success: false, error: "Could not load products from the database." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    await initTables();

    const parsed = productPayload.safeParse(await req.json());
    if (!parsed.success) return validationError(parsed.error);
    const p = parsed.data;

    const productId = `prod-${p.sku.toLowerCase()}`;

    // The id is derived from the SKU, so a repeat SKU is a duplicate on both columns.
    const clash = await db
      .select({ id: products.id, sku: products.sku })
      .from(products)
      .where(or(eq(products.sku, p.sku), eq(products.id, productId)))
      .all();

    if (clash.length > 0) {
      return NextResponse.json(
        { success: false, error: `SKU "${p.sku}" already exists (product ${clash[0].id}). Use a different SKU or edit the existing product.` },
        { status: 409 }
      );
    }

    const generatedSlug = p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const now = new Date().toISOString();

    await db
      .insert(products)
      .values({
        id: productId,
        sku: p.sku,
        slug: generatedSlug,
        name: p.name,
        description: p.description || `${p.name} imported directly from India by Eternity Products Nepal.`,
        category_id: p.category_id,
        line: lineForCategory(p.category_id, p.line),
        price_npr: p.price_npr,
        compare_at_npr: p.compare_at_npr,
        cost_npr: p.cost_npr,
        price_range: p.price_range || p.priceRange || null,
        status: p.status || (p.price_npr > 0 ? "active" : "out_of_stock"),
        created_at: now,
        updated_at: now,
      })
      .run();

    const finalUrls = orderImageUrls(p, PLACEHOLDER_IMAGE);
    await writeProductImages(productId, p.name, finalUrls);

    // Real opening stock against the default warehouse, not a hardcoded count.
    await db
      .insert(inventory)
      .values({
        id: `inv-${productId}`,
        product_id: productId,
        warehouse_id: "wh-main",
        qty_on_hand: p.opening_stock,
        qty_reserved: 0,
        qty_incoming: 0,
        reorder_point: 3,
        safety_stock: 1,
        bin_location: null,
      })
      .run();

    revalidateStorefront();

    return NextResponse.json({
      success: true,
      message: `Product created in ${getPillarById(p.category_id)?.name ?? "category"} with ${p.opening_stock} unit(s) opening stock.`,
      product: {
        id: productId,
        sku: p.sku,
        slug: generatedSlug,
        name: p.name,
        category_id: p.category_id,
        price_npr: p.price_npr,
        heroImageUrl: finalUrls[0] ?? null,
        secondaryImageUrls: finalUrls.slice(1),
      },
    });
  } catch (err: unknown) {
    console.error("Error creating product:", err);
    return NextResponse.json({ success: false, error: GENERIC_ERROR }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    await initTables();

    const parsed = updatePayload.safeParse(await req.json());
    if (!parsed.success) return validationError(parsed.error);
    const p = parsed.data;

    const now = new Date().toISOString();

    const updated = await db
      .update(products)
      .set({
        name: p.name,
        sku: p.sku,
        slug: p.slug || undefined,
        category_id: p.category_id,
        line: lineForCategory(p.category_id, p.line),
        price_npr: p.price_npr,
        compare_at_npr: p.compare_at_npr,
        cost_npr: p.cost_npr,
        price_range: p.price_range || p.priceRange || undefined,
        description: p.description || undefined,
        status: p.status || (p.price_npr > 0 ? "active" : "out_of_stock"),
        updated_at: now,
      })
      .where(eq(products.id, p.id))
      .run();

    if (updated.rowsAffected === 0) {
      return NextResponse.json(
        { success: false, error: `No product found with ID "${p.id}". Nothing was updated.` },
        { status: 404 }
      );
    }

    const finalUrls = orderImageUrls(p, null);
    if (finalUrls.length > 0) {
      await db.delete(productImages).where(eq(productImages.product_id, p.id)).run();
      await writeProductImages(p.id, p.name, finalUrls);
    }

    revalidateStorefront();

    return NextResponse.json({
      success: true,
      message: `Product "${p.name}" updated in ${getPillarById(p.category_id)?.name ?? "category"}.`,
    });
  } catch (err: unknown) {
    console.error("Error updating product:", err);
    return NextResponse.json({ success: false, error: "Failed to update product." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    await initTables();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Product ID parameter is required for deletion." }, { status: 400 });
    }

    // Nothing is destroyed until we know the product delete can actually succeed.
    // Previously images and inventory were deleted first, so a product referenced by order_items
    // (or po_lines / stock_movements / product_variants) failed the foreign key on the final
    // delete and returned 500 - after its images and stock row were already gone for good.
    const existing = await db.select({ id: products.id }).from(products).where(eq(products.id, id)).get();
    if (!existing) {
      return NextResponse.json(
        { success: false, error: `No product found with ID "${id}". Nothing was deleted.` },
        { status: 404 }
      );
    }

    const blockers: string[] = [];
    for (const [label, table, column] of [
      ["order history", orderItems, orderItems.product_id],
      ["purchase order lines", poLines, poLines.product_id],
      ["stock movements", stockMovements, stockMovements.product_id],
      ["product variants", productVariants, productVariants.product_id],
    ] as const) {
      const row = await db.select({ id: table.id }).from(table).where(eq(column, id)).get();
      if (row) blockers.push(label);
    }

    if (blockers.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            `"${id}" cannot be deleted because it is referenced by ${blockers.join(", ")}. ` +
            `Set its status to "out_of_stock" instead so existing records stay intact.`,
        },
        { status: 409 }
      );
    }

    await db.delete(productImages).where(eq(productImages.product_id, id)).run();
    await db.delete(inventory).where(eq(inventory.product_id, id)).run();
    await db.delete(products).where(eq(products.id, id)).run();

    revalidateStorefront();

    return NextResponse.json({
      success: true,
      message: `Product ID "${id}" and all associated images and pages were permanently deleted.`,
    });
  } catch (err: unknown) {
    console.error("Error deleting product:", err);
    return NextResponse.json({ success: false, error: "Failed to delete product." }, { status: 500 });
  }
}
