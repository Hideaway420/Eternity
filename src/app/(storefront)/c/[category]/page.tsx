import React from "react";
import Link from "next/link";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { db, initTables } from "@/db";
import { products, categories, productImages } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { formatNpr } from "@/lib/money";
import { SlidersHorizontal, ShieldCheck, Palette } from "lucide-react";

export const revalidate = 0;

interface CategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ line?: string; color?: string }>;
}

const FALLBACK_CATEGORY_PRODUCTS = [
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
    id: "prod-etp-005",
    sku: "ETP-005",
    slug: "ikonic-barber-chair-felix",
    name: "Ikonic Barber Chair Felix",
    price_npr: 19515000,
    compare_at_npr: null,
    line: "profit",
    imageUrl: "https://www.ikonicworld.com/cdn/shop/files/Felix-IK-8781_1.jpg",
  },
];

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  await initTables();
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const categorySlug = resolvedParams.category;
  const lineFilter = resolvedSearchParams.line;
  const selectedColor = resolvedSearchParams.color;

  let categoryProducts = FALLBACK_CATEGORY_PRODUCTS;
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
      categoryProducts = fetched as typeof FALLBACK_CATEGORY_PRODUCTS;
    }
  } catch (err) {
    console.warn("⚠️ Category DB query fallback active:", err);
  }

  if (lineFilter) {
    categoryProducts = categoryProducts.filter((p) => p.line === lineFilter);
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      <Header />

      <main className="flex-1 py-10 container mx-auto px-4 lg:px-8">
        {/* Breadcrumb */}
        <div className="text-xs text-outline mb-6">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-on-surface font-semibold capitalize">{title}</span>
        </div>

        {/* Category Header */}
        <div className="bg-surface-container-low rounded-2xl p-8 mb-10 border border-outline-variant/60">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-on-surface capitalize">
            {title}
          </h1>
          <p className="text-sm text-on-surface-variant mt-2 max-w-2xl font-light">
            Authorized Ikonic professional hair tools & salon equipment. Direct import with guaranteed 13% VAT inclusive pricing, 1-year replacement warranty, and open-box cash on delivery.
          </p>
        </div>

        {/* Color Swatch Filter Strip */}
        <div className="mb-8 p-4 rounded-2xl bg-surface-lowest border border-outline-variant flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-outline">
            <Palette className="w-4 h-4 text-gold" />
            <span>Filter By Leather / Theme Color:</span>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              href={`/c/${categorySlug}`}
              className={`px-3 py-1.5 rounded-lg border font-semibold transition-colors ${!selectedColor ? "border-gold bg-gold/15 text-on-surface" : "border-outline-variant hover:border-gold/50"}`}
            >
              All Colors
            </Link>
            <Link
              href={`/c/${categorySlug}?color=emerald`}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border font-semibold transition-colors ${selectedColor === "emerald" ? "border-gold bg-gold/15 text-on-surface" : "border-outline-variant hover:border-gold/50"}`}
            >
              <span className="w-3 h-3 rounded-full bg-[#1B4D3E]" />
              <span>Emerald Green</span>
            </Link>
            <Link
              href={`/c/${categorySlug}?color=black`}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border font-semibold transition-colors ${selectedColor === "black" ? "border-gold bg-gold/15 text-on-surface" : "border-outline-variant hover:border-gold/50"}`}
            >
              <span className="w-3 h-3 rounded-full bg-[#1A1A1A]" />
              <span>Obsidian Black</span>
            </Link>
            <Link
              href={`/c/${categorySlug}?color=brown`}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border font-semibold transition-colors ${selectedColor === "brown" ? "border-gold bg-gold/15 text-on-surface" : "border-outline-variant hover:border-gold/50"}`}
            >
              <span className="w-3 h-3 rounded-full bg-[#4A2E1B]" />
              <span>Espresso Brown</span>
            </Link>
          </div>
        </div>

        {/* Catalog Grid with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Filter Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-surface-lowest p-6 rounded-2xl border border-outline-variant space-y-6">
              <div className="flex items-center justify-between border-b border-outline-variant pb-3">
                <h3 className="font-serif font-bold text-base flex items-center">
                  <SlidersHorizontal className="w-4 h-4 mr-2 text-gold" /> Filter Products
                </h3>
                <span className="text-xs text-outline">{categoryProducts.length} items</span>
              </div>

              {/* Product Line Filter */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-outline mb-3">Product Line</h4>
                <div className="space-y-2 text-xs">
                  <Link
                    href={`/c/${categorySlug}`}
                    className={`block px-3 py-2 rounded-lg font-medium transition-colors ${!lineFilter ? "bg-gold/15 text-on-surface font-bold border border-gold/40" : "hover:bg-surface-low"}`}
                  >
                    All Lines
                  </Link>
                  <Link
                    href={`/c/${categorySlug}?line=traffic`}
                    className={`block px-3 py-2 rounded-lg font-medium transition-colors ${lineFilter === "traffic" ? "bg-gold/15 text-on-surface font-bold border border-gold/40" : "hover:bg-surface-low"}`}
                  >
                    D2C Styling Tools (Traffic Line)
                  </Link>
                  <Link
                    href={`/c/${categorySlug}?line=profit`}
                    className={`block px-3 py-2 rounded-lg font-medium transition-colors ${lineFilter === "profit" ? "bg-gold/15 text-on-surface font-bold border border-gold/40" : "hover:bg-surface-low"}`}
                  >
                    B2B Salon Furniture (Profit Line)
                  </Link>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="p-4 rounded-xl bg-surface-low border border-outline-variant/60 text-xs space-y-2">
                <div className="flex items-center text-gold font-bold">
                  <ShieldCheck className="w-4 h-4 mr-1.5" /> 100% Genuine Import
                </div>
                <p className="text-outline text-[11px]">
                  All tools are imported from Ikonic India with verified serial numbers.
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryProducts.map((p) => {
                  const hasDarazAnchor = !!p.compare_at_npr;
                  const isProfitLine = p.line === "profit";

                  return (
                    <div
                      key={p.id}
                      className="group rounded-2xl bg-surface-lowest border border-outline-variant p-5 shadow-soft hover:shadow-elevated transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-surface-low mb-4">
                          <img
                            src={p.imageUrl || "/products/ikonic_straightener_1786231866243.jpg"}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {isProfitLine ? (
                            <span className="absolute top-2 left-2 bg-inverse-surface text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                              Salon B2B Equipment
                            </span>
                          ) : (
                            <span className="absolute top-2 left-2 bg-surface-lowest/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-on-surface uppercase border border-outline-variant">
                              Genuine Ikonic
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-outline uppercase tracking-wider block">
                          SKU: {p.sku}
                        </span>
                        <h3 className="font-serif font-bold text-base text-on-surface group-hover:text-gold transition-colors mt-1 line-clamp-2">
                          {p.name}
                        </h3>
                      </div>

                      <div className="mt-6 pt-4 border-t border-outline-variant/60 flex items-end justify-between">
                        <div>
                          {hasDarazAnchor && (
                            <div className="text-xs text-outline line-through font-mono">
                              Daraz: {formatNpr(p.compare_at_npr!)}
                            </div>
                          )}
                          <div className="text-base font-bold text-on-surface font-sans">
                            {formatNpr(p.price_npr)}
                          </div>
                        </div>
                        <Link
                          href={`/p/${p.slug}`}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                            isProfitLine
                              ? "bg-inverse-surface text-white hover:bg-neutral-800"
                              : "bg-gold text-on-surface hover:bg-gold-hover"
                          }`}
                        >
                          {isProfitLine ? "Get Quote" : "View Item"}
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
    </div>
  );
}
