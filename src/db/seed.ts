import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { db, initTables } from "./index";
import {
  brands,
  categories,
  products,
  productImages,
  warehouses,
  inventory,
  staff,
  priceTiers,
  suppliers,
} from "./schema";

// Official Ikonic World CDN Image Registry
const OFFICIAL_IKONIC_IMAGES: Record<string, string> = {
  // Barber Chairs & Equipment
  "ETP-005": "https://www.ikonicworld.com/cdn/shop/files/Felix-IK-8781_1.jpg",
  "ETP-002": "https://www.ikonicworld.com/cdn/shop/files/IK-3818ELECTRICALBEDBLACK_CHALET.jpg",
  "ETP-009": "https://www.ikonicworld.com/cdn/shop/files/IK-1254_Ikonic.jpg",
  "ETP-001": "/products/ikonic_barber_chair_1786231855404.jpg",
  "ETP-006": "/products/barber_chair_red_1786231921780.jpg",
  "ETP-007": "/products/barber_chair_brown_1786231912699.jpg",
  
  // Straighteners
  "ETP-066": "https://www.ikonicworld.com/cdn/shop/files/8904231015937_1_702816a3-41c8-4c88-92b3-ab4c7779920f.jpg",
  "ETP-067": "/products/ikonic_straightener_1786231866243.jpg",
  "ETP-072": "https://www.ikonicworld.com/cdn/shop/files/8904231015937_1_702816a3-41c8-4c88-92b3-ab4c7779920f.jpg",
  
  // Hair Dryers
  "ETP-089": "https://www.ikonicworld.com/cdn/shop/files/8904231093140_1_6594bc6f-a625-47f5-863b-04f017f8c9a8.jpg",
  "ETP-095": "/products/ikonic_blow_dryer_1786231888743.jpg",
};

export async function runSeed() {
  console.log("🚀 Initializing database tables...");
  await initTables();

  const csvPath = path.join(process.cwd(), "data", "products_seed.csv");
  if (!fs.existsSync(csvPath)) {
    console.error("❌ Seed CSV file not found at:", csvPath);
    return;
  }

  const csvContent = fs.readFileSync(csvPath, "utf-8");
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  console.log(`📦 Found ${records.length} product rows in CSV seed.`);

  const now = new Date().toISOString();

  // 1. Seed Main Brand: Ikonic
  const ikonicBrandId = "brand-ikonic";
  await db.insert(brands)
    .values({
      id: ikonicBrandId,
      name: "Ikonic",
      slug: "ikonic",
      logo_url: "https://www.ikonicworld.com/cdn/shop/files/Ikonic_Logo.png",
      country_of_origin: "India",
    })
    .onConflictDoNothing();

  // 2. Seed Default Warehouse
  const defaultWhId = "wh-main";
  await db.insert(warehouses)
    .values({
      id: defaultWhId,
      name: "Kathmandu Central Warehouse",
      type: "warehouse",
      address: "New Road, Kathmandu",
      district: "Kathmandu",
      is_default: true,
      active: true,
    })
    .onConflictDoNothing();

  // 3. Seed Default Supplier
  const supplierId = "sup-ikonic-india";
  await db.insert(suppliers)
    .values({
      id: supplierId,
      name: "Ikonic World India",
      country: "India",
      contact: "orders@ikonicworld.com",
      currency: "INR",
      lead_time_days: 14,
      requires_coo: true,
    })
    .onConflictDoNothing();

  // 4. Seed Staff Members
  await db.insert(staff)
    .values([
      { id: "staff-owner", name: "Eternity Admin Owner", role: "owner", active: true },
      { id: "staff-manager", name: "Store Manager", role: "manager", active: true },
      { id: "staff-sales", name: "Sales Agent", role: "sales", active: true },
      { id: "staff-wh", name: "Warehouse Supervisor", role: "warehouse", active: true },
    ])
    .onConflictDoNothing();

  // 5. Seed Price Tiers Defaults
  await db.insert(priceTiers)
    .values([
      { id: "pt-silver-def", tier: "silver", discount_pct: 10 },
      { id: "pt-gold-def", tier: "gold", discount_pct: 15 },
      { id: "pt-platinum-def", tier: "platinum", discount_pct: 25 },
    ])
    .onConflictDoNothing();

  // Map to collect distinct categories
  const categoryMap = new Map<string, string>(); // categoryName -> categoryId

  for (const row of records) {
    const catName = row.category || "General Styling";
    if (!categoryMap.has(catName)) {
      const catSlug = catName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const catId = `cat-${catSlug}`;
      categoryMap.set(catName, catId);

      await db.insert(categories)
        .values({
          id: catId,
          name: catName,
          slug: catSlug,
          sort_order: categoryMap.size,
        })
        .onConflictDoNothing();
    }
  }

  // 6. Seed Products and Inventory
  let insertedCount = 0;

  for (const row of records) {
    const sku = row.sku;
    const slug = row.slug;
    const priceNprFloat = parseFloat(row.price_npr || "0");
    const costNprFloat = parseFloat(row.cost_npr || "0");
    const darazPriceFloat = row.daraz_price_npr ? parseFloat(row.daraz_price_npr) : null;
    const confidence = row.price_confidence;

    const status = confidence === "LIKELY-MATCH" ? "draft" : "active";
    const line = (row.line || "Traffic").toLowerCase() === "profit" ? "profit" : "traffic";
    const isB2bOnly = row.b2b_only === "true" || row.b2b_only === "TRUE" || row.b2b_only === "1";
    const catId = categoryMap.get(row.category || "General Styling") || null;

    const productId = `prod-${sku.toLowerCase()}`;

    const specsObj = {
      brand: row.brand,
      target_persona: row.target_persona,
      content_angle: row.content_angle,
      source_url: row.source_url,
      confidence_tag: confidence,
    };

    await db.insert(products)
      .values({
        id: productId,
        sku: sku,
        slug: slug,
        name: row.name,
        description: `${row.name} - Professional hair styling & salon equipment distributed by Eternity Products Nepal. Guaranteed authentic imported directly from Ikonic India.`,
        brand_id: ikonicBrandId,
        category_id: catId,
        line: line,
        business_model: row.business_model || "BOTH",
        price_npr: Math.round(priceNprFloat * 100),
        compare_at_npr: darazPriceFloat ? Math.round(darazPriceFloat * 100) : null,
        cost_npr: Math.round(costNprFloat * 100),
        b2b_only: isB2bOnly,
        warranty_months: 12,
        specs: JSON.stringify(specsObj),
        authenticity_note: "Direct import from Ikonic India. Includes serial number, holographic box seal & 1-year Eternity Products warranty card.",
        status: status,
        created_at: now,
        updated_at: now,
      })
      .onConflictDoNothing();

    // Map official or generated image for each product
    let imgUrl = OFFICIAL_IKONIC_IMAGES[sku];
    if (!imgUrl) {
      if (line === "profit") {
        imgUrl = "/products/ikonic_barber_chair_1786231855404.jpg";
      } else if (row.category?.toLowerCase().includes("dryer")) {
        imgUrl = "/products/ikonic_blow_dryer_1786231888743.jpg";
      } else {
        imgUrl = "/products/ikonic_straightener_1786231866243.jpg";
      }
    }

    await db.insert(productImages)
      .values({
        id: `img-${productId}`,
        product_id: productId,
        url: imgUrl,
        alt: row.name,
        is_primary: true,
      })
      .onConflictDoNothing();

    const stockPriority = parseInt(row.stock_priority || "2");
    const initialQty = stockPriority === 1 ? 2 : 15;

    await db.insert(inventory)
      .values({
        id: `inv-${productId}`,
        product_id: productId,
        warehouse_id: defaultWhId,
        qty_on_hand: initialQty,
        qty_reserved: 0,
        qty_incoming: 0,
        reorder_point: stockPriority === 1 ? 1 : 5,
        safety_stock: stockPriority === 1 ? 0 : 2,
      })
      .onConflictDoNothing();

    insertedCount++;
  }

  console.log(`✅ Successfully seeded ${insertedCount} products into Eternity Products database with official Ikonic image URLs.`);
}

if (require.main === module) {
  runSeed().catch((err) => {
    console.error("❌ Error running seed:", err);
    process.exit(1);
  });
}
