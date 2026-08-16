import React from "react";
import Link from "next/link";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { SalonCalculatorWidget } from "@/components/storefront/SalonCalculatorWidget";
import { db, initTables } from "@/db";
import { products, productImages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ProductColorSelector } from "@/components/storefront/ProductColorSelector";
import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 0;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// Master Catalogue Mapping for All Eternity Products
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
  // --- MANICURE & PEDICURE SPA FURNITURE ---
  "classic-eternity-spa-chair": {
    id: "prod-etp-spa-01",
    sku: "ETP-SPA-01",
    slug: "classic-eternity-spa-chair",
    name: "Classic Eternity Spa Chair",
    price_npr: 12000000,
    compare_at_npr: 13000000,
    line: "profit",
    imageUrl: "/products/spa_chair_classic.jpg",
    priceRange: "NPR 115,000 - NPR 130,000",
    isSpaCategory: true,
    description:
      "Transform your salon into a sanctuary of relaxation with the Classic Eternity Spa Chair. Designed with both the technician's convenience and the client's ultimate comfort in mind, this chair features plush, ergonomic cushioning wrapped in premium, spill-resistant upholstery.",
  },
  "eternity-elegance-pedicure-station": {
    id: "prod-etp-spa-02",
    sku: "ETP-SPA-02",
    slug: "eternity-elegance-pedicure-station",
    name: "Eternity Elegance Pedicure Station",
    price_npr: 12800000,
    compare_at_npr: 13900000,
    line: "profit",
    imageUrl: "/products/spa_chair_elegance.jpg",
    priceRange: "NPR 125,000 - NPR 135,000",
    offerText: "8% OFF Special Offer",
    offerExpiry: "August 31st",
    isSpaCategory: true,
    description:
      "Offer your clients the gold standard of foot care with the Eternity Elegance Pedicure Station. This unit combines whisper-quiet massage mechanics with a deep, luxurious soaking basin, creating an immersive oasis for tired feet.",
  },
  "eternity-luxe-spa-recliner": {
    id: "prod-etp-spa-03",
    sku: "ETP-SPA-03",
    slug: "eternity-luxe-spa-recliner",
    name: "Eternity Luxe Spa Recliner",
    price_npr: 13500000,
    compare_at_npr: 14650000,
    line: "profit",
    imageUrl: "/products/spa_chair_pink_recliner.jpg",
    priceRange: "NPR 130,000 - NPR 140,000",
    offerText: "8% OFF Special Offer",
    offerExpiry: "September 3rd",
    isSpaCategory: true,
    description:
      "Step into the future of luxury wellness with the Eternity Luxe Spa Recliner. Engineered for high-end spas and VIP salon suites, this recliner envelopes your clients in cloud-like softness.",
  },
  "eternity-signature-series-limited-edition": {
    id: "prod-etp-spa-04",
    sku: "ETP-SPA-04",
    slug: "eternity-signature-series-limited-edition",
    name: "Eternity Signature Series (Limited Edition)",
    price_npr: 14000000,
    compare_at_npr: 14500000,
    line: "profit",
    imageUrl: "/products/spa_chair_signature.jpg",
    priceRange: "NPR 135,000 - NPR 145,000",
    isLimitedEdition: true,
    isSpaCategory: true,
    description:
      "The absolute pinnacle of salon luxury. The Eternity Signature Series is a masterclass in design, exclusively crafted for establishments that refuse to compromise on quality.",
  },
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
};

// Task 2: Generate Dynamic Localized SEO Metadata for Product Page
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const matched = CATALOG_DICTIONARY[slug];
  
  const productName = matched ? matched.name : slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  const title = `${productName} | Luxury Manicure & Pedicure Furniture Nepal`;
  const description = `Buy the authentic ${productName} from Eternity Products Nepal. Upgrade your salon with premium manicure tables, pedicure spa chairs, and beauty parlour equipment. Open-box cash on delivery available.`;
  const image = matched?.imageUrl ? `https://eternityproducts.online${matched.imageUrl}` : "https://eternityproducts.online/logo.png";
  const keywords = [
    "Manicure table Nepal",
    "Pedicure spa chair Kathmandu",
    "Salon furniture Nepal",
    "Eternity products Nepal",
    "Nail salon equipment",
    productName,
  ];

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: `https://eternityproducts.online/p/${slug}`,
      images: [{ url: image, alt: `${productName} - Luxury Manicure and Pedicure Spa Furniture imported to Nepal` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

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
    }
  } catch (err) {
    console.warn("⚠️ PDP DB query fallback active:", err);
  }

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

  const priceNprNum = product.price_npr / 100;

  // Task 4: JSON-LD Product & Offer Schema Injection (Strict Brand: Eternity)
  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: `https://eternityproducts.online${product.imageUrl}`,
    description: (product as { description?: string }).description || `Buy authentic ${product.name} from Eternity Products Nepal. Premium manicure & pedicure spa furniture with 1-year replacement warranty.`,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: "Eternity",
    },
    offers: {
      "@type": "Offer",
      url: `https://eternityproducts.online/p/${product.slug}`,
      priceCurrency: "NPR",
      price: priceNprNum,
      itemCondition: "https://schema.org/NewCondition",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Eternity Products Nepal",
      },
    },
  };

  // JSON-LD Breadcrumb Schema
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://eternityproducts.online",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: (category as { name?: string } | null)?.name || "Manicure & Pedicure Spa Furniture",
        item: "https://eternityproducts.online/c/spa",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `https://eternityproducts.online/p/${product.slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Header />

      <main className="flex-1 py-10 container mx-auto px-4 lg:px-8 space-y-12">
        {/* Breadcrumb */}
        <div className="text-xs text-outline flex items-center space-x-2">
          <Link href="/" className="hover:underline">Home</Link>
          <ChevronRight className="w-3 h-3 text-outline" />
          <Link href="/c/spa" className="hover:underline font-semibold">Manicure & Pedicure Spa Furniture</Link>
          <ChevronRight className="w-3 h-3 text-outline" />
          <span className="text-on-surface font-semibold truncate max-w-xs">{product.name}</span>
        </div>

        {/* Product Color Selection & Interactive Showcase */}
        <ProductColorSelector product={product} categoryName="Manicure & Pedicure Spa Furniture" />

        {/* Live Interactive B2B ROI Calculator Section */}
        <div className="pt-8 border-t border-outline-variant/60">
          <SalonCalculatorWidget
            defaultChairPriceNpr={Math.round(product.price_npr / 100)}
            equipmentType={product.name}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
