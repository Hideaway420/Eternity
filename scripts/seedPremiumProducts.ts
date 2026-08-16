import { createClient } from "@libsql/client";
import path from "path";

// Define strict TypeScript interface for Real Premium Product Imports
export interface PremiumProductImport {
  sku: string;
  slug: string;
  name: string;
  category_slug: "spa" | "luxury-salon-chairs" | "manicure-pedicure-spa-furniture";
  price_npr: number; // Price in NPR (e.g. 120000 for NPR 120,000)
  compare_at_npr?: number; // Original Compare-at price in NPR
  deposit_percentage: 10 | 15; // Upfront booking deposit %
  image_url: string; // Asset link or path (e.g. /products/spa_chair_classic.jpg)
  seo_description: string; // Dynamic SEO meta description
  line?: "profit" | "traffic";
  status?: "active" | "out_of_stock" | "draft";
}

/**
 * -----------------------------------------------------------------------------
 * REAL PRODUCT IMPORT DATASET (FILL OUT WHEN NEW ASSETS ARE PROVIDED)
 * -----------------------------------------------------------------------------
 */
export const PREMIUM_PRODUCTS_TO_IMPORT: PremiumProductImport[] = [
  // --- MANICURE & PEDICURE SPA FURNITURE ---
  {
    sku: "ETP-SPA-01",
    slug: "classic-eternity-spa-chair",
    name: "Classic Eternity Spa Chair",
    category_slug: "spa",
    price_npr: 120000,
    compare_at_npr: 130000,
    deposit_percentage: 15,
    image_url: "/products/spa_chair_classic.jpg",
    seo_description:
      "Transform your salon into a sanctuary of relaxation with the Classic Eternity Spa Chair. Ergonomic plush cushioning wrapped in spill-resistant upholstery with foot hydromassage.",
    line: "profit",
    status: "active",
  },
  {
    sku: "ETP-SPA-02",
    slug: "eternity-elegance-pedicure-station",
    name: "Eternity Elegance Pedicure Station",
    category_slug: "spa",
    price_npr: 128000,
    compare_at_npr: 139000,
    deposit_percentage: 15,
    image_url: "/products/spa_chair_elegance.jpg",
    seo_description:
      "Offer your clients the gold standard of foot care with the Eternity Elegance Pedicure Station. Quiet massage mechanics, deep soaking basin, and full lumbar support.",
    line: "profit",
    status: "active",
  },
  {
    sku: "ETP-SPA-03",
    slug: "eternity-luxe-spa-recliner",
    name: "Eternity Luxe Spa Recliner",
    category_slug: "spa",
    price_npr: 135000,
    compare_at_npr: 146500,
    deposit_percentage: 15,
    image_url: "/products/spa_chair_pink_recliner.jpg",
    seo_description:
      "VIP Spa recliner engineered for luxury wellness resorts. Cloud-like plushness with minimalist gold accents and motorized recline.",
    line: "profit",
    status: "active",
  },
  {
    sku: "ETP-SPA-04",
    slug: "eternity-signature-series-limited-edition",
    name: "Eternity Signature Series (Limited Edition)",
    category_slug: "spa",
    price_npr: 140000,
    compare_at_npr: 145000,
    deposit_percentage: 15,
    image_url: "/products/spa_chair_signature.jpg",
    seo_description:
      "Pinnacle of salon luxury. Hand-stitched detailing, ultra-premium memory foam, and state-of-the-art spa technology.",
    line: "profit",
    status: "active",
  },

  // --- LUXURY SALON CHAIRS ---
  {
    sku: "ETP-LSC-01",
    slug: "eternity-emerald-royal-luxury-salon-chair",
    name: "Eternity Emerald Royal Luxury Salon Chair",
    category_slug: "luxury-salon-chairs",
    price_npr: 35000,
    compare_at_npr: 36850,
    deposit_percentage: 10,
    image_url: "/products/chair_emerald_green_1786235658712.jpg",
    seo_description:
      "Heavy-duty hydraulic reclining styling chair in Emerald Green leather with 360-degree lockable swivel base.",
    line: "profit",
    status: "active",
  },
  {
    sku: "ETP-LSC-02",
    slug: "eternity-espresso-vintage-luxury-salon-chair",
    name: "Eternity Espresso Vintage Luxury Salon Chair",
    category_slug: "luxury-salon-chairs",
    price_npr: 37500,
    compare_at_npr: 39500,
    deposit_percentage: 10,
    image_url: "/products/chair_espresso_brown_1786235685819.jpg",
    seo_description:
      "Vintage Espresso Brown leather hydraulic styling chair with heavy-duty chrome hydraulic pump.",
    line: "profit",
    status: "active",
  },
  {
    sku: "ETP-LSC-03",
    slug: "eternity-burgundy-regal-luxury-salon-chair",
    name: "Eternity Burgundy Regal Luxury Salon Chair",
    category_slug: "luxury-salon-chairs",
    price_npr: 38500,
    compare_at_npr: 40500,
    deposit_percentage: 10,
    image_url: "/products/chair_burgundy_red_1786235698852.jpg",
    seo_description:
      "Regal Burgundy Red leather reclining chair with adjustable headrest and stainless steel footrest.",
    line: "profit",
    status: "active",
  },
];

function getClientUrl() {
  if (process.env.TURSO_DATABASE_URL) {
    return process.env.TURSO_DATABASE_URL;
  }
  return `file:${path.join(process.cwd(), "eternity.db")}`;
}

async function seedPremiumProducts() {
  console.log("🚀 Starting Premium Product Import Script...");
  const url = getClientUrl();
  const authToken = process.env.TURSO_AUTH_TOKEN;

  const client = createClient({ url, authToken });

  try {
    // Task 1: Premium Category Data Sanitization Query with FK safety
    console.log("🧹 Executing Category Data Sanitization Query...");
    await client.execute(`PRAGMA foreign_keys = OFF;`);
    await client.execute(`
      DELETE FROM inventory WHERE product_id IN (
        SELECT id FROM products WHERE category_id IN (
          SELECT id FROM categories WHERE slug IN ('spa', 'luxury-salon-chairs', 'luxury-chairs', 'manicure-pedicure-spa-furniture')
        )
      );
    `);
    await client.execute(`
      DELETE FROM product_images WHERE product_id IN (
        SELECT id FROM products WHERE category_id IN (
          SELECT id FROM categories WHERE slug IN ('spa', 'luxury-salon-chairs', 'luxury-chairs', 'manicure-pedicure-spa-furniture')
        )
      );
    `);
    await client.execute(`
      DELETE FROM products 
      WHERE category_id IN (
        SELECT id FROM categories 
        WHERE slug IN ('spa', 'luxury-salon-chairs', 'luxury-chairs', 'manicure-pedicure-spa-furniture')
      );
    `);
    await client.execute(`PRAGMA foreign_keys = ON;`);
    console.log("✅ Sanitized existing dummy products from luxury categories.");

    // Task 3: Real Product Import Loop
    console.log(`📦 Injecting ${PREMIUM_PRODUCTS_TO_IMPORT.length} premium products...`);
    for (const item of PREMIUM_PRODUCTS_TO_IMPORT) {
      const prodId = `prod-${item.sku.toLowerCase()}`;
      const categoryId = item.category_slug === "luxury-salon-chairs" ? "cat-chairs" : "cat-spa";
      const pricePaisa = Math.round(item.price_npr * 100);
      const compareAtPaisa = item.compare_at_npr ? Math.round(item.compare_at_npr * 100) : null;
      const costPaisa = Math.round(pricePaisa * 0.65); // 65% estimated cost

      // Insert or Replace Product
      await client.execute({
        sql: `
          INSERT OR REPLACE INTO products (
            id, sku, slug, name, description, category_id, line, 
            price_npr, compare_at_npr, cost_npr, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'));
        `,
        args: [
          prodId,
          item.sku,
          item.slug,
          item.name,
          item.seo_description,
          categoryId,
          item.line || "profit",
          pricePaisa,
          compareAtPaisa,
          costPaisa,
          item.status || "active",
        ],
      });

      // Insert Product Primary Image if URL exists
      if (item.image_url) {
        await client.execute({
          sql: `
            INSERT OR REPLACE INTO product_images (
              id, product_id, url, alt, is_primary, sort_order
            ) VALUES (?, ?, ?, ?, 1, 0);
          `,
          args: [`img-${item.sku.toLowerCase()}`, prodId, item.image_url, `${item.name} - Luxury Manicure and Pedicure Spa Furniture`],
        });
      }

      // Insert Main Showroom Inventory Quantity
      await client.execute({
        sql: `
          INSERT OR REPLACE INTO inventory (
            id, product_id, warehouse_id, qty_on_hand, qty_reserved, qty_incoming
          ) VALUES (?, ?, 'wh-main', 5, 0, 2);
        `,
        args: [`inv-${item.sku.toLowerCase()}`, prodId],
      });

      console.log(`  ✓ Imported: ${item.name} (${item.sku}) - NPR ${item.price_npr.toLocaleString()}`);
    }

    console.log("🎉 Premium Product Seeding Complete!");
  } catch (error) {
    console.error("❌ Error during premium product seeding:", error);
    process.exit(1);
  }
}

seedPremiumProducts();
