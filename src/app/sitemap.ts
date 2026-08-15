import { MetadataRoute } from "next";

const BASE_URL = "https://eternityproducts.online";

// All core static & category routes
const STATIC_ROUTES = [
  "",
  "/about",
  "/contact",
  "/warranty",
  "/checkout",
  "/c/spa",
  "/c/luxury-salon-chairs",
  "/c/hair-straighteners",
  "/c/hair-dryers",
];

// Product slugs for sitemap indexing
const PRODUCT_SLUGS = [
  "classic-eternity-spa-chair",
  "eternity-elegance-pedicure-station",
  "eternity-luxe-spa-recliner",
  "eternity-signature-series-limited-edition",
  "eternity-emerald-royal-luxury-salon-chair",
  "eternity-espresso-vintage-luxury-salon-chair",
  "eternity-burgundy-regal-luxury-salon-chair",
  "ikonic-barber-chair-felix",
  "ikonic-professional-pro-titanium-shine-3-0-hair-straightener",
  "ikonic-professional-pro-2500-advanced-hair-dryer",
  "ikonic-professional-gleam-pro-hair-straightener",
  "ikonic-professional-id-2-0-hair-dryer",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date().toISOString();

  // Generate static page entries
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: currentDate,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route.startsWith("/c/") ? 0.9 : 0.7,
  }));

  // Generate product page entries
  const productEntries: MetadataRoute.Sitemap = PRODUCT_SLUGS.map((slug) => ({
    url: `${BASE_URL}/p/${slug}`,
    lastModified: currentDate,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...productEntries];
}
