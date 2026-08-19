import React from "react";
import Link from "next/link";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { MobileBottomBar } from "@/components/storefront/MobileBottomBar";
import { TopLoadingBar } from "@/components/storefront/TopLoadingBar";
import { SalonCalculatorWidget } from "@/components/storefront/SalonCalculatorWidget";
import { InteractiveColorSection } from "@/components/storefront/InteractiveColorSection";
import { db, initTables } from "@/db";
import { products, productImages, categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatNpr } from "@/lib/money";
import { ShieldCheck, Sparkles, ArrowRight, CheckCircle2, Building2, Flame, Check, Footprints, Armchair, Tag, Lock } from "lucide-react";

// Task 4: Incremental Static Regeneration (ISR) with 60-second revalidation
export const revalidate = 60;

// Task 2: Fetch Hero Product (where is_hero = true)
async function getHeroProduct() {
  try {
    await initTables();
    const res = await db
      .select({
        id: products.id,
        sku: products.sku,
        slug: products.slug,
        name: products.name,
        description: products.description,
        price_npr: products.price_npr,
        imageUrl: productImages.url,
      })
      .from(products)
      .leftJoin(productImages, eq(products.id, productImages.product_id))
      .where(eq(products.is_hero, true))
      .get();

    if (res && res.imageUrl) return res;
  } catch (err) {
    console.warn("⚠️ getHeroProduct DB fetch fallback active:", err);
  }

  return {
    id: "prod-etp-spa-01",
    sku: "ETP-SPA-01",
    slug: "classic-eternity-spa-chair",
    name: "Classic Eternity Spa Chair",
    description: "Transform your salon into a sanctuary of relaxation with the Classic Eternity Spa Chair. Ergonomic plush cushioning with foot hydromassage.",
    price_npr: 12000000,
    imageUrl: "/products/spa_chair_classic.jpg",
  };
}

// Task 2: Fetch Featured Products (where is_featured = true)
async function getFeaturedProducts() {
  try {
    await initTables();
    const res = await db
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
      .leftJoin(productImages, eq(products.id, productImages.product_id))
      .where(eq(products.is_featured, true))
      .all();

    if (res && res.length > 0) return res;
  } catch (err) {
    console.warn("⚠️ getFeaturedProducts DB fetch fallback active:", err);
  }

  return [
    {
      id: "prod-etp-spa-02",
      sku: "ETP-SPA-02",
      slug: "eternity-elegance-pedicure-station",
      name: "Eternity Elegance Pedicure Station",
      price_npr: 12800000,
      compare_at_npr: 13900000,
      line: "profit",
      imageUrl: "/products/spa_chair_elegance.jpg",
    },
    {
      id: "prod-etp-spa-03",
      sku: "ETP-SPA-03",
      slug: "eternity-luxe-spa-recliner",
      name: "Eternity Luxe Spa Recliner",
      price_npr: 13500000,
      compare_at_npr: 14650000,
      line: "profit",
      imageUrl: "/products/spa_chair_pink_recliner.jpg",
    },
    {
      id: "prod-etp-spa-04",
      sku: "ETP-SPA-04",
      slug: "eternity-signature-series-limited-edition",
      name: "Eternity Signature Series (Limited Edition)",
      price_npr: 14000000,
      compare_at_npr: 14500000,
      line: "profit",
      imageUrl: "/products/spa_chair_signature.jpg",
    },
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
    {
      id: "prod-etp-chair-03",
      sku: "ETP-LSC-03",
      slug: "eternity-burgundy-regal-luxury-salon-chair",
      name: "Eternity Burgundy Regal Luxury Salon Chair",
      price_npr: 3850000,
      compare_at_npr: 4050000,
      line: "profit",
      imageUrl: "/products/chair_burgundy_red_1786235698852.jpg",
    },
  ];
}

// Task 1: Fetch Styling Tools (category_slug = 'hair-dryers-curlers' LIMIT 4)
async function getStylingTools() {
  try {
    await initTables();
    const res = await db
      .select({
        id: products.id,
        sku: products.sku,
        slug: products.slug,
        name: products.name,
        price_npr: products.price_npr,
        status: products.status,
        imageUrl: productImages.url,
      })
      .from(products)
      .leftJoin(productImages, eq(products.id, productImages.product_id))
      .leftJoin(categories, eq(products.category_id, categories.id))
      .where(eq(categories.slug, "hair-dryers-curlers"))
      .limit(4)
      .all();

    if (res && res.length > 0) return res;
  } catch (err) {
    console.warn("⚠️ getStylingTools DB fetch fallback active:", err);
  }

  return Array.from({ length: 4 }).map((_, idx) => {
    const num = idx + 1;
    const numStr = num < 10 ? `0${num}` : `${num}`;
    return {
      id: `prod-dry-ph-${numStr}`,
      sku: `ETP-DRY-${numStr}`,
      slug: `eternity-salon-dryer-${num}-coming-soon`,
      name: `Eternity Salon Dryer ${num} - Coming Soon`,
      price_npr: 0,
      status: "out_of_stock",
      imageUrl: "/products/ikonic_blow_dryer_1786231888743.jpg",
    };
  });
}

export default async function HomePage() {
  // Task 1: Concurrent database queries via Promise.all for peak performance
  const [heroProduct, featuredProducts, stylingTools] = await Promise.all([
    getHeroProduct(),
    getFeaturedProducts(),
    getStylingTools(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface pb-16 md:pb-0">
      <TopLoadingBar />
      <Header />

      <main className="flex-1 space-y-12 sm:space-y-20 pb-16">
        {/* Section 1: Dynamic Hero Banner */}
        <section className="relative bg-surface-container-low border-b border-outline-variant/60 overflow-hidden py-10 sm:py-16 lg:py-24">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gold/15 via-spa-blue/20 to-transparent pointer-events-none" />
          <div className="container mx-auto px-4 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-4 sm:space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gold/15 text-on-surface border border-gold/40 text-[11px] sm:text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                <span>Nepal&apos;s Authorized Ikonic & Eternity Importer</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-on-surface leading-[1.15]">
                {heroProduct.name}
              </h1>
              <p className="text-sm sm:text-lg text-on-surface-variant font-light leading-relaxed max-w-2xl">
                {heroProduct.description || "Transform your salon into a sanctuary of relaxation. Direct Nepal import with open-box Cash on Delivery."}
              </p>
              <div className="pt-2 flex flex-wrap gap-3 sm:gap-4 items-center">
                <Link
                  href={`/p/${heroProduct.slug}`}
                  className="px-5 py-3.5 sm:px-6 sm:py-4 rounded-xl bg-gold hover:bg-gold-hover text-on-surface font-bold text-xs sm:text-sm shadow-gold transition-all flex items-center space-x-2"
                >
                  <Footprints className="w-4 h-4 text-on-surface" />
                  <span>Shop Featured Hero Item ({formatNpr(heroProduct.price_npr)})</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/c/luxury-chairs"
                  className="px-5 py-3.5 sm:px-6 sm:py-4 rounded-xl bg-inverse-surface text-white hover:bg-neutral-800 font-bold text-xs sm:text-sm transition-all flex items-center space-x-2 shadow-soft"
                >
                  <Armchair className="w-4 h-4 text-gold" />
                  <span className="text-white font-bold">Explore Luxury Chairs</span>
                </Link>
              </div>

              <div className="pt-4 sm:pt-6 grid grid-cols-3 gap-2 sm:gap-4 border-t border-outline-variant/60 text-[10px] sm:text-xs text-on-surface-variant">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                  <span>100% Genuine Seal</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                  <span>15% Spa Booking Deposit</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                  <span>1-Yr Warranty</span>
                </div>
              </div>
            </div>

            {/* Dynamic Hero Image Showcase */}
            <div className="lg:col-span-5 relative">
              <Link
                href={`/p/${heroProduct.slug}`}
                className="block relative rounded-3xl overflow-hidden shadow-elevated border-2 border-gold/60 bg-surface-lowest group hover:ring-4 hover:ring-gold/30 transition-all cursor-pointer"
              >
                <img
                  src={heroProduct.imageUrl || "/products/spa_chair_classic.jpg"}
                  alt={heroProduct.name}
                  className="w-full h-[320px] sm:h-[420px] object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Badge */}
                <div className="absolute top-4 right-4 bg-gold text-on-surface px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md flex items-center space-x-1 z-20">
                  <Sparkles className="w-3 h-3" />
                  <span>HERO FEATURE</span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 p-3 sm:p-4 glass-card rounded-2xl border border-white/60 z-20">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-gold font-bold tracking-wider block">
                        {heroProduct.sku} • In Stock
                      </span>
                      <h3 className="font-serif font-bold text-xs sm:text-sm text-on-surface line-clamp-1">
                        {heroProduct.name}
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xs sm:text-sm font-bold text-gold font-sans block">
                        {formatNpr(heroProduct.price_npr)}
                      </span>
                      <span className="text-[9px] text-outline font-semibold">Nepal Delivery</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Section 2: Interactive Color Matcher */}
        <section className="container mx-auto px-4 lg:px-8">
          <InteractiveColorSection />
        </section>

        {/* Section 3: Categories Showcase */}
        <section className="container mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-end mb-6 sm:mb-8">
            <div>
              <span className="text-[11px] sm:text-xs uppercase tracking-widest text-gold font-bold">Catalogue</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight mt-1">Explore By Category</h2>
            </div>
            <Link href="/c/manicure-pedicure-spa-furniture" className="text-xs font-bold text-gold hover:underline flex items-center">
              View All Categories <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
            <Link href="/c/manicure-pedicure-spa-furniture" className="group p-3.5 sm:p-5 rounded-2xl bg-gold/15 hover:bg-gold/30 border border-gold/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-surface-lowest flex items-center justify-center text-gold mb-3 group-hover:scale-110 transition-transform text-lg font-bold">
                <Footprints className="w-5 h-5 text-gold" />
              </div>
              <h3 className="font-serif font-semibold text-xs sm:text-base text-on-surface group-hover:text-gold transition-colors">Spa Furniture</h3>
              <p className="text-[10px] sm:text-xs text-gold font-bold mt-1">Pedicure Stations (15% Deposit)</p>
            </Link>

            <Link href="/c/luxury-chairs" className="group p-3.5 sm:p-5 rounded-2xl bg-surface-container hover:bg-gold-light/40 border border-outline-variant transition-all">
              <div className="w-10 h-10 rounded-xl bg-surface-lowest flex items-center justify-center text-gold mb-3 group-hover:scale-110 transition-transform text-lg font-bold">
                <Armchair className="w-5 h-5 text-gold" />
              </div>
              <h3 className="font-serif font-semibold text-xs sm:text-base group-hover:text-gold transition-colors">Luxury Chairs</h3>
              <p className="text-[10px] sm:text-xs text-outline mt-1">Hydraulic Styling Chairs</p>
            </Link>

            <Link href="/c/eyewear" className="group p-3.5 sm:p-5 rounded-2xl bg-surface-container hover:bg-gold-light/40 border border-outline-variant transition-all">
              <div className="w-10 h-10 rounded-xl bg-surface-lowest flex items-center justify-center text-gold mb-3 group-hover:scale-110 transition-transform text-lg font-bold">
                🕶️
              </div>
              <h3 className="font-serif font-semibold text-xs sm:text-base group-hover:text-gold transition-colors">Premium Eyewear</h3>
              <p className="text-[10px] sm:text-xs text-outline mt-1">Oakley & Ray-Ban Tech</p>
            </Link>

            <Link href="/c/hair-straighteners" className="group p-3.5 sm:p-5 rounded-2xl bg-surface-container hover:bg-gold-light/40 border border-outline-variant transition-all">
              <div className="w-10 h-10 rounded-xl bg-surface-lowest flex items-center justify-center text-gold mb-3 group-hover:scale-110 transition-transform text-lg font-bold">
                ✨
              </div>
              <h3 className="font-serif font-semibold text-xs sm:text-base group-hover:text-gold transition-colors">Straighteners</h3>
              <p className="text-[10px] sm:text-xs text-outline mt-1">Ikonic Titanium Series</p>
            </Link>

            <Link href="/c/hair-dryers-curlers" className="group p-3.5 sm:p-5 rounded-2xl bg-surface-container hover:bg-gold-light/40 border border-outline-variant transition-all">
              <div className="w-10 h-10 rounded-xl bg-surface-lowest flex items-center justify-center text-gold mb-3 group-hover:scale-110 transition-transform text-lg font-bold">
                💨
              </div>
              <h3 className="font-serif font-semibold text-xs sm:text-base group-hover:text-gold transition-colors">Dryers & Curlers</h3>
              <p className="text-[10px] sm:text-xs text-outline mt-1">High-Velocity Blow Dryers</p>
            </Link>
          </div>
        </section>

        {/* Section 4: Dynamic Featured Products Showcase */}
        <section className="container mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-end mb-6 sm:mb-8">
            <div>
              <span className="text-[11px] sm:text-xs uppercase tracking-widest text-gold font-bold">Curated Selection</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight mt-1">Featured Storefront Collection</h2>
            </div>
            <Link href="/c/manicure-pedicure-spa-furniture" className="text-xs font-bold text-gold hover:underline flex items-center">
              Browse All <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6">
            {featuredProducts.map((p) => (
              <Link
                key={p.id}
                href={`/p/${p.slug}`}
                className="group rounded-2xl md:rounded-3xl bg-surface-container-low border border-outline-variant hover:border-gold/60 p-2.5 md:p-4 transition-all duration-150 active:scale-[0.98] hover:shadow-elevated flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="relative aspect-square rounded-xl md:rounded-2xl overflow-hidden bg-surface-lowest mb-2.5 md:mb-3.5">
                    <img
                      src={p.imageUrl || "/products/spa_chair_classic.jpg"}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 right-2 md:top-3 md:right-3 bg-inverse-surface/80 backdrop-blur-md text-white px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-[8px] md:text-[10px] font-bold font-mono">
                      {p.sku}
                    </span>
                  </div>

                  <span className="text-[9px] md:text-xs font-mono text-outline uppercase tracking-wider block mb-0.5">
                    Official Eternity
                  </span>
                  <h3 className="font-serif font-bold text-xs sm:text-sm md:text-base text-on-surface group-hover:text-gold transition-colors line-clamp-2 mb-1">
                    {p.name}
                  </h3>
                </div>

                <div className="pt-2 md:pt-3 border-t border-outline-variant/60 flex flex-col sm:flex-row sm:items-center justify-between gap-1 mt-2">
                  <div>
                    <span className="text-[9px] md:text-xs text-outline block">Direct Importer Price</span>
                    <span className="font-bold text-xs md:text-base text-gold font-sans">{formatNpr(p.price_npr)}</span>
                  </div>
                  <span className="w-full sm:w-auto text-center px-2.5 py-1.5 rounded-xl bg-gold/15 text-on-surface font-bold text-[10px] md:text-xs group-hover:bg-gold transition-colors flex items-center justify-center space-x-1">
                    <span>View Item</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Section 5: Professional Hair Dryers & Curlers Row */}
        <section className="container mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-end mb-6 sm:mb-8">
            <div>
              <span className="text-[11px] sm:text-xs uppercase tracking-widest text-gold font-bold flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1" /> Ikonic Professional Tools
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-on-surface mt-1">
                Professional Hair Dryers & Curlers
              </h2>
            </div>
            <Link
              href="/c/hair-dryers-curlers"
              className="text-xs font-bold text-gold hover:underline flex items-center"
            >
              View All Styling Tools <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
            {stylingTools.map((tool) => (
              <Link
                key={tool.id}
                href={`/p/${tool.slug}`}
                className="group rounded-2xl md:rounded-3xl bg-surface-container-low border border-outline-variant hover:border-gold/60 p-2.5 md:p-4 transition-all duration-150 active:scale-[0.98] hover:shadow-elevated flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="relative aspect-square rounded-xl md:rounded-2xl overflow-hidden bg-surface-lowest mb-2.5 md:mb-3.5">
                    <img
                      src={tool.imageUrl || "/products/ikonic_blow_dryer_1786231888743.jpg"}
                      alt={tool.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 right-2 md:top-2.5 md:right-2.5 bg-gold text-on-surface px-2 py-0.5 md:px-2.5 md:py-0.5 rounded-full text-[8px] md:text-[10px] font-bold font-mono uppercase tracking-wider">
                      {tool.sku}
                    </span>
                  </div>

                  <span className="text-[9px] md:text-xs font-mono text-outline uppercase tracking-wider block mb-0.5">
                    Ikonic Professional
                  </span>
                  <h3 className="font-serif font-bold text-xs sm:text-sm md:text-base text-on-surface group-hover:text-gold transition-colors line-clamp-2 mb-1">
                    {tool.name}
                  </h3>
                </div>

                <div className="pt-2 md:pt-3 border-t border-outline-variant/60 flex flex-col sm:flex-row sm:items-center justify-between gap-1 mt-2">
                  <div>
                    <span className="text-[9px] md:text-[10px] text-outline block font-medium">Status</span>
                    <span className="font-bold text-xs text-gold font-mono">
                      {tool.price_npr > 0 ? formatNpr(tool.price_npr) : "Coming Soon"}
                    </span>
                  </div>
                  <span className="w-full sm:w-auto text-center px-2 py-1 rounded-lg bg-gold/15 text-on-surface font-bold text-[10px] md:text-[11px] group-hover:bg-gold transition-colors flex items-center justify-center space-x-1">
                    <span>Details</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Section 6: B2B Salon Profit Calculator */}
        <section className="container mx-auto px-4 lg:px-8">
          <SalonCalculatorWidget />
        </section>
      </main>

      <Footer />
      <MobileBottomBar />
    </div>
  );
}
