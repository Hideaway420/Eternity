import { createClient } from "@libsql/client";
import path from "path";

function getClientUrl() {
  if (process.env.TURSO_DATABASE_URL) {
    return process.env.TURSO_DATABASE_URL;
  }
  return `file:${path.join(process.cwd(), "eternity.db")}`;
}

const REAL_LUXURY_CHAIRS = [
  {
    sku: "ETP-LSC-01",
    slug: "eternity-emerald-royal-luxury-salon-chair",
    name: "Eternity Emerald Royal Luxury Salon Chair",
    category_slug: "luxury-chairs",
    price_npr: 35000,
    compare_at_npr: 36850,
    image_url: "/products/chair_emerald_green_1786235658712.jpg",
    description: "Heavy-duty hydraulic reclining styling chair in Emerald Green leather with 360-degree lockable swivel base.",
    status: "active",
  },
  {
    sku: "ETP-LSC-02",
    slug: "eternity-espresso-vintage-luxury-salon-chair",
    name: "Eternity Espresso Vintage Luxury Salon Chair",
    category_slug: "luxury-chairs",
    price_npr: 37500,
    compare_at_npr: 39500,
    image_url: "/products/chair_espresso_brown_1786235685819.jpg",
    description: "Vintage Espresso Brown leather hydraulic styling chair with heavy-duty chrome hydraulic pump.",
    status: "active",
  },
  {
    sku: "ETP-LSC-03",
    slug: "eternity-burgundy-regal-luxury-salon-chair",
    name: "Eternity Burgundy Regal Luxury Salon Chair",
    category_slug: "luxury-chairs",
    price_npr: 38500,
    compare_at_npr: 40500,
    image_url: "/products/chair_burgundy_red_1786235698852.jpg",
    description: "Regal Burgundy Red leather reclining chair with adjustable headrest and stainless steel footrest.",
    status: "active",
  },
];

const REAL_SPA_FURNITURE = [
  {
    sku: "ETP-SPA-01",
    slug: "classic-eternity-spa-chair",
    name: "Classic Eternity Spa Chair",
    category_slug: "manicure-pedicure-spa-furniture",
    price_npr: 120000,
    compare_at_npr: 130000,
    image_url: "/products/spa_chair_classic.jpg",
    description: "Transform your salon into a sanctuary of relaxation with the Classic Eternity Spa Chair. Ergonomic plush cushioning with foot hydromassage.",
    status: "active",
  },
  {
    sku: "ETP-SPA-02",
    slug: "eternity-elegance-pedicure-station",
    name: "Eternity Elegance Pedicure Station",
    category_slug: "manicure-pedicure-spa-furniture",
    price_npr: 128000,
    compare_at_npr: 139000,
    image_url: "/products/spa_chair_elegance.jpg",
    description: "Offer your clients the gold standard of foot care with the Eternity Elegance Pedicure Station. Quiet massage mechanics and deep soaking basin.",
    status: "active",
  },
  {
    sku: "ETP-SPA-03",
    slug: "eternity-luxe-spa-recliner",
    name: "Eternity Luxe Spa Recliner",
    category_slug: "manicure-pedicure-spa-furniture",
    price_npr: 135000,
    compare_at_npr: 146500,
    image_url: "/products/spa_chair_pink_recliner.jpg",
    description: "VIP Spa recliner engineered for luxury wellness resorts. Cloud-like plushness with minimalist gold accents and motorized recline.",
    status: "active",
  },
  {
    sku: "ETP-SPA-04",
    slug: "eternity-signature-series-limited-edition",
    name: "Eternity Signature Series (Limited Edition)",
    category_slug: "manicure-pedicure-spa-furniture",
    price_npr: 140000,
    compare_at_npr: 145000,
    image_url: "/products/spa_chair_signature.jpg",
    description: "Pinnacle of salon luxury. Hand-stitched detailing, ultra-premium memory foam, and state-of-the-art spa technology.",
    status: "active",
  },
];

async function restorePremiumProducts() {
  console.log("🚨 Starting Critical Incident Data Recovery - Restore Premium Products...");
  const url = getClientUrl();
  const authToken = process.env.TURSO_AUTH_TOKEN;

  const client = createClient({ url, authToken });

  try {
    await client.execute(`PRAGMA foreign_keys = OFF;`);

    // Task 1: Restore 3 Luxury Chairs into category_slug = 'luxury-chairs'
    console.log("🪑 Restoring 3 Luxury Chairs into category_slug: luxury-chairs...");
    for (const item of REAL_LUXURY_CHAIRS) {
      const prodId = `prod-${item.sku.toLowerCase()}`;
      const pricePaisa = Math.round(item.price_npr * 100);
      const compareAtPaisa = Math.round(item.compare_at_npr * 100);
      const costPaisa = Math.round(pricePaisa * 0.65);

      await client.execute({
        sql: `
          INSERT OR REPLACE INTO products (
            id, sku, slug, name, description, category_id, line, 
            price_npr, compare_at_npr, cost_npr, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, 'cat-chairs', 'profit', ?, ?, ?, 'active', datetime('now'), datetime('now'));
        `,
        args: [prodId, item.sku, item.slug, item.name, item.description, pricePaisa, compareAtPaisa, costPaisa],
      });

      await client.execute({
        sql: `INSERT OR REPLACE INTO product_images (id, product_id, url, alt, is_primary) VALUES (?, ?, ?, ?, 1);`,
        args: [`img-${prodId}`, prodId, item.image_url, `${item.name} - Luxury Salon Chair`],
      });

      await client.execute({
        sql: `INSERT OR REPLACE INTO inventory (id, product_id, warehouse_id, qty_on_hand) VALUES (?, ?, 'wh-main', 5);`,
        args: [`inv-${prodId}`, prodId],
      });

      console.log(`  ✓ Restored Chair: ${item.name} (${item.sku}) - NPR ${item.price_npr.toLocaleString()}`);
    }

    // Task 2: Restore 4 Spa Furniture Items into category_slug = 'manicure-pedicure-spa-furniture'
    console.log("🛁 Restoring 4 Spa Stations into category_slug: manicure-pedicure-spa-furniture...");
    for (const item of REAL_SPA_FURNITURE) {
      const prodId = `prod-${item.sku.toLowerCase()}`;
      const pricePaisa = Math.round(item.price_npr * 100);
      const compareAtPaisa = Math.round(item.compare_at_npr * 100);
      const costPaisa = Math.round(pricePaisa * 0.65);

      await client.execute({
        sql: `
          INSERT OR REPLACE INTO products (
            id, sku, slug, name, description, category_id, line, 
            price_npr, compare_at_npr, cost_npr, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, 'cat-spa', 'profit', ?, ?, ?, 'active', datetime('now'), datetime('now'));
        `,
        args: [prodId, item.sku, item.slug, item.name, item.description, pricePaisa, compareAtPaisa, costPaisa],
      });

      await client.execute({
        sql: `INSERT OR REPLACE INTO product_images (id, product_id, url, alt, is_primary) VALUES (?, ?, ?, ?, 1);`,
        args: [`img-${prodId}`, prodId, item.image_url, `${item.name} - Manicure and Pedicure Spa Furniture`],
      });

      await client.execute({
        sql: `INSERT OR REPLACE INTO inventory (id, product_id, warehouse_id, qty_on_hand) VALUES (?, ?, 'wh-main', 5);`,
        args: [`inv-${prodId}`, prodId],
      });

      console.log(`  ✓ Restored Spa Item: ${item.name} (${item.sku}) - NPR ${item.price_npr.toLocaleString()}`);
    }

    await client.execute(`PRAGMA foreign_keys = ON;`);

    // Task 3: Post-Restoration Audit & Category Grouping Verification
    console.log("\n=======================================================");
    console.log("📊 POST-RESTORATION CATEGORY VERIFICATION AUDIT");
    console.log("=======================================================");

    const auditResult = await client.execute(`
      SELECT 
        c.slug AS category_slug,
        c.name AS category_name,
        COUNT(p.id) AS product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.slug, c.name
      ORDER BY c.sort_order ASC;
    `);

    for (const row of auditResult.rows) {
      console.log(`📁 Category: "${row.category_name}" (slug: /c/${row.category_slug}) -> ${row.product_count} products`);
    }

    const totalRes = await client.execute(`SELECT count(*) as total FROM products;`);
    console.log(`\n🎉 Restoration & Audit Complete! Total Active Products in DB: ${totalRes.rows[0].total}`);
  } catch (error) {
    console.error("❌ Error during restoration:", error);
    process.exit(1);
  }
}

restorePremiumProducts();
