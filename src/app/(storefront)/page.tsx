import React from "react";
import Link from "next/link";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { db, initTables } from "@/db";
import { products, productImages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatNpr } from "@/lib/money";
import { ShieldCheck, Sparkles, ArrowRight, CheckCircle2, Building2, Calculator, Flame, Palette, Check } from "lucide-react";

export const revalidate = 0; // Dynamic rendering

// Resilient Fallback Data for Vercel Serverless
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

const FALLBACK_PROFIT_PRODUCTS = [
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
  {
    id: "prod-etp-002",
    sku: "ETP-002",
    slug: "autumn-electric-bed",
    name: "Autumn Electric Spa Bed",
    price_npr: 18800000,
    compare_at_npr: null,
    line: "profit",
    imageUrl: "https://www.ikonicworld.com/cdn/shop/files/IK-3818ELECTRICALBEDBLACK_CHALET.jpg",
  },
];

export default async function HomePage() {
  await initTables();

  let trafficProducts = FALLBACK_TRAFFIC_PRODUCTS;
  let profitProducts = FALLBACK_PROFIT_PRODUCTS;

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
      const fetchedProfit = activeProducts.filter((p) => p.line === "profit").slice(0, 4);
      if (fetchedTraffic.length > 0) trafficProducts = fetchedTraffic as typeof FALLBACK_TRAFFIC_PRODUCTS;
      if (fetchedProfit.length > 0) profitProducts = fetchedProfit as typeof FALLBACK_PROFIT_PRODUCTS;
    }
  } catch (err) {
    console.warn("⚠️ Home page DB fetch fallback active:", err);
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      <Header />

      <main className="flex-1 space-y-20 pb-20">
        {/* Section 1: Hero Banner */}
        <section className="relative bg-surface-container-low border-b border-outline-variant/60 overflow-hidden py-16 lg:py-24">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gold/15 via-spa-blue/20 to-transparent pointer-events-none" />
          <div className="container mx-auto px-4 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-gold/15 text-on-surface border border-gold/40 text-xs font-bold">
                <Sparkles className="w-4 h-4 text-gold" />
                <span>Nepal&apos;s Authorized Ikonic Importer & Distributor</span>
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-on-surface leading-[1.12]">
                Serene Opulence in Hair Styling & Salon Excellence
              </h1>
              <p className="text-base sm:text-lg text-on-surface-variant font-light leading-relaxed max-w-2xl">
                Elevate your personal styling routine or beauty parlour floor with Ikonic titanium straighteners, high-velocity blow dryers, and customizable hydraulic barber chairs.
              </p>
              <div className="pt-2 flex flex-wrap gap-4 items-center">
                <Link
                  href="/c/hair-straighteners"
                  className="px-6 py-4 rounded-xl bg-gold hover:bg-gold-hover text-on-surface font-bold text-sm shadow-gold transition-all flex items-center space-x-2"
                >
                  <span>Shop Styling Tools</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/salon/portal"
                  className="px-6 py-4 rounded-xl bg-inverse-surface text-white hover:bg-neutral-800 font-bold text-sm transition-all flex items-center space-x-2 shadow-soft"
                >
                  <Building2 className="w-4 h-4 text-gold" />
                  <span className="text-white font-bold">B2B Salon Wholesale</span>
                </Link>
              </div>

              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-outline-variant/60 text-xs text-on-surface-variant">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-gold flex-shrink-0" />
                  <span>100% Genuine Seal</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-gold flex-shrink-0" />
                  <span>Open-Box COD</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-gold flex-shrink-0" />
                  <span>1-Yr Warranty</span>
                </div>
              </div>
            </div>

            {/* Hero Image Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-elevated border border-outline-variant/80 bg-surface-lowest">
                <img
                  src="https://www.ikonicworld.com/cdn/shop/files/Felix-IK-8781_1.jpg"
                  alt="Ikonic Barber Chair Felix Official Edition"
                  className="w-full h-[420px] object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-4 left-4 right-4 p-4 glass-card rounded-2xl border border-white/60">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gold tracking-widest block">Official Ikonic World Import</span>
                      <h4 className="font-serif font-bold text-base">Ikonic Felix Barber Chair</h4>
                      <span className="text-xs text-outline font-semibold">Genuine Factory Import</span>
                    </div>
                    <span className="text-base font-bold text-on-surface font-sans">NPR 195,150</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Interactive Color & Leather Theme Customizer Teaser */}
        <section className="container mx-auto px-4 lg:px-8">
          <div className="rounded-3xl bg-surface-lowest border border-gold/40 p-8 lg:p-12 shadow-soft grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center space-x-2 text-gold font-bold text-xs uppercase tracking-widest">
                <Palette className="w-4 h-4" />
                <span>Custom Salon Styling Themes</span>
              </div>
              <h2 className="font-serif text-3xl font-bold">Customize Your Salon Furniture Color Scheme</h2>
              <p className="text-sm text-on-surface-variant leading-relaxed font-light">
                Top salon chains in Kathmandu match their equipment leather with interior lighting. Choose between 4 signature upholstery themes for your barber chairs and spa beds.
              </p>
              
              <div className="pt-2 flex flex-wrap gap-3">
                <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-surface-low border border-outline-variant text-xs">
                  <span className="w-4 h-4 rounded-full bg-[#1B4D3E]" />
                  <span className="font-semibold">Emerald Green</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-surface-low border border-outline-variant text-xs">
                  <span className="w-4 h-4 rounded-full bg-[#1A1A1A]" />
                  <span className="font-semibold">Obsidian Black</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-surface-low border border-outline-variant text-xs">
                  <span className="w-4 h-4 rounded-full bg-[#4A2E1B]" />
                  <span className="font-semibold">Espresso Brown</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-surface-low border border-outline-variant text-xs">
                  <span className="w-4 h-4 rounded-full bg-[#6B1D2F]" />
                  <span className="font-semibold">Burgundy Red</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl overflow-hidden aspect-[4/3] border border-outline-variant">
                <img src="/products/barber_chair_black_1786231899221.jpg" alt="Black Chair" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-2xl overflow-hidden aspect-[4/3] border border-outline-variant">
                <img src="/products/barber_chair_brown_1786231912699.jpg" alt="Brown Chair" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Categories Showcase */}
        <section className="container mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <span className="text-xs uppercase tracking-widest text-gold font-bold">Catalogue</span>
              <h2 className="font-serif text-3xl font-bold tracking-tight mt-1">Explore By Category</h2>
            </div>
            <Link href="/c/hair-straighteners" className="text-xs font-bold text-gold hover:underline flex items-center">
              View All Categories <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            <Link href="/c/hair-straighteners" className="group p-6 rounded-2xl bg-surface-container hover:bg-gold-light/40 border border-outline-variant transition-all">
              <div className="w-12 h-12 rounded-xl bg-surface-lowest flex items-center justify-center text-gold mb-4 group-hover:scale-110 transition-transform text-xl font-bold">
                ✨
              </div>
              <h3 className="font-serif font-semibold text-lg group-hover:text-gold transition-colors">Hair Straighteners</h3>
              <p className="text-xs text-outline mt-1">Keratin & Titanium plates</p>
            </Link>

            <Link href="/c/hair-dryers" className="group p-6 rounded-2xl bg-surface-container hover:bg-gold-light/40 border border-outline-variant transition-all">
              <div className="w-12 h-12 rounded-xl bg-surface-lowest flex items-center justify-center text-gold mb-4 group-hover:scale-110 transition-transform text-xl font-bold">
                💨
              </div>
              <h3 className="font-serif font-semibold text-lg group-hover:text-gold transition-colors">Hair Dryers & Blowers</h3>
              <p className="text-xs text-outline mt-1">High wattage AC motors</p>
            </Link>

            <Link href="/c/hair-curlers" className="group p-6 rounded-2xl bg-surface-container hover:bg-gold-light/40 border border-outline-variant transition-all">
              <div className="w-12 h-12 rounded-xl bg-surface-lowest flex items-center justify-center text-gold mb-4 group-hover:scale-110 transition-transform text-xl font-bold">
                🌀
              </div>
              <h3 className="font-serif font-semibold text-lg group-hover:text-gold transition-colors">Curling Wands</h3>
              <p className="text-xs text-outline mt-1">Conical & Tong stylers</p>
            </Link>

            <Link href="/c/salon-furniture-equipment" className="group p-6 rounded-2xl bg-spa-blue/40 hover:bg-spa-blue/70 border border-secondary-container transition-all">
              <div className="w-12 h-12 rounded-xl bg-surface-lowest flex items-center justify-center text-gold mb-4 group-hover:scale-110 transition-transform text-xl font-bold">
                💈
              </div>
              <h3 className="font-serif font-semibold text-lg text-on-surface group-hover:text-gold transition-colors">Salon Furniture</h3>
              <p className="text-xs text-secondary-on-container font-semibold mt-1">Barber chairs & spa beds</p>
            </Link>
          </div>
        </section>

        {/* Section 4: D2C Traffic Line Best Sellers */}
        <section className="container mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <span className="text-xs uppercase tracking-widest text-gold font-bold flex items-center">
                <Flame className="w-3.5 h-3.5 mr-1 text-gold" /> Consumer Best Sellers
              </span>
              <h2 className="font-serif text-3xl font-bold tracking-tight mt-1">Professional Hair Styling Tools</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trafficProducts.map((p) => {
              const hasDarazAnchor = !!p.compare_at_npr;
              return (
                <div key={p.id} className="group rounded-2xl bg-surface-lowest border border-outline-variant p-5 shadow-soft hover:shadow-elevated transition-all flex flex-col justify-between">
                  <div>
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-surface-low mb-4">
                      <img
                        src={p.imageUrl || "/products/ikonic_straightener_1786231866243.jpg"}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 left-2 bg-surface-lowest/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-on-surface uppercase border border-outline-variant">
                        Genuine Ikonic
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-outline uppercase tracking-wider block">
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
                      className="px-3.5 py-2 rounded-xl bg-gold hover:bg-gold-hover text-on-surface text-xs font-semibold transition-colors"
                    >
                      View Tool
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 5: B2B Profit Line Salon Fit-Out Suite */}
        <section className="bg-inverse-surface text-inverse-on-surface py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mb-12">
              <span className="text-xs uppercase tracking-widest text-gold font-bold flex items-center">
                <Building2 className="w-4 h-4 mr-1.5" /> High-Margin Salon Fit-Outs
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mt-2">
                Professional Barber Chairs & Shampoo Basins
              </h2>
              <p className="text-sm text-neutral-300 mt-3 font-light leading-relaxed">
                Empower your beauty parlour or barber shop with heavy-duty hydraulic chairs and electric facial beds. One 6-chair fit-out delivers NPR ~563,000 gross margin.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {profitProducts.map((p) => (
                <div key={p.id} className="trade-card rounded-2xl p-6 flex flex-col justify-between hover:border-gold/50 transition-all">
                  <div>
                    <div className="aspect-[16/9] rounded-xl overflow-hidden mb-4 bg-neutral-900">
                      <img
                        src={p.imageUrl || "/products/ikonic_barber_chair_1786231855404.jpg"}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-mono text-gold uppercase">B2B Trade Line</span>
                        <h3 className="font-serif font-bold text-xl text-white mt-1">{p.name}</h3>
                      </div>
                      <span className="text-xl font-bold text-gold font-sans">{formatNpr(p.price_npr)}</span>
                    </div>

                    <div className="mt-4 p-3 rounded-xl bg-neutral-900/80 border border-neutral-700 text-xs space-y-1">
                      <div className="flex items-center text-gold font-semibold">
                        <Calculator className="w-3.5 h-3.5 mr-1.5" /> Payback Investment Estimate
                      </div>
                      <p className="text-neutral-300">
                        At NPR 500 per haircut / facial (5 clients/day), this chair pays back its full cost in <strong className="text-white font-mono">2.4 months</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Link
                      href={`/p/${p.slug}`}
                      className="flex-1 py-3 rounded-xl bg-gold hover:bg-gold-hover text-on-surface font-bold text-xs text-center transition-colors shadow-gold"
                    >
                      Select Color & Request Quote
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 6: Salon Membership Tier Matrix */}
        <section className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-gold">Wholesale Membership</span>
            <h2 className="font-serif text-3xl font-bold">Salon Partner Tier Benefits</h2>
            <p className="text-xs text-outline">Net trade pricing structure for beauty parlours & barber shop accounts across Nepal</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-surface-lowest p-6 rounded-2xl border border-outline-variant space-y-4 shadow-soft">
              <span className="text-xs font-mono text-outline uppercase tracking-wider block">Tier 1</span>
              <h3 className="font-serif text-2xl font-bold text-on-surface">Silver Partner</h3>
              <div className="text-3xl font-bold text-gold font-sans">10% OFF</div>
              <ul className="space-y-2 text-xs text-on-surface-variant">
                <li className="flex items-center"><Check className="w-4 h-4 text-gold mr-2" /> Net trade catalog pricing</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-gold mr-2" /> Fast priority dispatch</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-gold mr-2" /> Viber stock drop alerts</li>
              </ul>
            </div>

            <div className="bg-surface-lowest p-6 rounded-2xl border-2 border-gold space-y-4 shadow-gold relative">
              <span className="absolute -top-3 right-4 px-3 py-1 bg-gold text-on-surface text-[10px] font-bold uppercase rounded-full">
                Most Popular
              </span>
              <span className="text-xs font-mono text-gold uppercase tracking-wider block">Tier 2</span>
              <h3 className="font-serif text-2xl font-bold text-on-surface">Gold Partner</h3>
              <div className="text-3xl font-bold text-gold font-sans">15% OFF</div>
              <ul className="space-y-2 text-xs text-on-surface-variant">
                <li className="flex items-center"><Check className="w-4 h-4 text-gold mr-2" /> Everything in Silver</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-gold mr-2" /> 30-Day credit account (NPR 500K limit)</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-gold mr-2" /> Free floor layout consultation</li>
              </ul>
            </div>

            <div className="bg-inverse-surface text-inverse-on-surface p-6 rounded-2xl border border-neutral-800 space-y-4 shadow-soft">
              <span className="text-xs font-mono text-gold uppercase tracking-wider block">Tier 3</span>
              <h3 className="font-serif text-2xl font-bold text-white">Platinum Partner</h3>
              <div className="text-3xl font-bold text-gold font-sans">25% OFF</div>
              <ul className="space-y-2 text-xs text-neutral-300">
                <li className="flex items-center"><Check className="w-4 h-4 text-gold mr-2" /> Maximum distributor margin</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-gold mr-2" /> Custom upholstery color setting</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-gold mr-2" /> Dedicated account manager</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 7: Authenticity Guarantee */}
        <section className="container mx-auto px-4 lg:px-8">
          <div className="rounded-3xl bg-surface-container-low border border-gold/30 p-8 lg:p-12 relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center space-x-2 text-gold font-bold text-xs uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4" />
                  <span>असली उत्पादन Guarantee</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-on-surface">
                  Open The Box & Verify Serial Before Paying
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  We believe trust is built on transparency. Our riders will allow you to open the outer box and verify your Ikonic product, serial hologram, and Eternity warranty card before handing over cash on delivery.
                </p>
              </div>
              <div className="lg:col-span-4 flex justify-end">
                <Link
                  href="/warranty"
                  className="px-6 py-4 rounded-xl bg-gold text-on-surface font-bold text-sm shadow-gold hover:bg-gold-hover transition-colors"
                >
                  Verify Serial Number
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
