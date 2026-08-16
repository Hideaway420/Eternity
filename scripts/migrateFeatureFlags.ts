import { createClient } from "@libsql/client";
import path from "path";

function getClientUrl() {
  if (process.env.TURSO_DATABASE_URL) {
    return process.env.TURSO_DATABASE_URL;
  }
  return `file:${path.join(process.cwd(), "eternity.db")}`;
}

async function migrateFeatureFlags() {
  console.log("🛠️ Starting Turso Schema Migration: Adding is_hero and is_featured feature flags...");
  const url = getClientUrl();
  const authToken = process.env.TURSO_AUTH_TOKEN;

  const client = createClient({ url, authToken });

  try {
    // 1. Add is_hero column safely
    try {
      await client.execute(`ALTER TABLE products ADD COLUMN is_hero INTEGER DEFAULT 0;`);
      console.log("  ✓ Added column 'is_hero' to products table.");
    } catch (err: any) {
      if (err?.message?.includes("duplicate column") || err?.cause?.message?.includes("duplicate column")) {
        console.log("  ℹ Column 'is_hero' already exists.");
      } else {
        console.warn("  ⚠️ Warning adding is_hero column:", err?.message || err);
      }
    }

    // 2. Add is_featured column safely
    try {
      await client.execute(`ALTER TABLE products ADD COLUMN is_featured INTEGER DEFAULT 0;`);
      console.log("  ✓ Added column 'is_featured' to products table.");
    } catch (err: any) {
      if (err?.message?.includes("duplicate column") || err?.cause?.message?.includes("duplicate column")) {
        console.log("  ℹ Column 'is_featured' already exists.");
      } else {
        console.warn("  ⚠️ Warning adding is_featured column:", err?.message || err);
      }
    }

    // 3. Reset all flags
    await client.execute(`UPDATE products SET is_hero = 0, is_featured = 0;`);

    // 4. Set ETP-SPA-01 (Classic Eternity Spa Chair) as HERO product per user directive
    console.log("👑 Setting Hero Product -> ETP-SPA-01 (Classic Eternity Spa Chair)...");
    await client.execute({
      sql: `UPDATE products SET is_hero = 1 WHERE sku = 'ETP-SPA-01';`,
      args: [],
    });

    // 5. Set remaining 6 real premium items as FEATURED
    console.log("⭐ Setting Featured Products -> ETP-SPA-02, ETP-SPA-03, ETP-SPA-04, ETP-LSC-01, ETP-LSC-02, ETP-LSC-03...");
    await client.execute({
      sql: `
        UPDATE products 
        SET is_featured = 1 
        WHERE sku IN ('ETP-SPA-02', 'ETP-SPA-03', 'ETP-SPA-04', 'ETP-LSC-01', 'ETP-LSC-02', 'ETP-LSC-03');
      `,
      args: [],
    });

    // 6. Verification query
    const heroRes = await client.execute(`
      SELECT p.sku, p.name, pi.url 
      FROM products p 
      LEFT JOIN product_images pi ON p.id = pi.product_id 
      WHERE p.is_hero = 1;
    `);

    const featRes = await client.execute(`
      SELECT p.sku, p.name, p.price_npr 
      FROM products p 
      WHERE p.is_featured = 1;
    `);

    console.log("\n=======================================================");
    console.log("📌 MIGRATION VERIFICATION LOG");
    console.log("=======================================================");
    console.log(`👑 HERO PRODUCT (1):`, heroRes.rows[0]);
    console.log(`⭐ FEATURED PRODUCTS (${featRes.rows.length}):`);
    for (const f of featRes.rows) {
      console.log(`  - [${f.sku}] ${f.name}`);
    }

    console.log("\n🎉 Turso Feature Flags Migration & Assignment Complete!");
  } catch (error) {
    console.error("❌ Migration error:", error);
    process.exit(1);
  }
}

migrateFeatureFlags();
