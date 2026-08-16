import { createClient } from "@libsql/client";
import path from "path";

function getClientUrl() {
  if (process.env.TURSO_DATABASE_URL) {
    return process.env.TURSO_DATABASE_URL;
  }
  return `file:${path.join(process.cwd(), "eternity.db")}`;
}

const OFFICIAL_CATEGORIES = [
  { id: "cat-straighteners", name: "Hair Straighteners", slug: "hair-straighteners", sort: 1 },
  { id: "cat-dryers", name: "Hair Dryers & Curlers", slug: "hair-dryers-curlers", sort: 2 },
  { id: "cat-chairs", name: "Luxury Chairs", slug: "luxury-chairs", sort: 3 },
  { id: "cat-spa", name: "Manicure & Pedicure Spa Furniture", slug: "manicure-pedicure-spa-furniture", sort: 4 },
];

async function purgeAndResetTaxonomy() {
  console.log("🔥 Starting The Great Database Purge & Official Taxonomy Reset...");
  const url = getClientUrl();
  const authToken = process.env.TURSO_AUTH_TOKEN;

  const client = createClient({ url, authToken });

  try {
    // Disable Foreign Key Enforcement for clean purge
    await client.execute(`PRAGMA foreign_keys = OFF;`);

    // Task 1: Wipe all existing products, inventory, and product images
    console.log("🧹 Wiping legacy inventory, product images, and products tables...");
    const invDel = await client.execute(`DELETE FROM inventory;`);
    const imgDel = await client.execute(`DELETE FROM product_images;`);
    const prodDel = await client.execute(`DELETE FROM products;`);
    const catDel = await client.execute(`DELETE FROM categories;`);

    console.log(`✅ Deleted ${prodDel.rowsAffected} products, ${imgDel.rowsAffected} images, and ${invDel.rowsAffected} inventory rows.`);

    // Task 2: Insert 4 Official Category Silos
    console.log("🏗️ Establishing Official 4-Pillar Taxonomy...");
    for (const cat of OFFICIAL_CATEGORIES) {
      await client.execute({
        sql: `INSERT OR REPLACE INTO categories (id, name, slug, sort_order) VALUES (?, ?, ?, ?);`,
        args: [cat.id, cat.name, cat.slug, cat.sort],
      });
      console.log(`  ✓ Category: "${cat.name}" (slug: /c/${cat.slug})`);
    }

    // Task 3: Seed exactly 10 placeholders for hair-straighteners and 10 placeholders for hair-dryers-curlers
    console.log("📦 Seeding 10 placeholders into hair-straighteners...");
    for (let i = 1; i <= 10; i++) {
      const numStr = i < 10 ? `0${i}` : `${i}`;
      const prodId = `prod-str-ph-${numStr}`;
      const sku = `ETP-STR-${numStr}`;
      const slug = `eternity-pro-straightener-${i}-coming-soon`;
      const name = `Eternity Pro Straightener ${i} - Coming Soon`;

      await client.execute({
        sql: `
          INSERT INTO products (
            id, sku, slug, name, description, category_id, line, 
            price_npr, compare_at_npr, cost_npr, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, 'cat-straighteners', 'traffic', 0, 0, 0, 'out_of_stock', datetime('now'), datetime('now'));
        `,
        args: [prodId, sku, slug, name, "Next-generation professional titanium hair straightener. Coming soon to Eternity Nepal."],
      });

      await client.execute({
        sql: `INSERT INTO product_images (id, product_id, url, alt, is_primary) VALUES (?, ?, ?, ?, 1);`,
        args: [`img-${prodId}`, prodId, "/products/ikonic_straightener_1786231866243.jpg", name],
      });

      await client.execute({
        sql: `INSERT INTO inventory (id, product_id, warehouse_id, qty_on_hand) VALUES (?, ?, 'wh-main', 0);`,
        args: [`inv-${prodId}`, prodId],
      });
    }

    console.log("📦 Seeding 10 placeholders into hair-dryers-curlers...");
    for (let i = 1; i <= 10; i++) {
      const numStr = i < 10 ? `0${i}` : `${i}`;
      const prodId = `prod-dry-ph-${numStr}`;
      const sku = `ETP-DRY-${numStr}`;
      const slug = `eternity-salon-dryer-${i}-coming-soon`;
      const name = `Eternity Salon Dryer ${i} - Coming Soon`;

      await client.execute({
        sql: `
          INSERT INTO products (
            id, sku, slug, name, description, category_id, line, 
            price_npr, compare_at_npr, cost_npr, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, 'cat-dryers', 'traffic', 0, 0, 0, 'out_of_stock', datetime('now'), datetime('now'));
        `,
        args: [prodId, sku, slug, name, "High-velocity professional salon blow dryer with AC motor. Coming soon to Eternity Nepal."],
      });

      await client.execute({
        sql: `INSERT INTO product_images (id, product_id, url, alt, is_primary) VALUES (?, ?, ?, ?, 1);`,
        args: [`img-${prodId}`, prodId, "/products/ikonic_blow_dryer_1786231888743.jpg", name],
      });

      await client.execute({
        sql: `INSERT INTO inventory (id, product_id, warehouse_id, qty_on_hand) VALUES (?, ?, 'wh-main', 0);`,
        args: [`inv-${prodId}`, prodId],
      });
    }

    // Enable Foreign Keys back
    await client.execute(`PRAGMA foreign_keys = ON;`);

    // Verify row counts
    const finalProdCount = await client.execute(`SELECT count(*) as total FROM products;`);
    console.log(`\n🎉 Purge & Official Taxonomy Reset Complete! Total active products in database: ${finalProdCount.rows[0].total}`);
  } catch (error) {
    console.error("❌ Error during purge and reset:", error);
    process.exit(1);
  }
}

purgeAndResetTaxonomy();
