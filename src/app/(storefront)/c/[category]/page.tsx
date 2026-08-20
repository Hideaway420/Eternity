import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { MobileBottomBar } from "@/components/storefront/MobileBottomBar";
import { db, initTables } from "@/db";
import { products, categories, productImages } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { formatNpr } from "@/lib/money";
import { ProductImage } from "@/components/storefront/ProductImage";
import { getPillar, PILLARS } from "@/lib/taxonomy";
import { SlidersHorizontal, ShieldCheck, Palette, Tag, Footprints, Lock, ArrowUpDown } from "lucide-react";

export const revalidate = 60;

interface CategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ line?: string; color?: string; sort?: string }>;
}

// Category-specific SEO metadata. Every pillar gets its own title/description/canonical
// instead of inheriting the homepage's <title>.
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const pillar = getPillar(category);
  if (!pillar) {
    return { title: "Category Not Found" };
  }

  const title = `${pillar.name} in Nepal`;
  const description = `Shop genuine ${pillar.name} in Nepal from Eternity Products. Direct import, 13% VAT inclusive pricing, 1-year replacement warranty, and open-box cash on delivery nationwide.`;

  return {
    title,
    description,
    alternates: { canonical: `/c/${pillar.slug}` },
    openGraph: {
      title: `${title} | Eternity Products`,
      description,
      url: `/c/${pillar.slug}`,
      type: "website",
    },
  };
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
  "manicure-pedicure-spa-furniture": [
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
      badge: "In Stock",
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
      badge: "In Stock",
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
      badge: "In Stock",
      isSpaCategory: true,
    },
  ],
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
      badge: "In Stock",
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
      badge: "In Stock",
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
      badge: "In Stock",
      isSpaCategory: true,
    },
  ],
  "luxury-chairs": [
    {
      id: "prod-etp-chair-01",
      sku: "ETP-LSC-01",
      slug: "eternity-emerald-royal-luxury-salon-chair",
      name: "Eternity Emerald Royal Luxury Salon Chair",
      price_npr: 3500000,
      compare_at_npr: 3685000,
      line: "profit",
      imageUrl: "/products/chair_emerald_green_1786235658712.jpg",
      badge: "In Stock",
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
      badge: "In Stock",
    },
    {
      id: "prod-etp-chair-03",
      sku: "ETP-LSC-03",
      slug: "eternity-burgundy-regal-luxury-salon-chair",
      name: "Eternity Burgundy Regal Luxury Salon Chair",
      price_npr: 3850000,
      compare_at_npr: 4050000,
      line: "profit",
      imageUrl: "/products/chair_burgundy_red_1786235698852.jpg",
      badge: "In Stock",
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
      badge: "In Stock",
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
      badge: "In Stock",
    },
    {
      id: "prod-etp-chair-03",
      sku: "ETP-LSC-03",
      slug: "eternity-burgundy-regal-luxury-salon-chair",
      name: "Eternity Burgundy Regal Luxury Salon Chair",
      price_npr: 3850000,
      compare_at_npr: 4050000,
      line: "profit",
      imageUrl: "/products/chair_burgundy_red_1786235698852.jpg",
      badge: "In Stock",
    },
  ],
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
  eyewear: [
    {
      id: "prod-eye-ph-01",
      sku: "ETP-EYE-01",
      slug: "ray-ban-tech-carbon-fiber-polarized-coming-soon",
      name: "Ray-Ban Tech Carbon Fiber Polarized - Coming Soon",
      price_npr: 0,
      badge: "Coming Soon",
      line: "profit",
      imageUrl: "/products/eyewear_placeholder_1.jpg",
    },
    {
      id: "prod-eye-ph-02",
      sku: "ETP-EYE-02",
      slug: "oakley-radar-ev-path-prizm-sport-coming-soon",
      name: "Oakley Radar EV Path Prizm Sport - Coming Soon",
      price_npr: 0,
      badge: "Coming Soon",
      line: "profit",
      imageUrl: "/products/eyewear_placeholder_2.jpg",
    },
  ],
  "premium-eyewears": [
    {
      id: "prod-eye-ph-01",
      sku: "ETP-EYE-01",
      slug: "ray-ban-tech-carbon-fiber-polarized-coming-soon",
      name: "Carbon Fiber Polarized Tech Eyewear - Coming Soon",
      price_npr: 0,
      badge: "Coming Soon",
      line: "profit",
      imageUrl: "/products/eyewear_placeholder_1.jpg",
    },
    {
      id: "prod-eye-ph-02",
      sku: "ETP-EYE-02",
      slug: "oakley-radar-ev-path-prizm-sport-coming-soon",
      name: "Titanium Sport Shield Eyewear - Coming Soon",
      price_npr: 0,
      badge: "Coming Soon",
      line: "profit",
      imageUrl: "/products/eyewear_placeholder_2.jpg",
    },
  ],
};

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  await initTables();
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const categorySlug = resolvedParams.category;
  const lineFilter = resolvedSearchParams.line;
  const sortFilter = resolvedSearchParams.sort;

  // Unknown slugs (e.g. /c/nike-shoes) must 404, not silently render the eyewear catalogue.
  const pillar = getPillar(categorySlug);
  if (!pillar) {
    notFound();
  }
  const isSpaFurniture = pillar.slug === "manicure-pedicure-spa-furniture";
  // Unstocked pillars never show a price or a buy affordance, even where seed rows carry one.
  const showPrices = pillar.stocked;

  let categoryProducts = CATEGORY_PRODUCTS_MAP[categorySlug] || [];
  let title = pillar.name;

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

  if (sortFilter === "price_asc") {
    categoryProducts = [...categoryProducts].sort((a, b) => a.price_npr - b.price_npr);
  } else if (sortFilter === "price_desc") {
    categoryProducts = [...categoryProducts].sort((a, b) => b.price_npr - a.price_npr);
  }

  const absoluteBase = "https://www.eternityproducts.online";
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${absoluteBase}/` },
      { "@type": "ListItem", position: 2, name: title, item: `${absoluteBase}/c/${pillar.slug}` },
    ],
  };
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: categoryProducts
      .filter((p) => showPrices && p.price_npr > 0)
      .map((p, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${absoluteBase}/p/${p.slug}`,
      })),
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface pb-16 md:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
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
                <Footprints className="w-3.5 h-3.5 mr-1" /> {pillar.name} Collection
              </span>
              <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-on-surface capitalize mt-1">
                {title}
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-2 max-w-2xl font-light">
                {isSpaFurniture
                  ? "Transform your salon into a sanctuary of relaxation. Secured with a convenient 10% - 15% upfront booking deposit. Custom Salon Color Match available (+NPR 6,000)."
                  : "Explore genuine professional tools. Direct import with 13% VAT inclusive pricing, 1-year replacement warranty, and open-box cash on delivery."}
              </p>
            </div>
            {isSpaFurniture && (
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

              {/* Dedicated Category Quick Filters — driven by the taxonomy.ts pillar list */}
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-outline mb-2">Category Catalogue</h4>
                <div className="space-y-1.5 text-xs">
                  {PILLARS.map((p) => (
                    <Link
                      key={p.slug}
                      href={`/c/${p.slug}`}
                      className={`block px-3 py-2 rounded-lg font-bold transition-colors ${
                        categorySlug === p.slug
                          ? "bg-gold/15 text-on-surface border border-gold/40"
                          : "hover:bg-surface-low text-gold"
                      }`}
                    >
                      {p.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Sort Control — the SlidersHorizontal icon above now actually does something */}
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-outline mb-2 flex items-center">
                  <ArrowUpDown className="w-3 h-3 mr-1" /> Sort By Price
                </h4>
                <div className="space-y-1.5 text-xs">
                  <Link
                    href={`/c/${categorySlug}?sort=price_asc`}
                    className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
                      sortFilter === "price_asc"
                        ? "bg-gold/15 text-on-surface font-bold border border-gold/40"
                        : "hover:bg-surface-low"
                    }`}
                  >
                    Price: Low to High
                  </Link>
                  <Link
                    href={`/c/${categorySlug}?sort=price_desc`}
                    className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
                      sortFilter === "price_desc"
                        ? "bg-gold/15 text-on-surface font-bold border border-gold/40"
                        : "hover:bg-surface-low"
                    }`}
                  >
                    Price: High to Low
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
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
                {categoryProducts.map((p) => {
                  return (
                    <Link
                      key={p.id}
                      href={`/p/${p.slug}`}
                      className="group rounded-2xl md:rounded-3xl bg-surface-lowest border border-outline-variant p-2.5 md:p-4 shadow-soft hover:shadow-elevated transition-all duration-150 active:scale-[0.98] flex flex-col justify-between hover:border-gold/60 cursor-pointer"
                    >
                      <div>
                        {/* PRODUCT IMAGE */}
                        <div className="relative aspect-square rounded-xl md:rounded-2xl overflow-hidden bg-surface-low mb-2.5">
                          <ProductImage
                            src={p.imageUrl || "/products/spa_chair_classic.jpg"}
                            alt={p.name}
                            sizes="(max-width: 768px) 50vw, 25vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {p.badge && (
                            <span className="absolute top-1.5 left-1.5 bg-gold text-on-surface text-[8px] md:text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase shadow-md truncate max-w-[90%]">
                              {p.badge}
                            </span>
                          )}
                        </div>
                        
                        <span className="text-[8px] md:text-xs font-mono text-outline uppercase tracking-wider block">
                          {p.sku}
                        </span>
                        {/* PRODUCT TITLE */}
                        <h3 className="font-serif font-bold text-xs sm:text-sm md:text-base text-on-surface group-hover:text-gold transition-colors mt-0.5 leading-snug line-clamp-2">
                          {p.name}
                        </h3>
                      </div>

                      <div className="mt-2.5 pt-2 md:pt-3 border-t border-outline-variant/60 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div>
                          <div className="text-xs sm:text-sm md:text-base font-bold text-on-surface font-sans">
                            {showPrices && p.price_npr > 0 ? formatNpr(p.price_npr) : "Coming Soon"}
                          </div>
                          {showPrices && p.price_npr > 0 && (
                            <span className="text-[8px] md:text-[10px] text-green-700 font-bold block">
                              {p.isSpaCategory ? "15% Upfront Deposit" : "Cash on Delivery"}
                            </span>
                          )}
                        </div>
                        <span className="w-full sm:w-auto text-center px-2.5 py-1.5 rounded-xl bg-gold/15 group-hover:bg-gold text-on-surface text-[10px] md:text-xs font-bold transition-colors shadow-xs">
                          View details
                        </span>
                      </div>
                    </Link>
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
