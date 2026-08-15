import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
import path from "path";

function getClientUrl() {
  if (process.env.TURSO_DATABASE_URL) {
    return process.env.TURSO_DATABASE_URL;
  }
  // On Vercel / serverless environment without Turso, fallback to in-memory DB to prevent EROFS 500 error
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    return "file::memory:";
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
        b2b_only INTEGER DEFAULT 0,
        warranty_months INTEGER DEFAULT 12,
        hs_code TEXT,
        specs TEXT,
        authenticity_note TEXT,
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
        ('cat-spa', 'Luxury Pedicure & Spa Chairs', 'spa', 1),
        ('cat-chairs', 'Luxury Salon Chairs', 'luxury-salon-chairs', 2),
        ('cat-straighteners', 'Hair Straighteners', 'hair-straighteners', 3),
        ('cat-dryers', 'Hair Dryers & Curlers', 'hair-dryers', 4);

      -- 4 NEW LUXURY SPA & PEDICURE CHAIRS INVENTORY SEED
      INSERT OR IGNORE INTO products (id, sku, slug, name, description, category_id, line, price_npr, compare_at_npr, cost_npr, status, created_at, updated_at)
      VALUES
        ('prod-etp-spa-01', 'ETP-SPA-01', 'classic-eternity-spa-chair', 'Classic Eternity Spa Chair', 'Transform your salon into a sanctuary of relaxation with the Classic Eternity Spa Chair. Ergonomic plush cushioning wrapped in spill-resistant upholstery with foot hydromassage.', 'cat-spa', 'profit', 12000000, 13000000, 7800000, 'active', datetime('now'), datetime('now')),
        ('prod-etp-spa-02', 'ETP-SPA-02', 'eternity-elegance-pedicure-station', 'Eternity Elegance Pedicure Station', 'Gold standard of foot care with quiet massage mechanics, deep soaking basin, and full lumbar support backrest.', 'cat-spa', 'profit', 12800000, 13900000, 8200000, 'active', datetime('now'), datetime('now')),
        ('prod-etp-spa-03', 'ETP-SPA-03', 'eternity-luxe-spa-recliner', 'Eternity Luxe Spa Recliner', 'VIP Spa recliner engineered for luxury wellness resorts. Cloud-like plushness with minimalist gold accents.', 'cat-spa', 'profit', 13500000, 14650000, 8700000, 'active', datetime('now'), datetime('now')),
        ('prod-etp-spa-04', 'ETP-SPA-04', 'eternity-signature-series-limited-edition', 'Eternity Signature Series (Limited Edition)', 'Pinnacle of salon luxury. Hand-stitched detailing, ultra-premium memory foam, and state-of-the-art spa technology.', 'cat-spa', 'profit', 14000000, 14500000, 9000000, 'active', datetime('now'), datetime('now'));

      -- 3 SIGNATURE LUXURY SALON CHAIRS INVENTORY SEED
      INSERT OR IGNORE INTO products (id, sku, slug, name, description, category_id, line, price_npr, compare_at_npr, cost_npr, status, created_at, updated_at)
      VALUES
        ('prod-etp-chair-01', 'ETP-LSC-01', 'eternity-emerald-royal-luxury-salon-chair', 'Eternity Emerald Royal Luxury Salon Chair', 'Heavy-duty hydraulic reclining chair in Emerald Green leather with 360-degree lockable swivel base.', 'cat-chairs', 'profit', 3500000, 3685000, 2200000, 'active', datetime('now'), datetime('now')),
        ('prod-etp-chair-02', 'ETP-LSC-02', 'eternity-espresso-vintage-luxury-salon-chair', 'Eternity Espresso Vintage Luxury Salon Chair', 'Vintage Espresso Brown leather hydraulic styling chair with heavy-duty chrome hydraulic pump.', 'cat-chairs', 'profit', 3750000, 3950000, 2350000, 'active', datetime('now'), datetime('now')),
        ('prod-etp-chair-03', 'ETP-LSC-03', 'eternity-burgundy-regal-luxury-salon-chair', 'Eternity Burgundy Regal Luxury Salon Chair', 'Regal Burgundy Red leather reclining chair with adjustable headrest and stainless steel footrest.', 'cat-chairs', 'profit', 3850000, 4050000, 2400000, 'active', datetime('now'), datetime('now'));

      -- PRODUCT IMAGES SEED
      INSERT OR IGNORE INTO product_images (id, product_id, url, alt, is_primary)
      VALUES
        ('img-spa-01', 'prod-etp-spa-01', '/products/spa_chair_classic.jpg', 'Classic Eternity Spa Chair', 1),
        ('img-spa-02', 'prod-etp-spa-02', '/products/spa_chair_elegance.jpg', 'Eternity Elegance Pedicure Station', 1),
        ('img-spa-03', 'prod-etp-spa-03', '/products/spa_chair_pink_recliner.jpg', 'Eternity Luxe Spa Recliner', 1),
        ('img-spa-04', 'prod-etp-spa-04', '/products/spa_chair_signature.jpg', 'Eternity Signature Series', 1),
        ('img-chair-01', 'prod-etp-chair-01', '/products/chair_emerald_green_1786235658712.jpg', 'Emerald Royal Salon Chair', 1),
        ('img-chair-02', 'prod-etp-chair-02', '/products/chair_espresso_brown_1786235685819.jpg', 'Espresso Vintage Salon Chair', 1),
        ('img-chair-03', 'prod-etp-chair-03', '/products/chair_burgundy_red_1786235698852.jpg', 'Burgundy Regal Salon Chair', 1);

      -- WAREHOUSE INVENTORY QUANTITIES SEED
      INSERT OR IGNORE INTO inventory (id, product_id, warehouse_id, qty_on_hand, qty_reserved, qty_incoming, reorder_point, safety_stock)
      VALUES
        ('inv-spa-01', 'prod-etp-spa-01', 'wh-main', 5, 1, 2, 2, 1),
        ('inv-spa-02', 'prod-etp-spa-02', 'wh-main', 4, 0, 2, 2, 1),
        ('inv-spa-03', 'prod-etp-spa-03', 'wh-main', 3, 1, 3, 2, 1),
        ('inv-spa-04', 'prod-etp-spa-04', 'wh-main', 2, 0, 1, 1, 1),
        ('inv-chair-01', 'prod-etp-chair-01', 'wh-main', 8, 2, 5, 3, 2),
        ('inv-chair-02', 'prod-etp-chair-02', 'wh-main', 6, 1, 4, 3, 2),
        ('inv-chair-03', 'prod-etp-chair-03', 'wh-main', 7, 0, 5, 3, 2);
    `);
  } catch (err) {
    console.warn("⚠️ initTables warning (likely read-only environment or missing Turso env):", err);
  }
}
