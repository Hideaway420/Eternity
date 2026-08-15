import React from "react";
import Link from "next/link";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { db, initTables } from "@/db";
import { products, categories, productImages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ProductColorSelector } from "@/components/storefront/ProductColorSelector";
import { ChevronRight } from "lucide-react";

export const revalidate = 0;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// Master Catalogue Mapping for All Eternity Products (Including 4 New Luxury Spa Chairs)
const CATALOG_DICTIONARY: Record<
  string,
  {
    id: string;
    sku: string;
    slug: string;
    name: string;
    price_npr: number;
    compare_at_npr?: number | null;
    line: string;
    imageUrl: string;
    description?: string;
    priceRange?: string;
    offerText?: string;
    offerExpiry?: string;
    isLimitedEdition?: boolean;
    isSpaCategory?: boolean;
  }
> = {
  // --- 4 NEW SPA & PEDICURE CHAIRS ---
  "classic-eternity-spa-chair": {
    id: "prod-etp-spa-01",
    sku: "ETP-SPA-01",
    slug: "classic-eternity-spa-chair",
    name: "Classic Eternity Spa Chair",
    price_npr: 12000000, // NPR 120,000
    compare_at_npr: 13000000,
    line: "profit",
    imageUrl: "/products/spa_chair_classic.jpg",
    priceRange: "NPR 115,000 - NPR 130,000",
    isSpaCategory: true,
    description:
      "Transform your salon into a sanctuary of relaxation with the Classic Eternity Spa Chair. Designed with both the technician's convenience and the client's ultimate comfort in mind, this chair features plush, ergonomic cushioning wrapped in premium, spill-resistant upholstery. Its sleek silhouette effortlessly elevates your salon’s aesthetic, promising every guest a serene, five-star pampering experience from the moment they sit down.",
  },
  "eternity-elegance-pedicure-station": {
    id: "prod-etp-spa-02",
    sku: "ETP-SPA-02",
    slug: "eternity-elegance-pedicure-station",
    name: "Eternity Elegance Pedicure Station",
    price_npr: 12800000, // NPR 128,000
    compare_at_npr: 13900000,
    line: "profit",
    imageUrl: "/products/spa_chair_elegance.jpg",
    priceRange: "NPR 125,000 - NPR 135,000",
    offerText: "8% OFF Special Offer",
    offerExpiry: "August 31st",
    isSpaCategory: true,
    description:
      "Offer your clients the gold standard of foot care with the Eternity Elegance Pedicure Station. This unit combines whisper-quiet massage mechanics with a deep, luxurious soaking basin, creating an immersive oasis for tired feet. The elegantly contoured backrest provides full lumbar support, ensuring that your clients drift into total tranquility while you perform your artistry.",
  },
  "eternity-luxe-spa-recliner": {
    id: "prod-etp-spa-03",
    sku: "ETP-SPA-03",
    slug: "eternity-luxe-spa-recliner",
    name: "Eternity Luxe Spa Recliner",
    price_npr: 13500000, // NPR 135,000
    compare_at_npr: 14650000,
    line: "profit",
    imageUrl: "/products/spa_chair_pink_recliner.jpg",
    priceRange: "NPR 130,000 - NPR 140,000",
    offerText: "8% OFF Special Offer",
    offerExpiry: "September 3rd",
    isSpaCategory: true,
    description:
      "Step into the future of luxury wellness with the Eternity Luxe Spa Recliner. Engineered for high-end spas and VIP salon suites, this recliner envelopes your clients in cloud-like softness. With meticulously crafted armrests and a modern, minimalist base, it acts as a striking centerpiece for your space while delivering an unparalleled, restorative spa experience.",
  },
  "eternity-signature-series-limited-edition": {
    id: "prod-etp-spa-04",
    sku: "ETP-SPA-04",
    slug: "eternity-signature-series-limited-edition",
    name: "Eternity Signature Series (Limited Edition)",
    price_npr: 14000000, // NPR 140,000
    compare_at_npr: 14500000,
    line: "profit",
    imageUrl: "/products/spa_chair_signature.jpg",
    priceRange: "NPR 135,000 - NPR 145,000",
    isLimitedEdition: true,
    isSpaCategory: true,
    description:
      "The absolute pinnacle of salon luxury. The Eternity Signature Series is a masterclass in design, exclusively crafted for establishments that refuse to compromise on quality. Featuring hand-stitched detailing, ultra-premium memory foam, and state-of-the-art spa technology, this chair doesn't just offer a service—it offers an unforgettable escape. Due to the meticulous craftsmanship required, production is strictly limited.",
  },

  // --- LUXURY SALON CHAIRS & OTHER PRODUCTS ---
  "eternity-emerald-royal-luxury-salon-chair": {
    id: "prod-etp-chair-01",
    sku: "ETP-LSC-01",
    slug: "eternity-emerald-royal-luxury-salon-chair",
    name: "Eternity Emerald Royal Luxury Salon Chair",
    price_npr: 3500000,
    compare_at_npr: 3685000,
    line: "profit",
    imageUrl: "/products/chair_emerald_green_1786235658712.jpg",
  },
  "ikonic-barber-chair-felix": {
    id: "prod-etp-005",
    sku: "ETP-005",
    slug: "ikonic-barber-chair-felix",
    name: "Eternity Emerald Royal Luxury Salon Chair",
    price_npr: 3500000,
    compare_at_npr: 3685000,
    line: "profit",
    imageUrl: "/products/chair_emerald_green_1786235658712.jpg",
  },
  "ikonic-professional-pro-titanium-shine-3-0-hair-straightener": {
    id: "prod-etp-066",
    sku: "ETP-066",
    slug: "ikonic-professional-pro-titanium-shine-3-0-hair-straightener",
    name: "Ikonic Professional Pro Titanium Shine 3.0 Hair Straightener",
    price_npr: 1292000,
    compare_at_npr: 1450000,
    line: "traffic",
    imageUrl: "https://www.ikonicworld.com/cdn/shop/files/8904231015937_1_702816a3-41c8-4c88-92b3-ab4c7779920f.jpg",
  },
  "ikonic-professional-pro-2500-advanced-hair-dryer": {
    id: "prod-etp-095",
    sku: "ETP-095",
    slug: "ikonic-professional-pro-2500-advanced-hair-dryer",
    name: "Ikonic Professional Pro 2500+ Advanced Hair Dryer",
    price_npr: 1000000,
    compare_at_npr: 1120000,
    line: "traffic",
    imageUrl: "/products/ikonic_blow_dryer_1786231888743.jpg",
  },
};

export default async function ProductDetailPage({ params }: ProductPageProps) {
  await initTables();
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  let product = null;
  let category = null;

  try {
    const fetchedProd = await db
      .select({
        id: products.id,
        sku: products.sku,
        slug: products.slug,
        name: products.name,
        price_npr: products.price_npr,
        compare_at_npr: products.compare_at_npr,
        line: products.line,
        specs: products.specs,
        imageUrl: productImages.url,
      })
      .from(products)
      .leftJoin(productImages, eq(products.id, productImages.product_id))
      .where(eq(products.slug, slug))
      .get();

    if (fetchedProd) {
      product = fetchedProd;
      const matched = CATALOG_DICTIONARY[slug];
      if (matched) {
        product = { ...product, ...matched };
      }
      if (product.id) {
        const prodRecord = await db.select().from(products).where(eq(products.slug, slug)).get();
        if (prodRecord && prodRecord.category_id) {
          category = await db.select().from(categories).where(eq(categories.id, prodRecord.category_id)).get();
        }
      }
    }
  } catch (err) {
    console.warn("⚠️ PDP DB query fallback active:", err);
  }

  // Fallback to specific catalog item if found, else build a clean item
  if (!product) {
    const matched = CATALOG_DICTIONARY[slug];
    if (matched) {
      product = matched;
    } else {
      const isFurniture =
        slug.includes("chair") || slug.includes("spa") || slug.includes("pedicure") || slug.includes("recliner");
      product = {
        id: `prod-${slug}`,
        sku: `ETP-${slug.slice(0, 4).toUpperCase()}`,
        slug: slug,
        name: slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        price_npr: isFurniture ? 12000000 : 1150000,
        compare_at_npr: isFurniture ? 13000000 : 1350000,
        line: isFurniture ? "profit" : "traffic",
        imageUrl: isFurniture ? "/products/spa_chair_classic.jpg" : "/products/ikonic_straightener_1786231866243.jpg",
      };
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      <Header />

      <main className="flex-1 py-10 container mx-auto px-4 lg:px-8">
        {/* Breadcrumb */}
        <div className="text-xs text-outline mb-8 flex items-center space-x-2">
          <Link href="/" className="hover:underline">Home</Link>
          <ChevronRight className="w-3 h-3 text-outline" />
          <Link href="/c/spa" className="hover:underline capitalize">{category?.name || "SPA"}</Link>
          <ChevronRight className="w-3 h-3 text-outline" />
          <span className="text-on-surface font-semibold truncate max-w-xs">{product.name}</span>
        </div>

        {/* Product Color Selection & Interactive Showcase */}
        <ProductColorSelector product={product} categoryName={category?.name || "SPA"} />
      </main>

      <Footer />
    </div>
  );
}
