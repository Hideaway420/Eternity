import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
import path from "path";

const url = process.env.TURSO_DATABASE_URL || `file:${path.join(process.cwd(), "eternity.db")}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({
  url,
  authToken,
});

export const db = drizzle(client, { schema });

export async function initTables() {
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

    CREATE TABLE IF NOT EXISTS product_variants (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id),
      sku TEXT NOT NULL,
      name TEXT NOT NULL,
      price_delta_npr INTEGER DEFAULT 0,
      barcode TEXT
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

    CREATE TABLE IF NOT EXISTS stock_movements (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id),
      variant_id TEXT,
      warehouse_id TEXT NOT NULL REFERENCES warehouses(id),
      type TEXT NOT NULL,
      qty_delta INTEGER NOT NULL,
      ref_type TEXT,
      ref_id TEXT,
      unit_cost_npr INTEGER,
      reason TEXT,
      created_by TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      country TEXT DEFAULT 'India',
      contact TEXT,
      currency TEXT DEFAULT 'INR',
      lead_time_days INTEGER DEFAULT 14,
      requires_coo INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS purchase_orders (
      id TEXT PRIMARY KEY,
      po_number TEXT NOT NULL UNIQUE,
      supplier_id TEXT NOT NULL REFERENCES suppliers(id),
      warehouse_id TEXT NOT NULL REFERENCES warehouses(id),
      status TEXT NOT NULL DEFAULT 'draft',
      currency TEXT DEFAULT 'INR',
      fx_rate INTEGER DEFAULT 160,
      subtotal_foreign INTEGER NOT NULL,
      freight_npr INTEGER DEFAULT 0,
      duty_npr INTEGER DEFAULT 0,
      vat_npr INTEGER DEFAULT 0,
      clearing_npr INTEGER DEFAULT 0,
      inland_npr INTEGER DEFAULT 0,
      coo_received INTEGER DEFAULT 0,
      expected_at TEXT,
      received_at TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS po_lines (
      id TEXT PRIMARY KEY,
      po_id TEXT NOT NULL REFERENCES purchase_orders(id),
      product_id TEXT NOT NULL REFERENCES products(id),
      variant_id TEXT,
      qty_ordered INTEGER NOT NULL,
      qty_received INTEGER DEFAULT 0,
      unit_cost_foreign INTEGER NOT NULL,
      landed_unit_cost_npr INTEGER
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      auth_user_id TEXT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      email TEXT,
      type TEXT NOT NULL DEFAULT 'retail',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS addresses (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL REFERENCES customers(id),
      label TEXT DEFAULT 'Home',
      recipient TEXT NOT NULL,
      phone TEXT NOT NULL,
      district TEXT NOT NULL,
      city TEXT NOT NULL,
      area TEXT,
      landmark TEXT,
      inside_valley INTEGER NOT NULL,
      is_default INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT NOT NULL UNIQUE,
      customer_id TEXT REFERENCES customers(id),
      status TEXT NOT NULL DEFAULT 'pending',
      payment_method TEXT NOT NULL DEFAULT 'cod',
      payment_status TEXT NOT NULL DEFAULT 'unpaid',
      subtotal_npr INTEGER NOT NULL,
      discount_npr INTEGER DEFAULT 0,
      delivery_npr INTEGER DEFAULT 0,
      vat_npr INTEGER DEFAULT 0,
      total_npr INTEGER NOT NULL,
      address_snapshot TEXT,
      cod_confirmed_at TEXT,
      cod_confirmed_by TEXT,
      courier TEXT,
      tracking_number TEXT,
      placed_at TEXT NOT NULL,
      dispatched_at TEXT,
      delivered_at TEXT,
      cancelled_at TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id),
      product_id TEXT NOT NULL REFERENCES products(id),
      variant_id TEXT,
      name_snapshot TEXT NOT NULL,
      sku_snapshot TEXT NOT NULL,
      qty INTEGER NOT NULL,
      unit_price_npr INTEGER NOT NULL,
      unit_cost_npr INTEGER,
      line_total_npr INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id),
      method TEXT NOT NULL,
      amount_npr INTEGER NOT NULL,
      gateway_ref TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      received_at TEXT
    );

    CREATE TABLE IF NOT EXISTS salon_accounts (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL REFERENCES customers(id),
      salon_name TEXT NOT NULL,
      owner_name TEXT NOT NULL,
      district TEXT NOT NULL,
      area TEXT,
      chair_count INTEGER DEFAULT 1,
      tier TEXT NOT NULL DEFAULT 'registered',
      credit_limit_npr INTEGER DEFAULT 0,
      credit_days INTEGER DEFAULT 0,
      first_order_at TEXT,
      last_order_at TEXT,
      lifetime_npr INTEGER DEFAULT 0,
      avg_days_between_orders INTEGER,
      next_nudge_at TEXT,
      broadcast_opt_in INTEGER DEFAULT 1,
      viber_number TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS price_tiers (
      id TEXT PRIMARY KEY,
      tier TEXT NOT NULL,
      category_id TEXT,
      product_id TEXT,
      discount_pct INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quote_requests (
      id TEXT PRIMARY KEY,
      salon_account_id TEXT REFERENCES salon_accounts(id),
      status TEXT NOT NULL DEFAULT 'pending',
      items TEXT NOT NULL,
      message TEXT,
      quoted_total_npr INTEGER,
      quoted_by TEXT,
      quoted_at TEXT,
      expires_at TEXT
    );

    CREATE TABLE IF NOT EXISTS broadcasts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      body_np TEXT,
      channel TEXT NOT NULL DEFAULT 'viber',
      audience TEXT NOT NULL DEFAULT 'all',
      audience_filter TEXT,
      product_ids TEXT,
      scheduled_at TEXT,
      sent_at TEXT,
      sent_count INTEGER DEFAULT 0,
      created_by TEXT
    );

    CREATE TABLE IF NOT EXISTS staff (
      id TEXT PRIMARY KEY,
      auth_user_id TEXT,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'sales',
      active INTEGER DEFAULT 1
    );
  `);
}
