import React from "react";
import Link from "next/link";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { MobileBottomBar } from "@/components/storefront/MobileBottomBar";
import { db, initTables } from "@/db";
import { products, categories, productImages } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { formatNpr } from "@/lib/money";
import { SlidersHorizontal, ShieldCheck, Palette, Tag } from "lucide-react";

export const revalidate = 0;

interface CategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ line?: string; color?: string }>;
}

// 4 Distinct Product Catalogues for Each Category
const CATEGORY_PRODUCTS_MAP: Record<
  string,
  Array<{
    id: string;
    sku: string;
    slug: string;
    name: string;
    price_npr: number;
    compare_at_npr?: number | null;
    line: string;
    imageUrl: string;
  }>
> = {
  "hair-straighteners": [
    {
      id: "prod-etp-066",
      sku: "ETP-066",
      slug: "ikonic-professional-pro-titanium-shine-3-0-hair-straightener",
      name: "Ikonic Professional Pro Titanium Shine 3.0 Hair Straightener",
      price_npr: 1292000,
      compare_at_npr: 1450000,
      line: "traffic",
      imageUrl: "https://www.ikonicworld.com/cdn/shop/files/8904231015937_1_702816a3-41c8-4c88-92b3-ab4c7779920f.jpg",
    },
    {
      id: "prod-etp-067",
      sku: "ETP-067",
      slug: "ikonic-professional-gleam-pro-hair-straightener",
      name: "Ikonic Professional Gleam Pro Hair Straightener",
      price_npr: 1376000,
      compare_at_npr: 1500000,
      line: "traffic",
      imageUrl: "/products/ikonic_straightener_1786231866243.jpg",
    },
    {
      id: "prod-etp-072",
      sku: "ETP-072",
      slug: "ikonic-professional-s3-ceramic-straightener",
      name: "Ikonic Professional S3+ Ceramic Hair Straightener",
      price_npr: 1150000,
      compare_at_npr: 1300000,
      line: "traffic",
      imageUrl: "https://www.ikonicworld.com/cdn/shop/files/8904231015937_1_702816a3-41c8-4c88-92b3-ab4c7779920f.jpg",
    },
    {
      id: "prod-etp-075",
      sku: "ETP-075",
      slug: "ikonic-professional-vibe-touch-straightener",
      name: "Ikonic Professional Vibe Touch Titanium Straightener",
      price_npr: 1420000,
      compare_at_npr: 1600000,
      line: "traffic",
      imageUrl: "/products/ikonic_straightener_1786231866243.jpg",
    },
  ],
  "hair-dryers": [
    {
      id: "prod-etp-095",
      sku: "ETP-095",
      slug: "ikonic-professional-pro-2500-advanced-hair-dryer",
      name: "Ikonic Professional Pro 2500+ Advanced Hair Dryer",
      price_npr: 1000000,
      compare_at_npr: 1120000,
      line: "traffic",
      imageUrl: "/products/ikonic_blow_dryer_1786231888743.jpg",
    },
    {
      id: "prod-etp-089",
      sku: "ETP-089",
      slug: "ikonic-professional-id-2-0-hair-dryer",
      name: "Ikonic Professional Id 2.0 High-Velocity Hair Dryer",
      price_npr: 2622000,
      compare_at_npr: 2800000,
      line: "traffic",
      imageUrl: "https://www.ikonicworld.com/cdn/shop/files/8904231093140_1_6594bc6f-a625-47f5-863b-04f017f8c9a8.jpg",
    },
    {
      id: "prod-etp-098",
      sku: "ETP-098",
      slug: "ikonic-professional-conical-curling-wand",
      name: "Ikonic Professional Conical Curling Wand 25mm",
      price_npr: 1180000,
      compare_at_npr: 1350000,
      line: "traffic",
      imageUrl: "/products/ikonic_blow_dryer_1786231888743.jpg",
    },
  ],
  "luxury-salon-chairs": [
    {
      id: "prod-etp-chair-01",
      sku: "ETP-LSC-01",
      slug: "eternity-emerald-royal-luxury-salon-chair",
      name: "Eternity Emerald Royal Luxury Salon Chair",
      price_npr: 3500000, // NPR 35,000 (5% OFF)
      compare_at_npr: 3685000,
      line: "profit",
      imageUrl: "/products/chair_emerald_green_1786235658712.jpg",
    },
    {
      id: "prod-etp-chair-02",
      sku: "ETP-LSC-02",
      slug: "eternity-espresso-vintage-luxury-salon-chair",
      name: "Eternity Espresso Vintage Luxury Salon Chair",
      price_npr: 3750000, // NPR 37,500 (5% OFF)
      compare_at_npr: 3950000,
      line: "profit",
      imageUrl: "/products/chair_espresso_brown_1786235685819.jpg",
    },
    {
      id: "prod-etp-chair-03",
      sku: "ETP-LSC-03",
      slug: "eternity-burgundy-regal-luxury-salon-chair",
      name: "Eternity Burgundy Regal Luxury Salon Chair",
      price_npr: 3850000, // NPR 38,500 (5% OFF)
      compare_at_npr: 4050000,
      line: "profit",
      imageUrl: "/products/chair_burgundy_red_1786235698852.jpg",
    },
  ],
  "manicure-pedicure-equipment": [
    {
      id: "prod-etp-mp-01",
      sku: "ETP-MP-01",
      slug: "ikonic-pedicure-foot-spa-manicure-suite",
      name: "Eternity Luxury Pedicure Spa Chair Suite",
      price_npr: 3850000, // NPR 38,500 (5% OFF)
      compare_at_npr: 4050000,
      line: "profit",
      imageUrl: "https://www.ikonicworld.com/cdn/shop/files/IK-3818ELECTRICALBEDBLACK_CHALET.jpg",
    },
    {
      id: "prod-etp-mp-02",
      sku: "ETP-MP-02",
      slug: "ikonic-electric-hydromassage-pedicure-foot-basin",
      name: "Ikonic Electric Hydromassage Pedicure Foot Basin",
      price_npr: 3250000, // NPR 32,500 (5% OFF)
      compare_at_npr: 3450000,
      line: "profit",
      imageUrl: "https://www.ikonicworld.com/cdn/shop/files/IK-1254_Ikonic.jpg",
    },
  ],
};

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  await initTables();
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const categorySlug = resolvedParams.category;
  const lineFilter = resolvedSearchParams.line;
  const selectedColor = resolvedSearchParams.color;

  let categoryProducts = CATEGORY_PRODUCTS_MAP[categorySlug] || CATEGORY_PRODUCTS_MAP["luxury-salon-chairs"];
  let title = categorySlug.replace(/-/g, " ").toUpperCase();

  try {
    const cat = await db.select().from(categories).where(eq(categories.slug, categorySlug)).get();
    if (cat) title = cat.name;

    let baseQuery = db
      .select({
        id: products.id,
        sku: products.sku,
        slug: products.slug,
        name: products.name,
        price_npr: products.price_npr,
        compare_at_npr: products.compare_at_npr,
        line: products.line,
        imageUrl: productImages.url,
      })
      .from(products)
      .leftJoin(productImages, eq(products.id, productImages.product_id));

    let fetched;
    if (cat) {
      fetched = await baseQuery
        .where(and(eq(products.status, "active"), eq(products.category_id, cat.id)))
        .all();
    } else {
      fetched = await baseQuery
        .where(eq(products.status, "active"))
        .all();
    }

    if (fetched && fetched.length > 0) {
      categoryProducts = fetched as typeof CATEGORY_PRODUCTS_MAP["luxury-salon-chairs"];
    }
  } catch (err) {
    console.warn("⚠️ Category DB query fallback active:", err);
  }

  if (lineFilter) {
    categoryProducts = categoryProducts.filter((p) => p.line === lineFilter);
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface pb-16 md:pb-0">
      <Header />

      <main className="flex-1 py-6 sm:py-10 container mx-auto px-3 sm:px-4 lg:px-8">
        {/* Breadcrumb */}
        <div className="text-xs text-outline mb-4 sm:mb-6">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-on-surface font-semibold capitalize">{title}</span>
        </div>

        {/* Category Header with 5% Discount Promo */}
        <div className="bg-surface-container-low rounded-2xl p-5 sm:p-8 mb-6 sm:mb-10 border border-gold/40 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] sm:text-xs uppercase font-bold text-gold tracking-widest block">Authorized Distributor Catalogue</span>
              <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-on-surface capitalize mt-1">
                {title}
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-2 max-w-2xl font-light">
                Explore genuine products in this category. Direct import with guaranteed 13% VAT inclusive pricing, 1-year replacement warranty, and open-box cash on delivery across Nepal.
              </p>
            </div>
            <div className="px-4 py-2 bg-red-600/10 border border-red-600/30 text-red-700 rounded-xl text-xs font-bold flex items-center space-x-2 flex-shrink-0">
              <Tag className="w-4 h-4 text-red-600" />
              <span>5% OFF Limited Offer</span>
            </div>
          </div>
        </div>

        {/* Color Swatch Filter Strip */}
        <div className="mb-6 p-3 sm:p-4 rounded-2xl bg-surface-lowest border border-outline-variant flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-outline">
            <Palette className="w-4 h-4 text-gold" />
            <span>Finish / Leather Filter:</span>
          </div>

          <div className="flex flex-wrap gap-2 text-[11px] sm:text-xs">
            <Link
              href={`/c/${categorySlug}`}
              className={`px-2.5 py-1 rounded-lg border font-semibold transition-colors ${!selectedColor ? "border-gold bg-gold/15 text-on-surface" : "border-outline-variant hover:border-gold/50"}`}
            >
              All Colors
            </Link>
            <Link
              href={`/c/${categorySlug}?color=emerald`}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border font-semibold transition-colors ${selectedColor === "emerald" ? "border-gold bg-gold/15 text-on-surface" : "border-outline-variant hover:border-gold/50"}`}
            >
              <span className="w-3 h-3 rounded-full bg-[#1B4D3E]" />
              <span>Emerald Green</span>
            </Link>
            <Link
              href={`/c/${categorySlug}?color=brown`}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border font-semibold transition-colors ${selectedColor === "brown" ? "border-gold bg-gold/15 text-on-surface" : "border-outline-variant hover:border-gold/50"}`}
            >
              <span className="w-3 h-3 rounded-full bg-[#4A2E1B]" />
              <span>Espresso Brown</span>
            </Link>
          </div>
        </div>

        {/* Catalog Grid with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Filter Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-surface-lowest p-5 rounded-2xl border border-outline-variant space-y-4">
              <div className="flex items-center justify-between border-b border-outline-variant pb-3">
                <h3 className="font-serif font-bold text-sm flex items-center">
                  <SlidersHorizontal className="w-4 h-4 mr-2 text-gold" /> Categories
                </h3>
                <span className="text-xs text-outline">{categoryProducts.length} items</span>
              </div>

              {/* Dedicated Category Quick Filters */}
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-outline mb-2">Category Catalogue</h4>
                <div className="space-y-1.5 text-xs">
                  <Link
                    href="/c/hair-straighteners"
                    className={`block px-3 py-2 rounded-lg font-bold transition-colors ${categorySlug === "hair-straighteners" ? "bg-gold/15 text-on-surface border border-gold/40" : "hover:bg-surface-low"}`}
                  >
                    Hair Straighteners
                  </Link>
                  <Link
                    href="/c/hair-dryers"
                    className={`block px-3 py-2 rounded-lg font-bold transition-colors ${categorySlug === "hair-dryers" ? "bg-gold/15 text-on-surface border border-gold/40" : "hover:bg-surface-low"}`}
                  >
                    Hair Dryers & Curlers
                  </Link>
                  <Link
                    href="/c/luxury-salon-chairs"
                    className={`block px-3 py-2 rounded-lg font-bold transition-colors ${categorySlug === "luxury-salon-chairs" ? "bg-gold/15 text-on-surface border border-gold/40" : "hover:bg-surface-low text-gold"}`}
                  >
                    Luxury Salon Chairs
                  </Link>
                  <Link
                    href="/c/manicure-pedicure-equipment"
                    className={`block px-3 py-2 rounded-lg font-bold transition-colors ${categorySlug === "manicure-pedicure-equipment" ? "bg-spa-blue/30 text-on-surface border border-spa-blue" : "hover:bg-surface-low text-spa-blue"}`}
                  >
                    Luxury Pedicure Spa Chairs
                  </Link>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="p-3.5 rounded-xl bg-surface-low border border-outline-variant/60 text-xs space-y-1.5">
                <div className="flex items-center text-gold font-bold text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> 100% Genuine Import
                </div>
                <p className="text-outline text-[11px]">
                  All tools are imported with verified serial numbers.
                </p>
              </div>
            </div>
          </div>

          {/* Main Products Grid (EVERY IMAGE AND CARD IS CLICKABLE) */}
          <div className="lg:col-span-9 space-y-6">
            {categoryProducts.length === 0 ? (
              <div className="text-center py-16 bg-surface-lowest rounded-2xl border border-outline-variant">
                <p className="text-outline text-base">No products found in this category.</p>
                <Link href="/" className="mt-4 inline-block px-4 py-2 bg-gold text-on-surface text-xs font-bold rounded-xl">
                  Back to Home
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {categoryProducts.map((p) => {
                  const hasDarazAnchor = !!p.compare_at_npr;

                  return (
                    <div
                      key={p.id}
                      className="group rounded-2xl bg-surface-lowest border border-outline-variant p-3 sm:p-5 shadow-soft hover:shadow-elevated transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* CLICKABLE PRODUCT IMAGE */}
                        <Link href={`/p/${p.slug}`} className="block relative aspect-square sm:aspect-[4/3] rounded-xl overflow-hidden bg-surface-low mb-3 group cursor-pointer">
                          <img
                            src={p.imageUrl || "/products/ikonic_straightener_1786231866243.jpg"}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute top-1.5 left-1.5 bg-red-600 text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shadow-sm">
                            5% OFF OFFER
                          </span>
                        </Link>
                        
                        <span className="text-[9px] sm:text-[11px] font-mono text-outline uppercase tracking-wider block">
                          SKU: {p.sku}
                        </span>
                        {/* CLICKABLE PRODUCT TITLE */}
                        <h3 className="font-serif font-bold text-xs sm:text-base text-on-surface group-hover:text-gold transition-colors mt-1 line-clamp-2 leading-tight">
                          <Link href={`/p/${p.slug}`}>{p.name}</Link>
                        </h3>
                      </div>

                      <div className="mt-3 sm:mt-6 pt-3 sm:pt-4 border-t border-outline-variant/60 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                        <div>
                          {hasDarazAnchor && (
                            <div className="text-[10px] sm:text-xs text-outline line-through font-mono">
                              Original: {formatNpr(p.compare_at_npr!)}
                            </div>
                          )}
                          <div className="text-xs sm:text-base font-bold text-on-surface font-sans">
                            {formatNpr(p.price_npr)}
                          </div>
                        </div>
                        {/* CLICKABLE ORDER BUTTON */}
                        <Link
                          href={`/p/${p.slug}`}
                          className="w-full sm:w-auto text-center px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-gold text-on-surface hover:bg-gold-hover text-[10px] sm:text-xs font-bold transition-colors shadow-soft"
                        >
                          View Item
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomBar />
    </div>
  );
}
