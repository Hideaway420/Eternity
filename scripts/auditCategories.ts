import { createClient } from "@libsql/client";
import path from "path";

const APPROVED_CATEGORIES = [
  "spa",
  "manicure-pedicure-spa-furniture",
  "luxury-salon-chairs",
  "luxury-chairs",
  "hair-straighteners",
  "straighteners",
  "hair-dryers",
  "dryers",
  "hair-dryers-curlers",
  "curlers",
  "crimpers",
  "grooming",
  "salon-tools",
  "brushes-combs",
  "accessories",
  "multi-stylers",
  "salon-furniture",
  "salon-furniture-equipment",
];

function getClientUrl() {
  if (process.env.TURSO_DATABASE_URL) {
    return process.env.TURSO_DATABASE_URL;
  }
  return `file:${path.join(process.cwd(), "eternity.db")}`;
}

async function auditCategories() {
  console.log("🔍 Running Database Category Integrity Audit...");
  const url = getClientUrl();
  const authToken = process.env.TURSO_AUTH_TOKEN;

  const client = createClient({ url, authToken });

  try {
    // 1. Fetch all products with joined category info
    const result = await client.execute(`
      SELECT 
        p.id AS product_id,
        p.sku,
        p.slug AS product_slug,
        p.name AS product_name,
        p.status,
        c.id AS category_id,
        c.name AS category_name,
        c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id;
    `);

    const products = result.rows;
    console.log(`📊 Total Products Found in Database: ${products.length}`);

    const orphanedProducts: typeof products = [];
    const invalidCategoryProducts: typeof products = [];
    const validProductsPerCategory: Record<string, typeof products> = {};

    for (const prod of products) {
      const catSlug = prod.category_slug as string | null;

      if (!prod.category_id || !catSlug) {
        orphanedProducts.push(prod);
      } else if (!APPROVED_CATEGORIES.includes(catSlug)) {
        invalidCategoryProducts.push(prod);
      } else {
        if (!validProductsPerCategory[catSlug]) {
          validProductsPerCategory[catSlug] = [];
        }
        validProductsPerCategory[catSlug].push(prod);
      }
    }

    // 2. Audit Report Summary
    console.log("\n=======================================================");
    console.log("📌 APPROVED CATEGORIES AUDIT BREAKDOWN");
    console.log("=======================================================");
    
    for (const [slug, prods] of Object.entries(validProductsPerCategory)) {
      console.log(`📁 Category Slug: "${slug}" -> ${prods.length} active products`);
    }

    console.log("\n=======================================================");
    console.log("⚠️ ORPHANED & UNASSIGNED PRODUCTS AUDIT");
    console.log("=======================================================");
    if (orphanedProducts.length === 0) {
      console.log("✅ Zero orphaned products found! All products have valid category_id references.");
    } else {
      console.warn(`🚨 FOUND ${orphanedProducts.length} ORPHANED PRODUCTS:`);
      for (const p of orphanedProducts) {
        console.warn(`  - ID: ${p.product_id} | SKU: ${p.sku} | Name: ${p.product_name}`);
      }
    }

    console.log("\n=======================================================");
    console.log("⚠️ UNAPPROVED / INVALID CATEGORY SLUGS AUDIT");
    console.log("=======================================================");
    if (invalidCategoryProducts.length === 0) {
      console.log("✅ Zero unapproved category slugs found! All category slugs match the platform schema.");
    } else {
      console.warn(`🚨 FOUND ${invalidCategoryProducts.length} PRODUCTS WITH UNAPPROVED CATEGORY SLUGS:`);
      for (const p of invalidCategoryProducts) {
        console.warn(`  - SKU: ${p.sku} | Name: ${p.product_name} | Slug: ${p.category_slug}`);
      }
    }

    console.log("\n🎉 Database Category Integrity Audit Complete!");
  } catch (error) {
    console.error("❌ Error running category integrity audit:", error);
    process.exit(1);
  }
}

auditCategories();
