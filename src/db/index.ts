import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
import path from "path";

function getClientUrl() {
  if (process.env.TURSO_DATABASE_URL) {
    return process.env.TURSO_DATABASE_URL;
  }

  // `next build` imports this module while prerendering, before any deployment env is available,
  // so the build itself is allowed an empty throwaway DB.
  if (process.env.NEXT_PHASE === "phase-production-build") {
    console.warn("Building without TURSO_DATABASE_URL - using a throwaway in-memory database.");
    return "file::memory:";
  }

  // At runtime this used to fall back to "file::memory:", so every cold start began with an empty
  // database: admin writes reported success and vanished, and the storefront served fallbacks.
  // Failing loudly is the only honest option - a silent empty catalogue looks like a working site.
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    throw new Error(
      "TURSO_DATABASE_URL is not set. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in the deployment " +
        "environment and run `npm run db:push` once against that database."
    );
  }

  return `file:${path.join(process.cwd(), "eternity.db")}`;
}

const url = getClientUrl();
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({
  url,
  authToken,
});

export const db = drizzle(client, { schema });

export async function initTables() {
  try {
    await client.executeMultiple(`
      CREATE TABLE IF NOT EXISTS brands (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        logo_url TEXT,
        country_of_origin TEXT DEFAULT 'India'
      );

      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        name_np TEXT,
        slug TEXT NOT NULL UNIQUE,
        parent_id TEXT,
        sort_order INTEGER DEFAULT 0,
        image_url TEXT
      );

      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        sku TEXT NOT NULL UNIQUE,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        name_np TEXT,
        description TEXT,
        description_np TEXT,
        brand_id TEXT REFERENCES brands(id),
        category_id TEXT REFERENCES categories(id),
        line TEXT NOT NULL DEFAULT 'traffic',
        business_model TEXT NOT NULL DEFAULT 'BOTH',
        price_npr INTEGER NOT NULL,
        compare_at_npr INTEGER,
        cost_npr INTEGER,
        price_range TEXT,
        b2b_only INTEGER DEFAULT 0,
        warranty_months INTEGER DEFAULT 12,
        hs_code TEXT,
        specs TEXT,
        authenticity_note TEXT,
        is_hero INTEGER DEFAULT 0,
        is_featured INTEGER DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS product_images (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL REFERENCES products(id),
        url TEXT NOT NULL,
        alt TEXT,
        alt_np TEXT,
        image_hash TEXT,
        sort_order INTEGER DEFAULT 0,
        is_primary INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS warehouses (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'warehouse',
        address TEXT,
        district TEXT DEFAULT 'Kathmandu',
        is_default INTEGER DEFAULT 0,
        active INTEGER DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS inventory (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL REFERENCES products(id),
        variant_id TEXT,
        warehouse_id TEXT NOT NULL REFERENCES warehouses(id),
        qty_on_hand INTEGER NOT NULL DEFAULT 0,
        qty_reserved INTEGER NOT NULL DEFAULT 0,
        qty_incoming INTEGER NOT NULL DEFAULT 0,
        reorder_point INTEGER DEFAULT 5,
        safety_stock INTEGER DEFAULT 2,
        bin_location TEXT
      );

      -- Default Warehouse
      INSERT OR IGNORE INTO warehouses (id, name, type, address, district, is_default, active)
      VALUES ('wh-main', 'Kathmandu Main Showroom & Warehouse', 'warehouse', 'New Road', 'Kathmandu', 1, 1);

      -- Categories
      INSERT OR IGNORE INTO categories (id, name, slug, sort_order)
      VALUES 
        ('cat-spa', 'Manicure & Pedicure Spa Furniture', 'manicure-pedicure-spa-furniture', 1),
        ('cat-chairs', 'Luxury Salon Chairs', 'luxury-chairs', 2),
        ('cat-straighteners', 'Hair Straighteners', 'hair-straighteners', 3),
        ('cat-dryers', 'Hair Dryers & Curlers', 'hair-dryers-curlers', 4),
        ('cat-eyewear', 'Premium Eyewear', 'eyewear', 5);

      -- Migrate databases seeded with the old slugs onto the canonical 5-pillar slugs.
      UPDATE categories SET slug = 'manicure-pedicure-spa-furniture' WHERE id = 'cat-spa';
      UPDATE categories SET slug = 'luxury-chairs'                   WHERE id = 'cat-chairs';
      UPDATE categories SET slug = 'hair-dryers-curlers'             WHERE id = 'cat-dryers';

    `);

    // Product seed is best-effort and deliberately in its own batch. A single bad row here
    // must not prevent table creation, the slug migration, or the feature-flag backfill.
    try {
      await client.executeMultiple(`
      -- 4 REAL LUXURY SPA & PEDICURE CHAIRS INVENTORY SEED
      INSERT OR IGNORE INTO products (id, sku, slug, name, description, category_id, line, price_npr, compare_at_npr, cost_npr, status, created_at, updated_at)
      VALUES
        ('prod-etp-spa-01', 'ETP-SPA-01', 'classic-eternity-spa-chair', 'Classic Eternity Spa Chair', 'Transform your salon into a sanctuary of relaxation with the Classic Eternity Spa Chair. Ergonomic plush cushioning wrapped in spill-resistant upholstery with foot hydromassage.', 'cat-spa', 'profit', 12000000, 13000000, 7800000, 'active', datetime('now'), datetime('now')),
        ('prod-etp-spa-02', 'ETP-SPA-02', 'eternity-elegance-pedicure-station', 'Eternity Elegance Pedicure Station', 'Gold standard of foot care with quiet massage mechanics, deep soaking basin, and full lumbar support backrest.', 'cat-spa', 'profit', 12800000, 13900000, 8200000, 'active', datetime('now'), datetime('now')),
        ('prod-etp-spa-03', 'ETP-SPA-03', 'eternity-luxe-spa-recliner', 'Eternity Luxe Spa Recliner', 'VIP Spa recliner engineered for luxury wellness resorts. Cloud-like plushness with minimalist gold accents.', 'cat-spa', 'profit', 13500000, 14650000, 8700000, 'active', datetime('now'), datetime('now')),
        ('prod-etp-spa-04', 'ETP-SPA-04', 'eternity-signature-series-limited-edition', 'Eternity Signature Series (Limited Edition)', 'Pinnacle of salon luxury. Hand-stitched detailing, ultra-premium memory foam, and state-of-the-art spa technology.', 'cat-spa', 'profit', 14000000, 14500000, 9000000, 'active', datetime('now'), datetime('now'));

      -- 3 REAL SIGNATURE LUXURY SALON CHAIRS INVENTORY SEED
      INSERT OR IGNORE INTO products (id, sku, slug, name, description, category_id, line, price_npr, compare_at_npr, cost_npr, status, created_at, updated_at)
      VALUES
        ('prod-etp-chair-01', 'ETP-LSC-01', 'eternity-emerald-royal-luxury-salon-chair', 'Eternity Emerald Royal Luxury Salon Chair', 'Heavy-duty hydraulic reclining chair in Emerald Green leather with 360-degree lockable swivel base.', 'cat-chairs', 'profit', 3500000, 3685000, 2200000, 'active', datetime('now'), datetime('now')),
        ('prod-etp-chair-02', 'ETP-LSC-02', 'eternity-espresso-vintage-luxury-salon-chair', 'Eternity Espresso Vintage Luxury Salon Chair', 'Vintage Espresso Brown leather hydraulic styling chair with heavy-duty chrome hydraulic pump.', 'cat-chairs', 'profit', 3750000, 3950000, 2350000, 'active', datetime('now'), datetime('now')),
        ('prod-etp-chair-03', 'ETP-LSC-03', 'eternity-burgundy-regal-luxury-salon-chair', 'Eternity Burgundy Regal Luxury Salon Chair', 'Regal Burgundy Red leather reclining chair with adjustable headrest and stainless steel footrest.', 'cat-chairs', 'profit', 3850000, 4050000, 2400000, 'active', datetime('now'), datetime('now'));

      -- 2 REAL PREMIUM EYEWEAR INVENTORY SEED
      INSERT OR IGNORE INTO products (id, sku, slug, name, description, category_id, line, price_npr, compare_at_npr, cost_npr, status, created_at, updated_at)
      VALUES
        ('prod-eye-ph-01', 'ETP-EYE-01', 'ray-ban-tech-carbon-fiber-polarized-coming-soon', 'Ray-Ban Tech Carbon Fiber Polarized', 'Ultra-lightweight carbon fiber polarized premium eyewear. Suspended anti-gravity optical engineering. Direct imported by Eternity Nepal.', 'cat-eyewear', 'eyewear', 1292000, 1450000, 936700, 'active', datetime('now'), datetime('now')),
        ('prod-eye-ph-02', 'ETP-EYE-02', 'oakley-radar-ev-path-prizm-coming-soon', 'Oakley Radar EV Path Prizm', 'High-definition Prizm optics for sports performance. Suspended anti-gravity frame structure. Direct imported by Eternity Nepal.', 'cat-eyewear', 'eyewear', 1450000, 1600000, 1050000, 'active', datetime('now'), datetime('now'));

      -- 10 REAL IKONIC HAIR STRAIGHTENERS INVENTORY SEED
      INSERT OR IGNORE INTO products (id, sku, slug, name, description, category_id, line, price_npr, compare_at_npr, cost_npr, status, created_at, updated_at)
      VALUES
        ('prod-etp-087', 'ETP-087', 'ikonic-professional-hot-brush-burgundy', 'Ikonic Professional Hot Brush - Hair Straightener (Burgundy)', 'Ikonic Professional Hot Brush Hair Straightener in Burgundy edition. Daily styling with temperature control.', 'cat-straighteners', 'traffic', 1150000, 1150000, 833800, 'active', datetime('now'), datetime('now')),
        ('prod-etp-088', 'ETP-088', 'ikonic-professional-hair-straightener-hot-brush', 'Ikonic Professional Hair Straightener Hot Brush', 'Fast heating ceramic hot brush for smooth frizz-free hair straightening.', 'cat-straighteners', 'traffic', 1014000, 1014000, 735200, 'active', datetime('now'), datetime('now')),
        ('prod-etp-089', 'ETP-089', 'ikonic-pro-titanium-shine-30-hair-straightener', 'Ikonic Professional Pro Titanium Shine 3.0 Hair Straightener', 'Professional 3.0 Titanium Shine Hair Straightener with digital temperature indicator.', 'cat-straighteners', 'traffic', 1292000, 1292000, 936700, 'active', datetime('now'), datetime('now')),
        ('prod-etp-090', 'ETP-090', 'ikonic-gleam-pro-hair-straightener', 'Ikonic Professional Gleam Pro Hair Straightener', 'Gleam Pro salon-grade titanium floating plate straightener.', 'cat-straighteners', 'traffic', 1376000, 1376000, 997600, 'active', datetime('now'), datetime('now')),
        ('prod-etp-092', 'ETP-092', 'ikonic-gleam-30-hair-straightener', 'Ikonic Professional Gleam 3.0 Hair Straightener', 'Slim 1-inch rose gold titanium plates with ultra-fast heating.', 'cat-straighteners', 'traffic', 1258000, 1258000, 912100, 'active', datetime('now'), datetime('now')),
        ('prod-etp-093', 'ETP-093', 'ikonic-slim-titanium-shine-30-straightener', 'Ikonic Professional Hair Straightener - Slim Titanium Shine 3.0', 'Slim profile titanium shine straightener for precision styling.', 'cat-straighteners', 'traffic', 1292000, 1292000, 936700, 'active', datetime('now'), datetime('now')),
        ('prod-etp-095', 'ETP-095', 'ikonic-black-titanium-slim-straightener', 'Ikonic Professional Black Titanium Slim Hair Straightener', 'Black titanium floating plates for smooth glides without snagging.', 'cat-straighteners', 'traffic', 888000, 888000, 643800, 'active', datetime('now'), datetime('now')),
        ('prod-etp-096', 'ETP-096', 'ikonic-pro-straight-black-hair-straightener', 'Ikonic Professional Pro Straight Black Hair Straightener', 'High-heat ceramic straightener with ergonomic swivel cord.', 'cat-straighteners', 'traffic', 976000, 976000, 707600, 'active', datetime('now'), datetime('now')),
        ('prod-etp-098', 'ETP-098', 'ikonic-s3-plus-hair-straightener', 'Ikonic Professional S3+ Hair Straightener', 'Ceramic coated floating plates with rapid heat recovery.', 'cat-straighteners', 'traffic', 769000, 769000, 557500, 'active', datetime('now'), datetime('now')),
        ('prod-etp-103', 'ETP-103', 'ikonic-me-xtreme-straight-hair-straightener', 'Ikonic Me Xtreme Straight Hair Straightener', 'Compact lightweight daily straightener for smooth silky hair.', 'cat-straighteners', 'traffic', 480000, 480000, 348000, 'active', datetime('now'), datetime('now'));

      -- 10 REAL IKONIC HAIR DRYERS & CURLERS INVENTORY SEED
      INSERT OR IGNORE INTO products (id, sku, slug, name, description, category_id, line, price_npr, compare_at_npr, cost_npr, status, created_at, updated_at)
      VALUES
        ('prod-etp-112', 'ETP-112', 'ikonic-professional-id-20-hair-dryer', 'Ikonic Professional Id 2.0 Hair Dryer', 'Flagship 2000W AC Motor Salon Hair Dryer with brushless high-speed airflow.', 'cat-dryers', 'traffic', 2622000, 2622000, 1901000, 'active', datetime('now'), datetime('now')),
        ('prod-etp-113', 'ETP-113', 'ikonic-professional-id-20-ash-grey-dryer-stand', 'Ikonic Professional ID 2.0 Hair Dryer (Ash Grey) + Free Stand', 'Ash Grey limited edition ID 2.0 hair dryer bundled with official desktop stand.', 'cat-dryers', 'traffic', 2185000, 2185000, 1584100, 'active', datetime('now'), datetime('now')),
        ('prod-etp-114', 'ETP-114', 'ikonic-dynamite-scarlett-limited-edition-dryer', 'Ikonic Professional Dynamite+ Scarlett Limited Edition Hair Dryer', 'Scarlett Red edition ultra-compact high-power salon blow dryer.', 'cat-dryers', 'traffic', 1844000, 1844000, 1336900, 'active', datetime('now'), datetime('now')),
        ('prod-etp-115', 'ETP-115', 'ikonic-dynamite-plus-hair-dryer', 'Ikonic Professional Dynamite+ Hair Dryer', 'Heavy-duty salon blow dryer with ionic airflow technology.', 'cat-dryers', 'traffic', 1529000, 1529000, 1108500, 'active', datetime('now'), datetime('now')),
        ('prod-etp-116', 'ETP-116', 'ikonic-pro-2800-plus-hair-dryer', 'Ikonic Professional Pro 2800+ Hair Dryer', 'Professional 2800W high-velocity salon blow dryer with double nozzles.', 'cat-dryers', 'traffic', 1338000, 1338000, 970100, 'active', datetime('now'), datetime('now')),
        ('prod-etp-118', 'ETP-118', 'ikonic-pro-2500-plus-advanced-hair-dryer', 'Ikonic Professional Pro 2500+ Advanced Hair Dryer', 'Advanced 2500W ionic blow dryer with cold shot button.', 'cat-dryers', 'traffic', 1000000, 1000000, 725000, 'active', datetime('now'), datetime('now')),
        ('prod-etp-121', 'ETP-121', 'ikonic-professional-hair-dryer-pro-2200-plus', 'Ikonic Professional Hair Dryer Pro 2200+', 'High-performance 2200W salon dryer in Black & Red accents.', 'cat-dryers', 'traffic', 750000, 750000, 543800, 'active', datetime('now'), datetime('now')),
        ('prod-etp-123', 'ETP-123', 'ikonic-pro-2100-plus-hair-dryer', 'Ikonic Professional Pro 2100+ Hair Dryer', 'Lightweight 2100W daily salon blow dryer.', 'cat-dryers', 'traffic', 572000, 572000, 414700, 'active', datetime('now'), datetime('now')),
        ('prod-etp-135', 'ETP-135', 'ikonic-pro-curl-hair-curler', 'Ikonic Professional Pro Curl Hair Curler', 'Professional ceramic curling tong for bouncy long-lasting curls.', 'cat-dryers', 'traffic', 937000, 937000, 679300, 'active', datetime('now'), datetime('now')),
        ('prod-etp-138', 'ETP-138', 'ikonic-curling-tong-20-hair-curler', 'Ikonic Professional Curling Tong 2.0 Hair Curler', 'Black & Gold 2.0 ceramic curling barrel with digital thermostatic control.', 'cat-dryers', 'traffic', 660000, 660000, 478500, 'active', datetime('now'), datetime('now'));

      -- PRODUCT IMAGES SEED
      INSERT OR IGNORE INTO product_images (id, product_id, url, alt, is_primary)
      VALUES
        ('img-spa-01', 'prod-etp-spa-01', '/products/spa_chair_classic.jpg', 'Classic Eternity Spa Chair', 1),
        ('img-spa-02', 'prod-etp-spa-02', '/products/spa_chair_elegance.jpg', 'Eternity Elegance Pedicure Station', 1),
        ('img-spa-03', 'prod-etp-spa-03', '/products/spa_chair_pink_recliner.jpg', 'Eternity Luxe Spa Recliner', 1),
        ('img-spa-04', 'prod-etp-spa-04', '/products/spa_chair_signature.jpg', 'Eternity Signature Series', 1),
        ('img-eye-ph-01', 'prod-eye-ph-01', '/products/antigravity_eyewear.jpg', 'Ray-Ban Tech Carbon Fiber Polarized', 1),
        ('img-eye-ph-02', 'prod-eye-ph-02', '/products/antigravity_eyewear.jpg', 'Oakley Radar EV Path Prizm', 1),
        ('img-etp-087', 'prod-etp-087', '/products/ikonic_straightener_1786231866243.jpg', 'Ikonic Professional Hot Brush', 1),
        ('img-etp-088', 'prod-etp-088', '/products/ikonic_straightener_1786231866243.jpg', 'Ikonic Professional Hair Straightener Hot Brush', 1),
        ('img-etp-089', 'prod-etp-089', '/products/ikonic_straightener_1786231866243.jpg', 'Ikonic Professional Pro Titanium Shine 3.0', 1),
        ('img-etp-090', 'prod-etp-090', '/products/ikonic_straightener_1786231866243.jpg', 'Ikonic Professional Gleam Pro', 1),
        ('img-etp-092', 'prod-etp-092', '/products/ikonic_straightener_1786231866243.jpg', 'Ikonic Professional Gleam 3.0', 1),
        ('img-etp-093', 'prod-etp-093', '/products/ikonic_straightener_1786231866243.jpg', 'Ikonic Professional Hair Straightener - Slim Titanium Shine 3.0', 1),
        ('img-etp-095', 'prod-etp-095', '/products/ikonic_straightener_1786231866243.jpg', 'Ikonic Professional Black Titanium Slim', 1),
        ('img-etp-096', 'prod-etp-096', '/products/ikonic_straightener_1786231866243.jpg', 'Ikonic Professional Pro Straight Black', 1),
        ('img-etp-098', 'prod-etp-098', '/products/ikonic_straightener_1786231866243.jpg', 'Ikonic Professional S3+', 1),
        ('img-etp-103', 'prod-etp-103', '/products/ikonic_straightener_1786231866243.jpg', 'Ikonic Me Xtreme Straight', 1),
        ('img-etp-112', 'prod-etp-112', '/products/ikonic_blow_dryer_1786231888743.jpg', 'Ikonic Professional Id 2.0 Hair Dryer', 1),
        ('img-etp-113', 'prod-etp-113', '/products/ikonic_blow_dryer_1786231888743.jpg', 'Ikonic Professional ID 2.0 Hair Dryer (Ash Grey)', 1),
        ('img-etp-114', 'prod-etp-114', '/products/ikonic_blow_dryer_1786231888743.jpg', 'Ikonic Professional Dynamite+ Scarlett', 1),
        ('img-etp-115', 'prod-etp-115', '/products/ikonic_blow_dryer_1786231888743.jpg', 'Ikonic Professional Dynamite+', 1),
        ('img-etp-116', 'prod-etp-116', '/products/ikonic_blow_dryer_1786231888743.jpg', 'Ikonic Professional Pro 2800+', 1),
        ('img-etp-118', 'prod-etp-118', '/products/ikonic_blow_dryer_1786231888743.jpg', 'Ikonic Professional Pro 2500+ Advanced', 1),
        ('img-etp-121', 'prod-etp-121', '/products/ikonic_blow_dryer_1786231888743.jpg', 'Ikonic Professional Hair Dryer Pro 2200+', 1),
        ('img-etp-123', 'prod-etp-123', '/products/ikonic_blow_dryer_1786231888743.jpg', 'Ikonic Professional Pro 2100+', 1),
        ('img-etp-135', 'prod-etp-135', '/products/ikonic_blow_dryer_1786231888743.jpg', 'Ikonic Professional Pro Curl Hair Curler', 1),
        ('img-etp-138', 'prod-etp-138', '/products/ikonic_blow_dryer_1786231888743.jpg', 'Ikonic Professional Curling Tong 2.0 Hair Curler', 1);
      `);

      // Chair images resolved by SKU, because the chair rows may already exist under ids created
      // by scripts/purgeAndResetTaxonomy.ts rather than the ids in the seed above.
      for (const [imageId, sku, url, alt] of [
        ["img-chair-01", "ETP-LSC-01", "/products/chair_emerald_green_1786235658712.jpg", "Emerald Royal Salon Chair"],
        ["img-chair-02", "ETP-LSC-02", "/products/chair_espresso_brown_1786235685819.jpg", "Espresso Vintage Salon Chair"],
        ["img-chair-03", "ETP-LSC-03", "/products/chair_burgundy_red_1786235698852.jpg", "Burgundy Regal Salon Chair"],
      ]) {
        await client.execute({
          sql: `INSERT OR IGNORE INTO product_images (id, product_id, url, alt, is_primary)
                SELECT ?, p.id, ?, ?, 1 FROM products p WHERE p.sku = ?`,
          args: [imageId, url, alt, sku],
        });
      }
    } catch (seedErr) {
      console.error("Product seed failed (schema is still intact):", seedErr);
    }

    // "duplicate column name" is the expected no-op here; anything else is a real migration failure.
    for (const statement of [
      `ALTER TABLE product_images ADD COLUMN image_hash TEXT;`,
      `ALTER TABLE products ADD COLUMN is_hero INTEGER DEFAULT 0;`,
      `ALTER TABLE products ADD COLUMN is_featured INTEGER DEFAULT 0;`,
      `ALTER TABLE products ADD COLUMN price_range TEXT;`,
    ]) {
      try {
        await client.execute(statement);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (!/duplicate column/i.test(message)) {
          console.error("Migration failed:", statement, message);
        }
      }
    }

    try {
      await client.execute(`UPDATE products SET is_hero = 1 WHERE sku = 'ETP-SPA-01';`);
      await client.execute(`UPDATE products SET is_featured = 1 WHERE sku IN ('ETP-SPA-02', 'ETP-SPA-03', 'ETP-SPA-04', 'ETP-LSC-01', 'ETP-LSC-02', 'ETP-LSC-03');`);
    } catch (err) {
      console.error("Feature-flag backfill failed:", err);
    }
  } catch (err) {
    console.error("initTables failed. Run `npm run db:push` against this database:", err);
  }
}
