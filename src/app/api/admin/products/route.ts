import { NextResponse } from "next/server";
import { db, initTables } from "@/db";
import { products, productImages, inventory } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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
      })
      .from(products)
      .orderBy(desc(products.created_at))
      .all();

    // Fetch images for all products
    const allImages = await db
      .select()
      .from(productImages)
      .orderBy(asc(productImages.sort_order))
      .all();

    const productsWithImages = allProducts.map((p) => {
      const pImgs = allImages.filter((img) => img.product_id === p.id);
      const imageUrls = pImgs.map((img) => img.url);
      const primaryUrl = pImgs.find((img) => img.is_primary)?.url || imageUrls[0] || "/products/ikonic_straightener_1786231866243.jpg";

      return {
        ...p,
        imageUrl: primaryUrl,
        imageUrls: imageUrls.length > 0 ? imageUrls : [primaryUrl],
      };
    });

    return NextResponse.json({ success: true, products: productsWithImages });
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
      imageUrls,
      status,
    } = body;

    if (!sku || !name || price_npr === undefined) {
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
        description: description || `${name} imported directly from India by Eternity Products Nepal.`,
        category_id: category_id || null,
        line: line || "traffic",
        price_npr: pricePaisa,
        compare_at_npr: comparePaisa,
        cost_npr: costPaisa,
        status: status || (pricePaisa > 0 ? "active" : "out_of_stock"),
        created_at: now,
        updated_at: now,
      })
      .run();

    // Collect all image URLs
    const finalUrls: string[] = Array.isArray(imageUrls) && imageUrls.length > 0
      ? imageUrls.filter((u: string) => u.trim() !== "")
      : imageUrl ? [imageUrl] : ["/products/ikonic_straightener_1786231866243.jpg"];

    // Insert Multiple Product Images
    for (let i = 0; i < finalUrls.length; i++) {
      await db
        .insert(productImages)
        .values({
          id: `img-${productId}-${i}-${Date.now()}`,
          product_id: productId,
          url: finalUrls[i].trim(),
          alt: `${name} Image ${i + 1}`,
          sort_order: i,
          is_primary: i === 0,
        })
        .run();
    }

    // Insert Default Warehouse Inventory
    await db
      .insert(inventory)
      .values({
        id: `inv-${productId}`,
        product_id: productId,
        warehouse_id: "wh-main",
        qty_on_hand: pricePaisa > 0 ? 10 : 0,
        qty_reserved: 0,
        qty_incoming: 0,
        reorder_point: 3,
        safety_stock: 1,
        bin_location: null,
      })
      .run();

    // Instant Revalidation across Storefront
    revalidatePath("/");
    revalidatePath("/c/[category]", "page");
    revalidatePath("/p/[slug]", "page");

    return NextResponse.json({
      success: true,
      message: "Product created successfully with multiple images!",
      product: {
        id: productId,
        sku,
        slug: generatedSlug,
        name,
        price_npr: pricePaisa,
        imageUrl: finalUrls[0],
        imageUrls: finalUrls,
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await initTables();
    const body = await req.json();

    const {
      id,
      sku,
      name,
      slug,
      line,
      price_npr,
      compare_at_npr,
      cost_npr,
      description,
      imageUrl,
      imageUrls,
      status,
    } = body;

    if (!id || !name) {
      return NextResponse.json({ success: false, error: "Product ID and Name are required for editing." }, { status: 400 });
    }

    const now = new Date().toISOString();
    const pricePaisa = Math.round(parseFloat(price_npr || "0") * 100);
    const comparePaisa = compare_at_npr ? Math.round(parseFloat(compare_at_npr) * 100) : null;
    const costPaisa = cost_npr ? Math.round(parseFloat(cost_npr) * 100) : null;

    // Update Product Table
    await db
      .update(products)
      .set({
        name: name.trim(),
        sku: sku ? sku.trim() : undefined,
        slug: slug ? slug.trim() : undefined,
        line: line || "traffic",
        price_npr: pricePaisa,
        compare_at_npr: comparePaisa,
        cost_npr: costPaisa,
        description: description || undefined,
        status: status || (pricePaisa > 0 ? "active" : "out_of_stock"),
        updated_at: now,
      })
      .where(eq(products.id, id))
      .run();

    // Update Product Images if imageUrls or imageUrl provided
    const finalUrls: string[] = Array.isArray(imageUrls) && imageUrls.length > 0
      ? imageUrls.filter((u: string) => u.trim() !== "")
      : imageUrl ? [imageUrl] : [];

    if (finalUrls.length > 0) {
      // Clean previous product images
      await db.delete(productImages).where(eq(productImages.product_id, id)).run();

      // Insert new multiple images
      for (let i = 0; i < finalUrls.length; i++) {
        await db
          .insert(productImages)
          .values({
            id: `img-${id}-${i}-${Date.now()}`,
            product_id: id,
            url: finalUrls[i].trim(),
            alt: `${name} Image ${i + 1}`,
            sort_order: i,
            is_primary: i === 0,
          })
          .run();
      }
    }

    revalidatePath("/");
    revalidatePath("/c/[category]", "page");
    revalidatePath("/p/[slug]", "page");

    return NextResponse.json({ success: true, message: `Product "${name}" updated successfully with ${finalUrls.length} images!` });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Failed to update product." }, { status: 500 });
  }
}
