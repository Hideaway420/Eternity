import React from "react";
import Link from "next/link";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { MobileBottomBar } from "@/components/storefront/MobileBottomBar";
import { db, initTables } from "@/db";
import { products, categories, productImages } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { formatNpr } from "@/lib/money";
import { SlidersHorizontal, ShieldCheck, Palette, Tag, Footprints, Lock } from "lucide-react";

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
    priceRange?: string;
    badge?: string;
    isSpaCategory?: boolean;
  }>
> = {
  spa: [
    {
      id: "prod-etp-spa-01",
      sku: "ETP-SPA-01",
      slug: "classic-eternity-spa-chair",
      name: "Classic Eternity Spa Chair",
      price_npr: 12000000,
      compare_at_npr: 13000000,
      priceRange: "NPR 115,000 - NPR 130,000",
      line: "profit",
      imageUrl: "/products/spa_chair_classic.jpg",
      badge: "15% Upfront Booking Deposit",
      isSpaCategory: true,
    },
    {
      id: "prod-etp-spa-02",
      sku: "ETP-SPA-02",
      slug: "eternity-elegance-pedicure-station",
      name: "Eternity Elegance Pedicure Station",
      price_npr: 12800000,
      compare_at_npr: 13900000,
      priceRange: "NPR 125,000 - NPR 135,000",
      line: "profit",
      imageUrl: "/products/spa_chair_elegance.jpg",
      badge: "8% OFF Deal (Aug 31st)",
      isSpaCategory: true,
    },
    {
      id: "prod-etp-spa-03",
      sku: "ETP-SPA-03",
      slug: "eternity-luxe-spa-recliner",
      name: "Eternity Luxe Spa Recliner",
      price_npr: 13500000,
      compare_at_npr: 14650000,
      priceRange: "NPR 130,000 - NPR 140,000",
      line: "profit",
      imageUrl: "/products/spa_chair_pink_recliner.jpg",
      badge: "8% OFF Deal (Sept 3rd)",
      isSpaCategory: true,
    },
    {
      id: "prod-etp-spa-04",
      sku: "ETP-SPA-04",
      slug: "eternity-signature-series-limited-edition",
      name: "Eternity Signature Series (Limited Edition)",
      price_npr: 14000000,
      compare_at_npr: 14500000,
      priceRange: "NPR 135,000 - NPR 145,000",
      line: "profit",
      imageUrl: "/products/spa_chair_signature.jpg",
      badge: "Strictly Limited Stock",
      isSpaCategory: true,
    },
  ],
  "hair-straighteners": [
    {
      id: "prod-str-ph-01",
      sku: "ETP-STR-01",
      slug: "eternity-pro-straightener-1-coming-soon",
      name: "Eternity Pro Straightener 1 - Coming Soon",
      price_npr: 0,
      badge: "Out of Stock",
      line: "traffic",
      imageUrl: "/products/ikonic_straightener_1786231866243.jpg",
    },
    {
      id: "prod-str-ph-02",
      sku: "ETP-STR-02",
      slug: "eternity-pro-straightener-2-coming-soon",
      name: "Eternity Pro Straightener 2 - Coming Soon",
      price_npr: 0,
      badge: "Out of Stock",
      line: "traffic",
      imageUrl: "/products/ikonic_straightener_1786231866243.jpg",
    },
    {
      id: "prod-str-ph-03",
      sku: "ETP-STR-03",
      slug: "eternity-pro-straightener-3-coming-soon",
      name: "Eternity Pro Straightener 3 - Coming Soon",
      price_npr: 0,
      badge: "Out of Stock",
      line: "traffic",
      imageUrl: "/products/ikonic_straightener_1786231866243.jpg",
    },
    {
      id: "prod-str-ph-04",
      sku: "ETP-STR-04",
      slug: "eternity-pro-straightener-4-coming-soon",
      name: "Eternity Pro Straightener 4 - Coming Soon",
      price_npr: 0,
      badge: "Out of Stock",
      line: "traffic",
      imageUrl: "/products/ikonic_straightener_1786231866243.jpg",
    },
    {
      id: "prod-str-ph-05",
      sku: "ETP-STR-05",
      slug: "eternity-pro-straightener-5-coming-soon",
      name: "Eternity Pro Straightener 5 - Coming Soon",
      price_npr: 0,
      badge: "Out of Stock",
      line: "traffic",
      imageUrl: "/products/ikonic_straightener_1786231866243.jpg",
    },
  ],
  "hair-dryers": [
    {
      id: "prod-dry-ph-01",
      sku: "ETP-DRY-01",
      slug: "eternity-salon-dryer-1-coming-soon",
      name: "Eternity Salon Dryer 1 - Coming Soon",
      price_npr: 0,
      badge: "Out of Stock",
      line: "traffic",
      imageUrl: "/products/ikonic_blow_dryer_1786231888743.jpg",
    },
    {
      id: "prod-dry-ph-02",
      sku: "ETP-DRY-02",
      slug: "eternity-salon-dryer-2-coming-soon",
      name: "Eternity Salon Dryer 2 - Coming Soon",
      price_npr: 0,
      badge: "Out of Stock",
      line: "traffic",
      imageUrl: "/products/ikonic_blow_dryer_1786231888743.jpg",
    },
    {
      id: "prod-dry-ph-03",
      sku: "ETP-DRY-03",
      slug: "eternity-salon-dryer-3-coming-soon",
      name: "Eternity Salon Dryer 3 - Coming Soon",
      price_npr: 0,
      badge: "Out of Stock",
      line: "traffic",
      imageUrl: "/products/ikonic_blow_dryer_1786231888743.jpg",
    },
    {
      id: "prod-dry-ph-04",
      sku: "ETP-DRY-04",
      slug: "eternity-salon-dryer-4-coming-soon",
      name: "Eternity Salon Dryer 4 - Coming Soon",
      price_npr: 0,
      badge: "Out of Stock",
      line: "traffic",
      imageUrl: "/products/ikonic_blow_dryer_1786231888743.jpg",
    },
    {
      id: "prod-dry-ph-05",
      sku: "ETP-DRY-05",
      slug: "eternity-salon-dryer-5-coming-soon",
      name: "Eternity Salon Dryer 5 - Coming Soon",
      price_npr: 0,
      badge: "Out of Stock",
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
      price_npr: 3500000,
      compare_at_npr: 3685000,
      line: "profit",
      imageUrl: "/products/chair_emerald_green_1786235658712.jpg",
    },
    {
      id: "prod-etp-chair-02",
      sku: "ETP-LSC-02",
      slug: "eternity-espresso-vintage-luxury-salon-chair",
      name: "Eternity Espresso Vintage Luxury Salon Chair",
      price_npr: 3750000,
      compare_at_npr: 3950000,
      line: "profit",
      imageUrl: "/products/chair_espresso_brown_1786235685819.jpg",
    },
  ],
  "manicure-pedicure-equipment": [
    {
      id: "prod-etp-spa-01",
      sku: "ETP-SPA-01",
      slug: "classic-eternity-spa-chair",
      name: "Classic Eternity Spa Chair",
      price_npr: 12000000,
      compare_at_npr: 13000000,
      priceRange: "NPR 115,000 - NPR 130,000",
      line: "profit",
      imageUrl: "/products/spa_chair_classic.jpg",
      badge: "15% Upfront Booking Deposit",
      isSpaCategory: true,
    },
    {
      id: "prod-etp-spa-02",
      sku: "ETP-SPA-02",
      slug: "eternity-elegance-pedicure-station",
      name: "Eternity Elegance Pedicure Station",
      price_npr: 12800000,
      compare_at_npr: 13900000,
      priceRange: "NPR 125,000 - NPR 135,000",
      line: "profit",
      imageUrl: "/products/spa_chair_elegance.jpg",
      badge: "8% OFF Deal (Aug 31st)",
      isSpaCategory: true,
    },
  ],
};

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  await initTables();
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const categorySlug = resolvedParams.category;
  const lineFilter = resolvedSearchParams.line;

  let categoryProducts = CATEGORY_PRODUCTS_MAP[categorySlug] || CATEGORY_PRODUCTS_MAP["spa"];
  let title = categorySlug === "spa" ? "SPA & Pedicure Chair Sanctuary" : categorySlug.replace(/-/g, " ").toUpperCase();

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
      categoryProducts = fetched as typeof CATEGORY_PRODUCTS_MAP["spa"];
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

        {/* Category Header with 10%-15% Upfront Deposit Note */}
        <div className="bg-surface-container-low rounded-2xl p-5 sm:p-8 mb-6 sm:mb-10 border border-gold/40 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] sm:text-xs uppercase font-bold text-gold tracking-widest block flex items-center">
                <Footprints className="w-3.5 h-3.5 mr-1" /> Eternity Luxury Spa Collection
              </span>
              <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-on-surface capitalize mt-1">
                {title}
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-2 max-w-2xl font-light">
                {categorySlug === "spa"
                  ? "Transform your salon into a sanctuary of relaxation. Secured with a convenient 10% - 15% upfront booking deposit. Custom Salon Color Match available (+NPR 6,000)."
                  : "Explore genuine professional tools. Direct import with 13% VAT inclusive pricing, 1-year replacement warranty, and open-box cash on delivery."}
              </p>
            </div>
            {categorySlug === "spa" && (
              <div className="px-4 py-2.5 bg-gold/15 border border-gold/40 text-on-surface rounded-xl text-xs font-bold flex items-center space-x-2 flex-shrink-0">
                <Lock className="w-4 h-4 text-gold" />
                <span>10% - 15% Upfront Booking Deposit</span>
              </div>
            )}
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
                    href="/c/spa"
                    className={`block px-3 py-2 rounded-lg font-bold transition-colors ${categorySlug === "spa" ? "bg-gold/15 text-on-surface border border-gold/40" : "hover:bg-surface-low text-gold"}`}
                  >
                    SPA Collection (10-15% Deposit)
                  </Link>
                  <Link
                    href="/c/luxury-salon-chairs"
                    className={`block px-3 py-2 rounded-lg font-bold transition-colors ${categorySlug === "luxury-salon-chairs" ? "bg-gold/15 text-on-surface border border-gold/40" : "hover:bg-surface-low"}`}
                  >
                    Luxury Salon Chairs (Cash on Delivery)
                  </Link>
                  <Link
                    href="/c/hair-straighteners"
                    className={`block px-3 py-2 rounded-lg font-medium transition-colors ${categorySlug === "hair-straighteners" ? "bg-gold/15 text-on-surface font-bold border border-gold/40" : "hover:bg-surface-low"}`}
                  >
                    Hair Straighteners (Cash on Delivery)
                  </Link>
                  <Link
                    href="/c/hair-dryers"
                    className={`block px-3 py-2 rounded-lg font-medium transition-colors ${categorySlug === "hair-dryers" ? "bg-gold/15 text-on-surface font-bold border border-gold/40" : "hover:bg-surface-low"}`}
                  >
                    Hair Dryers & Curlers (Cash on Delivery)
                  </Link>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="p-3.5 rounded-xl bg-surface-low border border-outline-variant/60 text-xs space-y-1.5">
                <div className="flex items-center text-gold font-bold text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> 100% Genuine Import
                </div>
                <p className="text-outline text-[11px]">
                  Direct import with serialized warranty card included.
                </p>
              </div>
            </div>
          </div>

          {/* Main Products Grid */}
          <div className="lg:col-span-9 space-y-6">
            {categoryProducts.length === 0 ? (
              <div className="text-center py-16 bg-surface-lowest rounded-2xl border border-outline-variant">
                <p className="text-outline text-base">No products found in this category.</p>
                <Link href="/" className="mt-4 inline-block px-4 py-2 bg-gold text-on-surface text-xs font-bold rounded-xl">
                  Back to Home
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
                {categoryProducts.map((p) => {
                  return (
                    <div
                      key={p.id}
                      className="group rounded-2xl bg-surface-lowest border border-outline-variant p-4 sm:p-5 shadow-soft hover:shadow-elevated transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* CLICKABLE PRODUCT IMAGE */}
                        <Link href={`/p/${p.slug}`} className="block relative aspect-[4/3] rounded-xl overflow-hidden bg-surface-low mb-3 group cursor-pointer">
                          <img
                            src={p.imageUrl || "/products/spa_chair_classic.jpg"}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {p.badge && (
                            <span className="absolute top-2 left-2 bg-gold text-on-surface text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shadow-md">
                              {p.badge}
                            </span>
                          )}
                        </Link>
                        
                        <span className="text-[9px] sm:text-[11px] font-mono text-outline uppercase tracking-wider block">
                          SKU: {p.sku}
                        </span>
                        {/* CLICKABLE PRODUCT TITLE */}
                        <h3 className="font-serif font-bold text-base text-on-surface group-hover:text-gold transition-colors mt-1 leading-snug">
                          <Link href={`/p/${p.slug}`}>{p.name}</Link>
                        </h3>
                        {p.priceRange && (
                          <p className="text-xs text-outline mt-0.5">Range: {p.priceRange}</p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-outline-variant/60 flex items-center justify-between gap-2">
                        <div>
                          <div className="text-base sm:text-lg font-bold text-on-surface font-sans">
                            {formatNpr(p.price_npr)}
                          </div>
                          <span className="text-[10px] text-green-700 font-bold block">
                            {p.isSpaCategory ? "15% Upfront Deposit" : "Open-Box Cash on Delivery"}
                          </span>
                        </div>
                        {/* CLICKABLE ORDER BUTTON */}
                        <Link
                          href={`/p/${p.slug}`}
                          className="px-4 py-2.5 rounded-xl bg-gold text-on-surface hover:bg-gold-hover text-xs font-bold transition-colors shadow-soft"
                        >
                          View Details & Reserve
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
