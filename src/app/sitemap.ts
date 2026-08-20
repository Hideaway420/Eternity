import { MetadataRoute } from "next";
import { db, initTables } from "@/db";
import { products } from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";
import { PILLARS, STOCKED_CATEGORY_IDS } from "@/lib/taxonomy";

const BASE_URL = "https://www.eternityproducts.online";

// /checkout and /order/* are deliberately absent: both are noindex, and /checkout was previously
// listed here while robots.ts disallowed it.
const STATIC_ROUTES = ["", "/about", "/contact", "/warranty"];

// Only real, stocked products. Placeholders at price 0 are noindex and must not be submitted.
const FALLBACK_PRODUCT_SLUGS = [
  "classic-eternity-spa-chair",
  "eternity-elegance-pedicure-station",
  "eternity-luxe-spa-recliner",
  "eternity-signature-series-limited-edition",
  "eternity-emerald-royal-luxury-salon-chair",
  "eternity-espresso-vintage-luxury-salon-chair",
  "eternity-burgundy-regal-luxury-salon-chair",
];

// Built per request rather than baked at build time, so a freshly added product appears
// without a redeploy and lastModified reflects reality.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const buildDate = new Date();

  let productRows: Array<{ slug: string; updatedAt: string | null }> = FALLBACK_PRODUCT_SLUGS.map(
    (slug) => ({ slug, updatedAt: null })
  );

  try {
    await initTables();
    const dbProducts = await db
      .select({
        slug: products.slug,
        updatedAt: products.updated_at,
        categoryId: products.category_id,
      })
      .from(products)
      .where(and(eq(products.status, "active"), gt(products.price_npr, 0)))
      .all();

    // Price alone is not enough: seed rows in unstocked categories carry prices too, including
    // two eyewear products named "Coming Soon". Only submit categories we actually stock.
    const sellable = dbProducts.filter(
      (p) => !p.categoryId || STOCKED_CATEGORY_IDS.has(p.categoryId)
    );

    if (sellable.length > 0) {
      productRows = sellable;
    }
  } catch (err) {
    console.error("Sitemap DB query failed, using fallback slugs:", err);
  }

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: buildDate,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : 0.7,
  }));

  // All five pillars, straight from the taxonomy. /c/eyewear was previously missing entirely.
  const categoryEntries: MetadataRoute.Sitemap = PILLARS.map((pillar) => ({
    url: `${BASE_URL}/c/${pillar.slug}`,
    lastModified: buildDate,
    changeFrequency: "weekly",
    priority: pillar.stocked ? 0.9 : 0.5,
  }));

  // Real per-product timestamps. Previously every URL claimed it changed at crawl time, on every
  // crawl, which Google discounts.
  const productEntries: MetadataRoute.Sitemap = productRows.map(({ slug, updatedAt }) => ({
    url: `${BASE_URL}/p/${slug}`,
    lastModified: updatedAt ? new Date(updatedAt) : buildDate,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
