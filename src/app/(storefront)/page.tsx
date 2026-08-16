import React from "react";
import Link from "next/link";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { MobileBottomBar } from "@/components/storefront/MobileBottomBar";
import { TopLoadingBar } from "@/components/storefront/TopLoadingBar";
import { SalonCalculatorWidget } from "@/components/storefront/SalonCalculatorWidget";
import { InteractiveColorSection } from "@/components/storefront/InteractiveColorSection";
import { db, initTables } from "@/db";
import { products, productImages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatNpr } from "@/lib/money";
import { ShieldCheck, Sparkles, ArrowRight, CheckCircle2, Building2, Flame, Check, Footprints, Armchair, Tag, Lock } from "lucide-react";

export const revalidate = 0; // Dynamic rendering

// 4 New Eternity Luxury Spa & Pedicure Chairs Catalogue
const SPA_PRODUCTS = [
  {
    id: "prod-etp-spa-01",
    sku: "ETP-SPA-01",
    slug: "classic-eternity-spa-chair",
    name: "Classic Eternity Spa Chair",
    price_npr: 12000000, // NPR 120,000
    compare_at_npr: 13000000,
    priceRange: "NPR 115,000 - NPR 130,000",
    line: "profit",
    imageUrl: "/products/spa_chair_classic.jpg",
    badge: "15% Upfront Booking Deposit",
  },
  {
    id: "prod-etp-spa-02",
    sku: "ETP-SPA-02",
    slug: "eternity-elegance-pedicure-station",
    name: "Eternity Elegance Pedicure Station",
    price_npr: 12800000, // NPR 128,000
    compare_at_npr: 13900000,
    priceRange: "NPR 125,000 - NPR 135,000",
    line: "profit",
    imageUrl: "/products/spa_chair_elegance.jpg",
    badge: "8% OFF Deal (Aug 31st)",
  },
  {
    id: "prod-etp-spa-03",
    sku: "ETP-SPA-03",
    slug: "eternity-luxe-spa-recliner",
    name: "Eternity Luxe Spa Recliner",
    price_npr: 13500000, // NPR 135,000
    compare_at_npr: 14650000,
    priceRange: "NPR 130,000 - NPR 140,000",
    line: "profit",
    imageUrl: "/products/spa_chair_pink_recliner.jpg",
    badge: "VIP Spa Recliner",
  },
  {
    id: "prod-etp-spa-04",
    sku: "ETP-SPA-04",
    slug: "eternity-signature-series-limited-edition",
    name: "Eternity Signature Series (Limited Edition)",
    price_npr: 14000000, // NPR 140,000
    compare_at_npr: 14500000,
    priceRange: "NPR 135,000 - NPR 145,000",
    line: "profit",
    imageUrl: "/products/spa_chair_signature.jpg",
    badge: "Strictly Limited Stock",
  },
];

// 3 Signature Eternity Luxury Salon Chairs Catalogue (NPR 30k-40k Range)
const SALON_CHAIR_PRODUCTS = [
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
];

const FALLBACK_TRAFFIC_PRODUCTS = [
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
    id: "prod-etp-089",
    sku: "ETP-089",
    slug: "ikonic-professional-id-2-0-hair-dryer",
    name: "Ikonic Professional Id 2.0 Hair Dryer",
    price_npr: 2622000,
    compare_at_npr: 2800000,
    line: "traffic",
    imageUrl: "https://www.ikonicworld.com/cdn/shop/files/8904231093140_1_6594bc6f-a625-47f5-863b-04f017f8c9a8.jpg",
  },
];

export default async function HomePage() {
  await initTables();

  let trafficProducts = FALLBACK_TRAFFIC_PRODUCTS;

  try {
    const activeProducts = await db
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
      .where(eq(products.status, "active"))
      .limit(16)
      .all();

    if (activeProducts.length > 0) {
      const fetchedTraffic = activeProducts.filter((p) => p.line === "traffic").slice(0, 4);
      if (fetchedTraffic.length > 0) trafficProducts = fetchedTraffic as typeof FALLBACK_TRAFFIC_PRODUCTS;
    }
  } catch (err) {
    console.warn("⚠️ Home page DB fetch fallback active:", err);
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface pb-16 md:pb-0">
      <TopLoadingBar />
      <Header />

      <main className="flex-1 space-y-12 sm:space-y-20 pb-16">
        {/* Section 1: Hero Banner */}
        <section className="relative bg-surface-container-low border-b border-outline-variant/60 overflow-hidden py-10 sm:py-16 lg:py-24">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gold/15 via-spa-blue/20 to-transparent pointer-events-none" />
          <div className="container mx-auto px-4 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-4 sm:space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gold/15 text-on-surface border border-gold/40 text-[11px] sm:text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                <span>Nepal&apos;s Authorized Ikonic & Eternity Importer</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-on-surface leading-[1.15]">
                Serene Opulence in Hair Styling, Salon Chairs & Spa Excellence
              </h1>
              <p className="text-sm sm:text-lg text-on-surface-variant font-light leading-relaxed max-w-2xl">
                Transform your salon floor with Ikonic titanium straighteners, Eternity luxury hydraulic chairs, and our bespoke Luxury Spa & Pedicure Collection.
              </p>
              <div className="pt-2 flex flex-wrap gap-3 sm:gap-4 items-center">
                <Link
                  href="/c/spa"
                  className="px-5 py-3.5 sm:px-6 sm:py-4 rounded-xl bg-gold hover:bg-gold-hover text-on-surface font-bold text-xs sm:text-sm shadow-gold transition-all flex items-center space-x-2"
                >
                  <Footprints className="w-4 h-4 text-on-surface" />
                  <span>Explore SPA Collection</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/c/luxury-salon-chairs"
                  className="px-5 py-3.5 sm:px-6 sm:py-4 rounded-xl bg-inverse-surface text-white hover:bg-neutral-800 font-bold text-xs sm:text-sm transition-all flex items-center space-x-2 shadow-soft"
                >
                  <Armchair className="w-4 h-4 text-gold" />
                  <span className="text-white font-bold">Luxury Salon Chairs</span>
                </Link>
              </div>

              <div className="pt-4 sm:pt-6 grid grid-cols-3 gap-2 sm:gap-4 border-t border-outline-variant/60 text-[10px] sm:text-xs text-on-surface-variant">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                  <span>100% Genuine Seal</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                  <span>10-15% Spa Booking Deposit</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                  <span>1-Yr Warranty</span>
                </div>
              </div>
            </div>

            {/* Hero Image Showcase */}
            <div className="lg:col-span-5 relative">
              <Link
                href="/p/classic-eternity-spa-chair"
                className="block relative rounded-3xl overflow-hidden shadow-elevated border-2 border-gold/60 bg-surface-lowest group hover:ring-4 hover:ring-gold/30 transition-all cursor-pointer"
              >
                <img
                  src="/products/spa_chair_classic.jpg"
                  alt="Classic Eternity Spa Chair"
                  className="w-full h-[320px] sm:h-[420px] object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Badge */}
                <div className="absolute top-4 right-4 bg-gold text-on-surface px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md flex items-center space-x-1 z-20">
                  <Sparkles className="w-3 h-3" />
                  <span>NEW SPA COLLECTION</span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 p-3 sm:p-4 glass-card rounded-2xl border border-white/60 z-20">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[9px] sm:text-[10px] uppercase font-bold text-gold tracking-widest block">Featured Spa Sanctuary</span>
                      <h4 className="font-serif font-bold text-xs sm:text-base group-hover:text-gold transition-colors">Classic Eternity Spa Chair</h4>
                      <span className="text-[10px] sm:text-xs text-outline font-semibold">Custom Color Match (+NPR 6,000)</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs sm:text-base font-bold text-on-surface font-sans block">NPR 120,000</span>
                      <span className="text-[9px] text-green-700 font-bold block">15% Upfront Deposit</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Section 2: Interactive Real Studio Color Customizer */}
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
            <Link href="/c/spa" className="text-xs font-bold text-gold hover:underline flex items-center">
              View All Categories <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            <Link href="/c/spa" className="group p-4 sm:p-6 rounded-2xl bg-gold/15 hover:bg-gold/30 border border-gold/40 transition-all">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-surface-lowest flex items-center justify-center text-gold mb-3 sm:mb-4 group-hover:scale-110 transition-transform text-lg sm:text-xl font-bold">
                <Footprints className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-serif font-semibold text-sm sm:text-lg text-on-surface group-hover:text-gold transition-colors">SPA Collection</h3>
              <p className="text-[11px] sm:text-xs text-gold font-bold mt-1">4 Luxury Spa Chairs (10-15% Deposit)</p>
            </Link>

            <Link href="/c/luxury-salon-chairs" className="group p-4 sm:p-6 rounded-2xl bg-surface-container hover:bg-gold-light/40 border border-outline-variant transition-all">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-surface-lowest flex items-center justify-center text-gold mb-3 sm:mb-4 group-hover:scale-110 transition-transform text-lg sm:text-xl font-bold">
                <Armchair className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-serif font-semibold text-sm sm:text-lg group-hover:text-gold transition-colors">Luxury Salon Chairs</h3>
              <p className="text-[11px] sm:text-xs text-outline mt-1">Hydraulic Reclining (NPR 30k-40k)</p>
            </Link>

            <Link href="/c/hair-straighteners" className="group p-4 sm:p-6 rounded-2xl bg-surface-container hover:bg-gold-light/40 border border-outline-variant transition-all">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-surface-lowest flex items-center justify-center text-gold mb-3 sm:mb-4 group-hover:scale-110 transition-transform text-lg sm:text-xl font-bold">
                ✨
              </div>
              <h3 className="font-serif font-semibold text-sm sm:text-lg group-hover:text-gold transition-colors">Hair Straighteners</h3>
              <p className="text-[11px] sm:text-xs text-outline mt-1">Titanium Shine 3.0 • Cash on Delivery</p>
            </Link>

            <Link href="/c/hair-dryers" className="group p-4 sm:p-6 rounded-2xl bg-surface-container hover:bg-gold-light/40 border border-outline-variant transition-all">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-surface-lowest flex items-center justify-center text-gold mb-3 sm:mb-4 group-hover:scale-110 transition-transform text-lg sm:text-xl font-bold">
                💨
              </div>
              <h3 className="font-serif font-semibold text-sm sm:text-lg group-hover:text-gold transition-colors">Hair Dryers & Curlers</h3>
              <p className="text-[11px] sm:text-xs text-outline mt-1">Pro 2500+ AC Motors • Cash on Delivery</p>
            </Link>
          </div>
        </section>

        {/* SECTION 4: DEDICATED "SPA" SECTION SHOWCASING THE 4 NEW LUXURY SPA CHAIRS */}
        <section className="bg-inverse-surface text-inverse-on-surface py-12 sm:py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mb-8 sm:mb-12">
              <span className="text-xs uppercase tracking-widest text-gold font-bold flex items-center">
                <Footprints className="w-4 h-4 mr-1.5" /> Eternity Luxury Spa Sanctuary
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight mt-2">
                The Eternity SPA & Pedicure Chair Collection
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 mt-2 font-light leading-relaxed">
                Elevate your salon with our bespoke luxury spa & pedicure chairs. Secured with a 10% - 15% upfront booking deposit. Option for Custom Salon Color Match (+NPR 6,000).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {SPA_PRODUCTS.map((p) => (
                <div key={p.id} className="trade-card rounded-2xl p-5 border border-neutral-800 bg-neutral-900/90 flex flex-col justify-between hover:border-gold/50 transition-all group">
                  <div>
                    <Link href={`/p/${p.slug}`} className="block aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-neutral-950 relative">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 left-2 bg-gold text-on-surface text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shadow-md">
                        {p.badge}
                      </span>
                    </Link>
                    <span className="text-xs font-mono text-gold uppercase">SKU: {p.sku}</span>
                    <h3 className="font-serif font-bold text-base text-white mt-1 leading-snug">
                      <Link href={`/p/${p.slug}`} className="hover:text-gold transition-colors">{p.name}</Link>
                    </h3>
                    <p className="text-[11px] text-neutral-400 mt-1">Range: {p.priceRange}</p>

                    <div className="mt-3 flex items-baseline justify-between border-t border-neutral-800 pt-3">
                      <div>
                        <span className="text-lg font-bold text-gold font-sans">{formatNpr(p.price_npr)}</span>
                        {p.compare_at_npr && (
                          <span className="text-xs text-neutral-500 line-through font-mono ml-2">{formatNpr(p.compare_at_npr)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2">
                    <Link
                      href={`/p/${p.slug}`}
                      className="w-full block py-2.5 rounded-xl bg-gold hover:bg-gold-hover text-on-surface font-bold text-xs text-center transition-colors shadow-gold"
                    >
                      Reserve Spa Chair (15% Deposit)
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 5: LUXURY SALON CHAIRS SECTION (RESTORED DIRECTLY BELOW SPA SECTION) */}
        <section className="container mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-end mb-6 sm:mb-8">
            <div>
              <span className="text-[11px] sm:text-xs uppercase tracking-widest text-gold font-bold flex items-center">
                <Armchair className="w-3.5 h-3.5 mr-1 text-gold" /> Eternity Salon Luxury Line
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight mt-1">
                Luxury Salon Styling Chairs (NPR 30,000 – NPR 40,000 Range)
              </h2>
              <p className="text-xs text-outline mt-1 font-light">
                Heavy-duty hydraulic reclining chairs with real leather color options & 5% Limited Offer Discount!
              </p>
            </div>
            <Link href="/c/luxury-salon-chairs" className="text-xs font-bold text-gold hover:underline flex items-center">
              View All Chairs <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {SALON_CHAIR_PRODUCTS.map((p) => (
              <div key={p.id} className="group rounded-2xl bg-surface-lowest border border-outline-variant p-5 shadow-soft hover:shadow-elevated transition-all flex flex-col justify-between">
                <div>
                  <Link href={`/p/${p.slug}`} className="block aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-surface-low relative">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shadow-md">
                      5% OFF OFFER
                    </span>
                  </Link>
                  <span className="text-xs font-mono text-outline uppercase">SKU: {p.sku}</span>
                  <h3 className="font-serif font-bold text-lg text-on-surface group-hover:text-gold transition-colors mt-1 leading-snug">
                    <Link href={`/p/${p.slug}`}>{p.name}</Link>
                  </h3>
                  <div className="mt-3 flex items-baseline space-x-2">
                    <span className="text-xl font-bold text-on-surface font-sans">{formatNpr(p.price_npr)}</span>
                    {p.compare_at_npr && (
                      <span className="text-xs text-outline line-through font-mono">{formatNpr(p.compare_at_npr)}</span>
                    )}
                  </div>
                </div>

                <div className="mt-5">
                  <Link
                    href={`/p/${p.slug}`}
                    className="w-full block py-3 rounded-xl bg-gold hover:bg-gold-hover text-on-surface font-bold text-xs text-center transition-colors shadow-soft"
                  >
                    Select Color & Order Chair (Cash on Delivery)
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 6: Consumer Best Sellers Hair Styling Tools (2-COLUMN MOBILE GRID) */}
        <section className="container mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-end mb-6 sm:mb-8">
            <div>
              <span className="text-[11px] sm:text-xs uppercase tracking-widest text-gold font-bold flex items-center">
                <Flame className="w-3.5 h-3.5 mr-1 text-gold" /> Consumer Best Sellers
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight mt-1">Professional Hair Styling Tools (Cash on Delivery)</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {trafficProducts.map((p) => {
              const hasDarazAnchor = !!p.compare_at_npr;
              return (
                <div key={p.id} className="group rounded-2xl bg-surface-lowest border border-outline-variant p-3 sm:p-5 shadow-soft hover:shadow-elevated transition-all flex flex-col justify-between">
                  <div>
                    <Link href={`/p/${p.slug}`} className="block relative aspect-square sm:aspect-[4/3] rounded-xl overflow-hidden bg-surface-low mb-3">
                      <img
                        src={p.imageUrl || "/products/ikonic_straightener_1786231866243.jpg"}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-1.5 left-1.5 bg-surface-lowest/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold text-on-surface uppercase border border-outline-variant">
                        Genuine Ikonic
                      </span>
                    </Link>
                    <span className="text-[9px] sm:text-[11px] font-semibold text-outline uppercase tracking-wider block">
                      SKU: {p.sku}
                    </span>
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
                    <Link
                      href={`/p/${p.slug}`}
                      className="w-full sm:w-auto text-center px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-gold hover:bg-gold-hover text-on-surface text-[10px] sm:text-xs font-bold transition-colors"
                    >
                      View Tool
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 7: Interactive B2B Salon Payback Calculator Widget */}
        <section className="container mx-auto px-4 lg:px-8">
          <SalonCalculatorWidget />
        </section>

        {/* Section 8: Authenticity Guarantee */}
        <section className="container mx-auto px-4 lg:px-8">
          <div className="rounded-3xl bg-surface-container-low border border-gold/30 p-6 sm:p-8 lg:p-12 relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
              <div className="lg:col-span-8 space-y-3 sm:space-y-4">
                <div className="inline-flex items-center space-x-2 text-gold font-bold text-xs uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4" />
                  <span>असली उत्पादन Guarantee</span>
                </div>
                <h3 className="font-serif text-xl sm:text-3xl font-bold text-on-surface">
                  Open The Box & Verify Serial Before Paying
                </h3>
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  We believe trust is built on transparency. Our riders will allow you to open the outer box and verify your product serial hologram and Eternity warranty card.
                </p>
              </div>
              <div className="lg:col-span-4 flex justify-start lg:justify-end">
                <Link
                  href="/warranty"
                  className="px-5 py-3.5 sm:px-6 sm:py-4 rounded-xl bg-gold text-on-surface font-bold text-xs sm:text-sm shadow-gold hover:bg-gold-hover transition-colors"
                >
                  Verify Serial Number
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <MobileBottomBar />
    </div>
  );
}
