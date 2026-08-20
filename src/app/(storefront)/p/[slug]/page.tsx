import React from "react";
import Link from "next/link";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { SalonCalculatorWidget } from "@/components/storefront/SalonCalculatorWidget";
import { db, initTables } from "@/db";
import { products, productImages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ProductColorSelector } from "@/components/storefront/ProductColorSelector";
import { ProductReviewsSection } from "@/components/storefront/ProductReviewsSection";
import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPillar, getPillarById, isForSale, type Pillar } from "@/lib/taxonomy";

export const revalidate = 60;

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
  "ray-ban-tech-carbon-fiber-polarized-coming-soon": {
    id: "prod-eye-ph-01",
    sku: "ETP-EYE-01",
    slug: "ray-ban-tech-carbon-fiber-polarized-coming-soon",
    name: "Ray-Ban Tech Carbon Fiber Polarized - Coming Soon",
    price_npr: 0,
    compare_at_npr: 0,
    line: "traffic",
    imageUrl: "/products/antigravity_eyewear.jpg",
    description: "Ultra-lightweight carbon fiber polarized premium eyewear. Suspended anti-gravity optical engineering. Coming soon to Eternity Nepal.",
  },
  "oakley-radar-ev-path-prizm-coming-soon": {
    id: "prod-eye-ph-02",
    sku: "ETP-EYE-02",
    slug: "oakley-radar-ev-path-prizm-coming-soon",
    name: "Oakley Radar EV Path Prizm - Coming Soon",
    price_npr: 0,
    compare_at_npr: 0,
    line: "traffic",
    imageUrl: "/products/antigravity_eyewear.jpg",
    description: "High-definition Prizm optics for sports performance. Suspended anti-gravity frame structure. Coming soon to Eternity Nepal.",
  },
};

// Task 2: Generate Dynamic Localized SEO Metadata for Product Page
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const matched = CATALOG_DICTIONARY[slug];

  // A CATALOG_DICTIONARY entry (e.g. "coming soon" placeholders) overrides the DB price, matching
  // the merge order used in the page body below — so only hit the DB when there's no override.
  let priceNpr: number | undefined = matched?.price_npr;
  let categoryId: string | undefined;
  if (priceNpr === undefined) {
    try {
      await initTables();
      const dbProduct = await db
        .select({ price_npr: products.price_npr, category_id: products.category_id })
        .from(products)
        .where(eq(products.slug, slug))
        .get();
      priceNpr = dbProduct?.price_npr;
      categoryId = dbProduct?.category_id ?? undefined;
    } catch {
      // Genuinely unknown — no robots directive is the safe default.
    }
  }

  const productName = matched ? matched.name : slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  const title = `${productName} | Luxury Salon & Spa Equipment Nepal`;
  const description = `Buy the authentic ${productName} from Eternity Products Nepal. Premium salon furniture, pedicure spa chairs, and Ikonic styling tools. Open-box cash on delivery available nationwide.`;
  const image = matched?.imageUrl ? `https://www.eternityproducts.online${matched.imageUrl}` : "https://www.eternityproducts.online/logo.png";
  const keywords = [
    "Salon equipment Nepal",
    "Pedicure spa chair Kathmandu",
    "Ikonic hair tools Nepal",
    "Eternity Products Nepal",
    "Salon furniture Nepal",
    productName,
  ];

  return {
    title,
    description,
    keywords,
    alternates: { canonical: `/p/${slug}` },
    openGraph: {
      title,
      description,
      url: `https://www.eternityproducts.online/p/${slug}`,
      siteName: "Eternity Products",
      type: "website",
      locale: "en_NP",
      images: [{ url: image, alt: `${productName} - Eternity Products Nepal Authorized Import` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    // Products we do not stock stay browsable but out of the index. Price alone is not the
    // test: seed rows in unstocked categories carry prices too (two eyewear rows are even named
    // "Coming Soon" with a price), so this keys off the category's stocked flag as well.
    ...(isForSale({ price_npr: priceNpr ?? 0, category_id: categoryId })
      ? {}
      : { robots: { index: false, follow: true } }),
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  await initTables();
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  let product = null;
  let category: Pillar | undefined;

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
        category_id: products.category_id,
        imageUrl: productImages.url,
      })
      .from(products)
      .leftJoin(productImages, eq(products.id, productImages.product_id))
      .where(eq(products.slug, slug))
      .get();

    if (fetchedProd) {
      product = fetchedProd;
      category = fetchedProd.category_id ? getPillarById(fetchedProd.category_id) : undefined;
      const matched = CATALOG_DICTIONARY[slug];
      if (matched) {
        product = { ...product, ...matched };
      }

      // Fetch all images for this product ordered by sort_order
      const pImgs = await db
        .select()
        .from(productImages)
        .where(eq(productImages.product_id, fetchedProd.id))
        .all();

      if (pImgs && pImgs.length > 0) {
        const imageUrls = pImgs.map((img) => img.url);
        product = {
          ...product,
          imageUrl: pImgs.find((img) => img.is_primary)?.url || imageUrls[0],
          imageUrls: imageUrls,
        };
      }
    }
  } catch (err) {
    console.warn("⚠️ PDP DB query fallback active:", err);
  }

  if (!product) {
    const matched = CATALOG_DICTIONARY[slug];
    if (matched) {
      product = matched;
      // This fallback only runs when the DB lookup above found nothing at all — best-effort guess
      // from the catalogue entry rather than a wrong claim.
      category = matched.isSpaCategory ? getPillar("manicure-pedicure-spa-furniture") : undefined;
    } else {
      // No DB row and no catalogue entry means this product does not exist. This branch used
      // to synthesise one: an invented SKU, an invented price (NPR 120,000 or NPR 11,500) and
      // a stock photo, served with HTTP 200 and Product JSON-LD asserting a price and InStock.
      // That breaks the "never invent a price or SKU" rule and creates unlimited fabricated
      // product pages for any slug a crawler guesses.
      notFound();
    }
  }

  const priceNprNum = product.price_npr / 100;
  // Not for sale if it has no price, or if its category is one we do not stock yet.
  // `category` is the Pillar resolved above from the product's category_id.
  const isPlaceholder = product.price_npr <= 0 || (category ? !category.stocked : false);

  // Brand is derived from the product name — never hardcoded — so eyewear doesn't get labelled "Eternity Products".
  const brandName = /ikonic/i.test(product.name)
    ? "Ikonic"
    : /ray-?ban/i.test(product.name)
    ? "Ray-Ban"
    : /oakley/i.test(product.name)
    ? "Oakley"
    : "Eternity Products";

  // Complete Google Search Console Structured Data: Fixes Product Snippets & Merchant Listings Issues
  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: [
      `https://www.eternityproducts.online${product.imageUrl}`,
      "https://www.eternityproducts.online/logo.png"
    ],
    description: (product as { description?: string }).description || `Buy authentic ${product.name} from Eternity Products Nepal. Authorized importer of Ikonic styling tools and luxury salon equipment with 1-year replacement warranty.`,
    sku: product.sku,
    mpn: product.sku,
    brand: {
      "@type": "Brand",
      name: brandName,
    },
    // Placeholder products (price_npr === 0, not really stocked yet) omit `offers` entirely rather
    // than publish a zero price — that risks a Google Merchant listing policy violation.
    ...(!isPlaceholder && {
      offers: {
        "@type": "Offer",
        url: `https://www.eternityproducts.online/p/${product.slug}`,
        priceCurrency: "NPR",
        price: priceNprNum,
        priceValidUntil: "2027-12-31",
        itemCondition: "https://schema.org/NewCondition",
        availability: "https://schema.org/InStock",
        seller: {
          "@type": "Organization",
          name: "Eternity Products Nepal",
          url: "https://www.eternityproducts.online",
        },
        hasMerchantReturnPolicy: {
          "@type": "MerchantReturnPolicy",
          applicableCountry: "NP",
          returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
          merchantReturnDays: 7,
          returnMethod: "https://schema.org/ReturnInStore",
          returnFees: "https://schema.org/FreeReturn",
        },
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingRate: {
            "@type": "MonetaryAmount",
            value: "0",
            currency: "NPR",
          },
          shippingDestination: {
            "@type": "DefinedRegion",
            addressCountry: "NP",
          },
          deliveryTime: {
            "@type": "ShippingDeliveryTime",
            handlingTime: {
              "@type": "QuantitativeValue",
              minValue: 0,
              maxValue: 1,
              unitCode: "DAY",
            },
            transitTime: {
              "@type": "QuantitativeValue",
              minValue: 1,
              maxValue: 3,
              unitCode: "DAY",
            },
          },
        },
      },
    }),
  };

  // JSON-LD Breadcrumb Schema — reflects the product's real pillar, not a hardcoded guess.
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.eternityproducts.online",
      },
      ...(category
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: category.name,
              item: `https://www.eternityproducts.online/c/${category.slug}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: category ? 3 : 2,
        name: product.name,
        item: `https://www.eternityproducts.online/p/${product.slug}`,
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

      <main className="flex-1 py-10 pb-28 md:pb-10 container mx-auto px-4 lg:px-8 space-y-12">
        {/* Breadcrumb */}
        <div className="text-xs text-outline flex items-center space-x-2">
          <Link href="/" className="hover:underline">Home</Link>
          {category && (
            <>
              <ChevronRight className="w-3 h-3 text-outline" />
              <Link href={`/c/${category.slug}`} className="hover:underline font-semibold">{category.name}</Link>
            </>
          )}
          <ChevronRight className="w-3 h-3 text-outline" />
          <span className="text-on-surface font-semibold truncate max-w-xs">{product.name}</span>
        </div>

        {/* Product Color Selection & Interactive Showcase */}
        <ProductColorSelector product={product} categoryName={category?.name} isPlaceholder={isPlaceholder} />

        {/* Live Interactive B2B ROI Calculator Section */}
        <div className="pt-8 border-t border-outline-variant/60">
          <SalonCalculatorWidget
            defaultChairPriceNpr={Math.round(product.price_npr / 100)}
            equipmentType={product.name}
          />
        </div>

        {/* Customer & Salon Verified Reviews Section */}
        <ProductReviewsSection productName={product.name} />
      </main>

      <Footer />
    </div>
  );
}
