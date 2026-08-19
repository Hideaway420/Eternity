import { NextResponse } from "next/server";
import { db, initTables } from "@/db";
import { products, productImages, inventory } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const FALLBACK_CATALOG = [
  {
    id: "prod-etp-spa-01",
    sku: "ETP-SPA-01",
    slug: "classic-eternity-spa-chair",
    name: "Classic Eternity Spa Chair",
    description: "Transform your salon into a sanctuary of relaxation with the Classic Eternity Spa Chair.",
    price_npr: 12000000,
    compare_at_npr: 13000000,
    cost_npr: 7800000,
    line: "profit",
    status: "active",
    heroImageUrl: "/products/spa_chair_classic.jpg",
    imageUrl: "/products/spa_chair_classic.jpg",
    secondaryImageUrls: ["/products/spa_chair_elegance.jpg"],
    imageUrls: ["/products/spa_chair_classic.jpg", "/products/spa_chair_elegance.jpg"],
  },
  {
    id: "prod-etp-spa-02",
    sku: "ETP-SPA-02",
    slug: "eternity-elegance-pedicure-station",
    name: "Eternity Elegance Pedicure Station",
    description: "Gold standard of foot care with quiet massage mechanics.",
    price_npr: 12800000,
    compare_at_npr: 13900000,
    cost_npr: 8200000,
    line: "profit",
    status: "active",
    heroImageUrl: "/products/spa_chair_elegance.jpg",
    imageUrl: "/products/spa_chair_elegance.jpg",
    secondaryImageUrls: [],
    imageUrls: ["/products/spa_chair_elegance.jpg"],
  },
  {
    id: "prod-etp-spa-03",
    sku: "ETP-SPA-03",
    slug: "eternity-luxe-spa-recliner",
    name: "Eternity Luxe Spa Recliner",
    description: "VIP Spa recliner engineered for luxury wellness resorts.",
    price_npr: 13500000,
    compare_at_npr: 14650000,
    cost_npr: 8700000,
    line: "profit",
    status: "active",
    heroImageUrl: "/products/spa_chair_pink_recliner.jpg",
    imageUrl: "/products/spa_chair_pink_recliner.jpg",
    secondaryImageUrls: [],
    imageUrls: ["/products/spa_chair_pink_recliner.jpg"],
  },
  {
    id: "prod-etp-spa-04",
    sku: "ETP-SPA-04",
    slug: "eternity-signature-series-limited-edition",
    name: "Eternity Signature Series (Limited Edition)",
    description: "Pinnacle of salon luxury. Hand-stitched detailing and memory foam.",
    price_npr: 14000000,
    compare_at_npr: 14500000,
    cost_npr: 9000000,
    line: "profit",
    status: "active",
    heroImageUrl: "/products/spa_chair_signature.jpg",
    imageUrl: "/products/spa_chair_signature.jpg",
    secondaryImageUrls: [],
    imageUrls: ["/products/spa_chair_signature.jpg"],
  },
  {
    id: "prod-etp-chair-01",
    sku: "ETP-LSC-01",
    slug: "eternity-emerald-royal-luxury-salon-chair",
    name: "Eternity Emerald Royal Luxury Salon Chair",
    description: "Heavy-duty hydraulic reclining chair in Emerald Green leather.",
    price_npr: 3500000,
    compare_at_npr: 3685000,
    cost_npr: 2200000,
    line: "profit",
    status: "active",
    heroImageUrl: "/products/chair_emerald_green_1786235658712.jpg",
    imageUrl: "/products/chair_emerald_green_1786235658712.jpg",
    secondaryImageUrls: [],
    imageUrls: ["/products/chair_emerald_green_1786235658712.jpg"],
  },
  {
    id: "prod-etp-chair-02",
    sku: "ETP-LSC-02",
    slug: "eternity-espresso-vintage-luxury-salon-chair",
    name: "Eternity Espresso Vintage Luxury Salon Chair",
    description: "Vintage Espresso Brown leather hydraulic styling chair.",
    price_npr: 3750000,
    compare_at_npr: 3950000,
    cost_npr: 2350000,
    line: "profit",
    status: "active",
    heroImageUrl: "/products/chair_espresso_brown_1786235685819.jpg",
    imageUrl: "/products/chair_espresso_brown_1786235685819.jpg",
    secondaryImageUrls: [],
    imageUrls: ["/products/chair_espresso_brown_1786235685819.jpg"],
  },
  {
    id: "prod-etp-chair-03",
    sku: "ETP-LSC-03",
    slug: "eternity-burgundy-regal-luxury-salon-chair",
    name: "Eternity Burgundy Regal Luxury Salon Chair",
    description: "Regal Burgundy Red leather reclining chair.",
    price_npr: 3850000,
    compare_at_npr: 4050000,
    cost_npr: 2400000,
    line: "profit",
    status: "active",
    heroImageUrl: "/products/chair_burgundy_red_1786235698852.jpg",
    imageUrl: "/products/chair_burgundy_red_1786235698852.jpg",
    secondaryImageUrls: [],
    imageUrls: ["/products/chair_burgundy_red_1786235698852.jpg"],
  },
  {
    id: "prod-eye-ph-01",
    sku: "ETP-EYE-01",
    slug: "ray-ban-tech-carbon-fiber-polarized-coming-soon",
    name: "Ray-Ban Tech Carbon Fiber Polarized - Coming Soon",
    description: "Ultra-lightweight carbon fiber polarized premium eyewear. Coming soon to Eternity Nepal.",
    price_npr: 0,
    compare_at_npr: 0,
    cost_npr: 0,
    line: "eyewear",
    status: "out_of_stock",
    heroImageUrl: "/products/antigravity_eyewear.jpg",
    imageUrl: "/products/antigravity_eyewear.jpg",
    secondaryImageUrls: [],
    imageUrls: ["/products/antigravity_eyewear.jpg"],
  },
  {
    id: "prod-eye-ph-02",
    sku: "ETP-EYE-02",
    slug: "oakley-radar-ev-path-prizm-coming-soon",
    name: "Oakley Radar EV Path Prizm - Coming Soon",
    description: "High-definition Prizm optics for sports performance. Coming soon to Eternity Nepal.",
    price_npr: 0,
    compare_at_npr: 0,
    cost_npr: 0,
    line: "eyewear",
    status: "out_of_stock",
    heroImageUrl: "/products/antigravity_eyewear.jpg",
    imageUrl: "/products/antigravity_eyewear.jpg",
    secondaryImageUrls: [],
    imageUrls: ["/products/antigravity_eyewear.jpg"],
  },
  {
    id: "prod-str-ph-01",
    sku: "ETP-STR-01",
    slug: "eternity-pro-straightener-1-coming-soon",
    name: "Eternity Pro Straightener 1 - Coming Soon",
    description: "Next-generation professional titanium hair straightener. Coming soon to Eternity Nepal.",
    price_npr: 0,
    compare_at_npr: 0,
    cost_npr: 0,
    line: "traffic",
    status: "out_of_stock",
    heroImageUrl: "/products/ikonic_straightener_1786231866243.jpg",
    imageUrl: "/products/ikonic_straightener_1786231866243.jpg",
    secondaryImageUrls: [],
    imageUrls: ["/products/ikonic_straightener_1786231866243.jpg"],
  },
  {
    id: "prod-str-ph-02",
    sku: "ETP-STR-02",
    slug: "eternity-pro-straightener-2-coming-soon",
    name: "Eternity Pro Straightener 2 - Coming Soon",
    description: "Next-generation professional titanium hair straightener. Coming soon to Eternity Nepal.",
    price_npr: 0,
    compare_at_npr: 0,
    cost_npr: 0,
    line: "traffic",
    status: "out_of_stock",
    heroImageUrl: "/products/ikonic_straightener_1786231866243.jpg",
    imageUrl: "/products/ikonic_straightener_1786231866243.jpg",
    secondaryImageUrls: [],
    imageUrls: ["/products/ikonic_straightener_1786231866243.jpg"],
  },
  {
    id: "prod-dry-ph-01",
    sku: "ETP-DRY-01",
    slug: "eternity-salon-dryer-1-coming-soon",
    name: "Eternity Salon Dryer 1 - Coming Soon",
    description: "High-velocity professional salon blow dryer with AC motor. Coming soon to Eternity Nepal.",
    price_npr: 0,
    compare_at_npr: 0,
    cost_npr: 0,
    line: "traffic",
    status: "out_of_stock",
    heroImageUrl: "/products/ikonic_blow_dryer_1786231888743.jpg",
    imageUrl: "/products/ikonic_blow_dryer_1786231888743.jpg",
    secondaryImageUrls: [],
    imageUrls: ["/products/ikonic_blow_dryer_1786231888743.jpg"],
  },
];

export async function GET() {
  try {
    await initTables();

    let allProducts = await db
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

    // If DB has 0 items (e.g. read-only memory DB or post-migration reset), seed and fallback
    if (!allProducts || allProducts.length === 0) {
      await initTables();
      allProducts = await db
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
        .all();
    }

    if (!allProducts || allProducts.length === 0) {
      return NextResponse.json({ success: true, products: FALLBACK_CATALOG });
    }

    // Fetch images for all products
    const allImages = await db
      .select()
      .from(productImages)
      .orderBy(asc(productImages.sort_order))
      .all();

    const productsWithImages = allProducts.map((p) => {
      const pImgs = allImages.filter((img) => img.product_id === p.id);
      const heroImg = pImgs.find((img) => img.is_primary)?.url || pImgs[0]?.url || "/products/ikonic_straightener_1786231866243.jpg";
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
    console.warn("⚠️ Error fetching admin products, using fallback catalog:", err);
    return NextResponse.json({ success: true, products: FALLBACK_CATALOG });
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
      heroImageUrl,
      imageUrl,
      secondaryImageUrls,
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

    // Organize Hero Cover Image vs Secondary Thumbnail Images
    const heroUrl = heroImageUrl || imageUrl || (Array.isArray(imageUrls) && imageUrls[0]) || "/products/ikonic_straightener_1786231866243.jpg";
    const secondaries = Array.isArray(secondaryImageUrls)
      ? secondaryImageUrls
      : Array.isArray(imageUrls)
      ? imageUrls.filter((u: string) => u !== heroUrl)
      : [];

    const finalUrls = [heroUrl, ...secondaries.filter((u: string) => u && u.trim() !== "" && u !== heroUrl)];

    // Insert Multiple Product Images into Turso DB
    for (let i = 0; i < finalUrls.length; i++) {
      await db
        .insert(productImages)
        .values({
          id: `img-${productId}-${i}-${Date.now()}`,
          product_id: productId,
          url: finalUrls[i].trim(),
          alt: i === 0 ? `${name} - Hero Image` : `${name} - Secondary Photo ${i}`,
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
      message: "Product created successfully with Hero & Secondary images!",
      product: {
        id: productId,
        sku,
        slug: generatedSlug,
        name,
        price_npr: pricePaisa,
        heroImageUrl: heroUrl,
        secondaryImageUrls: secondaries,
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
      heroImageUrl,
      imageUrl,
      secondaryImageUrls,
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

    // Organize Hero Cover Image vs Secondary Images
    const heroUrl = heroImageUrl || imageUrl || (Array.isArray(imageUrls) && imageUrls[0]);
    const secondaries = Array.isArray(secondaryImageUrls)
      ? secondaryImageUrls
      : Array.isArray(imageUrls)
      ? imageUrls.filter((u: string) => u !== heroUrl)
      : [];

    const finalUrls = heroUrl
      ? [heroUrl, ...secondaries.filter((u: string) => u && u.trim() !== "" && u !== heroUrl)]
      : secondaries;

    if (finalUrls.length > 0) {
      // Clean previous product images
      await db.delete(productImages).where(eq(productImages.product_id, id)).run();

      // Insert new Hero & Secondary images
      for (let i = 0; i < finalUrls.length; i++) {
        await db
          .insert(productImages)
          .values({
            id: `img-${id}-${i}-${Date.now()}`,
            product_id: id,
            url: finalUrls[i].trim(),
            alt: i === 0 ? `${name} - Hero Image` : `${name} - Secondary Photo ${i}`,
            sort_order: i,
            is_primary: i === 0,
          })
          .run();
      }
    }

    revalidatePath("/");
    revalidatePath("/c/[category]", "page");
    revalidatePath("/p/[slug]", "page");

    return NextResponse.json({ success: true, message: `Product "${name}" updated successfully with Hero and ${finalUrls.length - 1} secondary images!` });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Failed to update product." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await initTables();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Product ID parameter is required for deletion." }, { status: 400 });
    }

    // 1. Delete all associated product images
    await db.delete(productImages).where(eq(productImages.product_id, id)).run();

    // 2. Delete all associated inventory items
    await db.delete(inventory).where(eq(inventory.product_id, id)).run();

    // 3. Delete product record from database
    await db.delete(products).where(eq(products.id, id)).run();

    // Instant Revalidation across Storefront
    revalidatePath("/");
    revalidatePath("/c/[category]", "page");
    revalidatePath("/p/[slug]", "page");

    return NextResponse.json({
      success: true,
      message: `Product ID "${id}" and all associated images and pages were permanently deleted.`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Failed to delete product." }, { status: 500 });
  }
}
