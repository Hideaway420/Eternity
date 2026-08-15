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

// Unique Eternity Salon Luxury Chair Catalogue (NPR 30,000 - 40,000 Range with 5% Limited Offer)
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
  }
> = {
  "eternity-emerald-royal-luxury-salon-chair": {
    id: "prod-etp-chair-01",
    sku: "ETP-LSC-01",
    slug: "eternity-emerald-royal-luxury-salon-chair",
    name: "Eternity Emerald Royal Luxury Salon Chair",
    price_npr: 3500000, // NPR 35,000 (after 5% Limited Offer)
    compare_at_npr: 3685000, // Original NPR 36,850
    line: "profit",
    imageUrl: "/products/chair_emerald_green_1786235658712.jpg",
  },
  "eternity-espresso-vintage-luxury-salon-chair": {
    id: "prod-etp-chair-02",
    sku: "ETP-LSC-02",
    slug: "eternity-espresso-vintage-luxury-salon-chair",
    name: "Eternity Espresso Vintage Luxury Salon Chair",
    price_npr: 3750000, // NPR 37,500
    compare_at_npr: 3950000, // Original NPR 39,500
    line: "profit",
    imageUrl: "/products/chair_espresso_brown_1786235685819.jpg",
  },
  "eternity-burgundy-regal-luxury-salon-chair": {
    id: "prod-etp-chair-03",
    sku: "ETP-LSC-03",
    slug: "eternity-burgundy-regal-luxury-salon-chair",
    name: "Eternity Burgundy Regal Luxury Salon Chair",
    price_npr: 3850000, // NPR 38,500
    compare_at_npr: 4050000, // Original NPR 40,500
    line: "profit",
    imageUrl: "/products/chair_burgundy_red_1786235698852.jpg",
  },
  "ikonic-barber-chair-felix": {
    id: "prod-etp-005",
    sku: "ETP-005",
    slug: "ikonic-barber-chair-felix",
    name: "Eternity Emerald Royal Luxury Salon Chair",
    price_npr: 3500000, // NPR 35,000
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
  "ikonic-pedicure-foot-spa-manicure-suite": {
    id: "prod-etp-mp-01",
    sku: "ETP-MP-01",
    slug: "ikonic-pedicure-foot-spa-manicure-suite",
    name: "Eternity Luxury Pedicure Spa Chair Suite",
    price_npr: 3850000, // NPR 38,500
    compare_at_npr: 4050000,
    line: "profit",
    imageUrl: "https://www.ikonicworld.com/cdn/shop/files/IK-3818ELECTRICALBEDBLACK_CHALET.jpg",
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
      // Apply clean overrides for luxury salon chairs
      if (product.slug === "ikonic-barber-chair-felix" || product.slug === "eternity-emerald-royal-luxury-salon-chair") {
        product.name = "Eternity Emerald Royal Luxury Salon Chair";
        product.price_npr = 3500000; // NPR 35,000
        product.compare_at_npr = 3685000;
        product.imageUrl = "/products/chair_emerald_green_1786235658712.jpg";
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
        slug.includes("chair") || slug.includes("bed") || slug.includes("basin") || slug.includes("station") || slug.includes("trolley");
      product = {
        id: `prod-${slug}`,
        sku: `ETP-${slug.slice(0, 4).toUpperCase()}`,
        slug: slug,
        name: slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()).replace(/Barber/g, "Luxury Salon"),
        price_npr: isFurniture ? 3500000 : 1150000,
        compare_at_npr: isFurniture ? 3685000 : 1350000,
        line: isFurniture ? "profit" : "traffic",
        imageUrl: isFurniture ? "/products/chair_emerald_green_1786235658712.jpg" : "/products/ikonic_straightener_1786231866243.jpg",
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
          {category && (
            <>
              <Link href={`/c/${category.slug}`} className="hover:underline capitalize">{category.name}</Link>
              <ChevronRight className="w-3 h-3 text-outline" />
            </>
          )}
          <span className="text-on-surface font-semibold truncate max-w-xs">{product.name}</span>
        </div>

        {/* Product Color Selection & Interactive Showcase */}
        <ProductColorSelector product={product} categoryName={category?.name} />
      </main>

      <Footer />
    </div>
  );
}
