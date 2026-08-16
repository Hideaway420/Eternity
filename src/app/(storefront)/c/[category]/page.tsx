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
  "manicure-pedicure-spa-furniture": [],
  spa: [],
  "luxury-chairs": [],
  "luxury-salon-chairs": [],
  "hair-straighteners": Array.from({ length: 10 }).map((_, idx) => {
    const num = idx + 1;
    const numStr = num < 10 ? `0${num}` : `${num}`;
    return {
      id: `prod-str-ph-${numStr}`,
      sku: `ETP-STR-${numStr}`,
      slug: `eternity-pro-straightener-${num}-coming-soon`,
      name: `Eternity Pro Straightener ${num} - Coming Soon`,
      price_npr: 0,
      badge: "Out of Stock",
      line: "traffic",
      imageUrl: "/products/ikonic_straightener_1786231866243.jpg",
    };
  }),
  straighteners: Array.from({ length: 10 }).map((_, idx) => {
    const num = idx + 1;
    const numStr = num < 10 ? `0${num}` : `${num}`;
    return {
      id: `prod-str-ph-${numStr}`,
      sku: `ETP-STR-${numStr}`,
      slug: `eternity-pro-straightener-${num}-coming-soon`,
      name: `Eternity Pro Straightener ${num} - Coming Soon`,
      price_npr: 0,
      badge: "Out of Stock",
      line: "traffic",
      imageUrl: "/products/ikonic_straightener_1786231866243.jpg",
    };
  }),
  "hair-dryers-curlers": Array.from({ length: 10 }).map((_, idx) => {
    const num = idx + 1;
    const numStr = num < 10 ? `0${num}` : `${num}`;
    return {
      id: `prod-dry-ph-${numStr}`,
      sku: `ETP-DRY-${numStr}`,
      slug: `eternity-salon-dryer-${num}-coming-soon`,
      name: `Eternity Salon Dryer ${num} - Coming Soon`,
      price_npr: 0,
      badge: "Out of Stock",
      line: "traffic",
      imageUrl: "/products/ikonic_blow_dryer_1786231888743.jpg",
    };
  }),
  "hair-dryers": Array.from({ length: 10 }).map((_, idx) => {
    const num = idx + 1;
    const numStr = num < 10 ? `0${num}` : `${num}`;
    return {
      id: `prod-dry-ph-${numStr}`,
      sku: `ETP-DRY-${numStr}`,
      slug: `eternity-salon-dryer-${num}-coming-soon`,
      name: `Eternity Salon Dryer ${num} - Coming Soon`,
      price_npr: 0,
      badge: "Out of Stock",
      line: "traffic",
      imageUrl: "/products/ikonic_blow_dryer_1786231888743.jpg",
    };
  }),
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

    if (cat) {
      const fetched = await baseQuery
        .where(eq(products.category_id, cat.id))
        .all();

      if (fetched && fetched.length > 0) {
        categoryProducts = fetched as typeof CATEGORY_PRODUCTS_MAP["spa"];
      }
    } else {
      // Strict Silo: No fallback to all products or spa category
      categoryProducts = CATEGORY_PRODUCTS_MAP[categorySlug] || [];
    }
  } catch (err) {
    console.warn("⚠️ Category DB query fallback active:", err);
    categoryProducts = CATEGORY_PRODUCTS_MAP[categorySlug] || [];
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
                    href="/c/manicure-pedicure-spa-furniture"
                    className={`block px-3 py-2 rounded-lg font-bold transition-colors ${
                      categorySlug === "manicure-pedicure-spa-furniture" || categorySlug === "spa"
                        ? "bg-gold/15 text-on-surface border border-gold/40"
                        : "hover:bg-surface-low text-gold"
                    }`}
                  >
                    Manicure & Pedicure Spa Furniture
                  </Link>
                  <Link
                    href="/c/luxury-chairs"
                    className={`block px-3 py-2 rounded-lg font-bold transition-colors ${
                      categorySlug === "luxury-chairs" || categorySlug === "luxury-salon-chairs"
                        ? "bg-gold/15 text-on-surface border border-gold/40"
                        : "hover:bg-surface-low"
                    }`}
                  >
                    Luxury Chairs
                  </Link>
                  <Link
                    href="/c/hair-straighteners"
                    className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
                      categorySlug === "hair-straighteners" || categorySlug === "straighteners"
                        ? "bg-gold/15 text-on-surface font-bold border border-gold/40"
                        : "hover:bg-surface-low"
                    }`}
                  >
                    Hair Straighteners
                  </Link>
                  <Link
                    href="/c/hair-dryers-curlers"
                    className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
                      categorySlug === "hair-dryers-curlers" || categorySlug === "hair-dryers"
                        ? "bg-gold/15 text-on-surface font-bold border border-gold/40"
                        : "hover:bg-surface-low"
                    }`}
                  >
                    Hair Dryers & Curlers
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
