import { MetadataRoute } from "next";
import { db, initTables } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";

const BASE_URL = "https://www.eternityproducts.online";

// All core static & official category routes
const STATIC_ROUTES = [
  "",
  "/about",
  "/contact",
  "/warranty",
  "/checkout",
  "/c/hair-straighteners",
  "/c/hair-dryers-curlers",
  "/c/luxury-chairs",
  "/c/manicure-pedicure-spa-furniture",
];

// Fallback product slugs for sitemap indexing
const FALLBACK_PRODUCT_SLUGS = [
  "classic-eternity-spa-chair",
  "eternity-elegance-pedicure-station",
  "eternity-luxe-spa-recliner",
  "eternity-signature-series-limited-edition",
  "eternity-emerald-royal-luxury-salon-chair",
  "eternity-espresso-vintage-luxury-salon-chair",
  "eternity-burgundy-regal-luxury-salon-chair",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await initTables();
  const currentDate = new Date().toISOString();

  let activeSlugs: string[] = FALLBACK_PRODUCT_SLUGS;

  try {
    const dbProducts = await db
      .select({ slug: products.slug })
      .from(products)
      .where(eq(products.status, "active"))
      .all();

    if (dbProducts.length > 0) {
      const fetchedSlugs = dbProducts.map((p) => p.slug);
      // Merge unique slugs
      activeSlugs = Array.from(new Set([...fetchedSlugs, ...FALLBACK_PRODUCT_SLUGS]));
    }
  } catch (err) {
    console.warn("⚠️ Sitemap DB query fallback active:", err);
  }

  // Generate static page entries
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: currentDate,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route.startsWith("/c/") ? 0.9 : 0.7,
  }));

  // Generate product page entries dynamically from database
  const productEntries: MetadataRoute.Sitemap = activeSlugs.map((slug) => ({
    url: `${BASE_URL}/p/${slug}`,
    lastModified: currentDate,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...productEntries];
}
