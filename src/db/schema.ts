import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const brands = sqliteTable("brands", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logo_url: text("logo_url"),
  country_of_origin: text("country_of_origin").default("India"),
});

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  name_np: text("name_np"),
  slug: text("slug").notNull().unique(),
  parent_id: text("parent_id"),
  sort_order: integer("sort_order").default(0),
  image_url: text("image_url"),
});

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  sku: text("sku").notNull().unique(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  name_np: text("name_np"),
  description: text("description"),
  description_np: text("description_np"),
  brand_id: text("brand_id").references(() => brands.id),
  category_id: text("category_id").references(() => categories.id),
  line: text("line").notNull().default("traffic"), // 'traffic' | 'profit'
  business_model: text("business_model").notNull().default("BOTH"), // 'D2C' | 'B2B' | 'BOTH'
  price_npr: integer("price_npr").notNull(), // Integer paisa (NPR * 100)
  compare_at_npr: integer("compare_at_npr"), // Integer paisa (Daraz anchor)
  cost_npr: integer("cost_npr"), // CONFIDENTIAL integer paisa
  b2b_only: integer("b2b_only", { mode: "boolean" }).default(false),
  warranty_months: integer("warranty_months").default(12),
  hs_code: text("hs_code"),
  specs: text("specs"), // JSON string
  authenticity_note: text("authenticity_note"),
  status: text("status").notNull().default("active"), // 'draft' | 'active' | 'archived'
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

export const productImages = sqliteTable("product_images", {
  id: text("id").primaryKey(),
  product_id: text("product_id").notNull().references(() => products.id),
  url: text("url").notNull(),
  alt: text("alt"),
  alt_np: text("alt_np"),
  sort_order: integer("sort_order").default(0),
  is_primary: integer("is_primary", { mode: "boolean" }).default(false),
});

export const productVariants = sqliteTable("product_variants", {
  id: text("id").primaryKey(),
  product_id: text("product_id").notNull().references(() => products.id),
  sku: text("sku").notNull(),
  name: text("name").notNull(),
  price_delta_npr: integer("price_delta_npr").default(0),
  barcode: text("barcode"),
});

export const warehouses = sqliteTable("warehouses", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull().default("warehouse"), // 'shop' | 'warehouse' | 'consignment'
  address: text("address"),
  district: text("district").default("Kathmandu"),
  is_default: integer("is_default", { mode: "boolean" }).default(false),
  active: integer("active", { mode: "boolean" }).default(true),
});

export const inventory = sqliteTable("inventory", {
  id: text("id").primaryKey(),
  product_id: text("product_id").notNull().references(() => products.id),
  variant_id: text("variant_id"),
  warehouse_id: text("warehouse_id").notNull().references(() => warehouses.id),
  qty_on_hand: integer("qty_on_hand").notNull().default(0),
  qty_reserved: integer("qty_reserved").notNull().default(0),
  qty_incoming: integer("qty_incoming").notNull().default(0),
  reorder_point: integer("reorder_point").default(5),
  safety_stock: integer("safety_stock").default(2),
  bin_location: text("bin_location"),
});

export const stockMovements = sqliteTable("stock_movements", {
  id: text("id").primaryKey(),
  product_id: text("product_id").notNull().references(() => products.id),
  variant_id: text("variant_id"),
  warehouse_id: text("warehouse_id").notNull().references(() => warehouses.id),
  type: text("type").notNull(), // 'receipt' | 'sale' | 'return' | 'transfer' | 'adjustment' | 'damage'
  qty_delta: integer("qty_delta").notNull(), // Signed (+ / -)
  ref_type: text("ref_type"),
  ref_id: text("ref_id"),
  unit_cost_npr: integer("unit_cost_npr"),
  reason: text("reason"),
  created_by: text("created_by"),
  created_at: text("created_at").notNull(),
});

export const suppliers = sqliteTable("suppliers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  country: text("country").default("India"),
  contact: text("contact"),
  currency: text("currency").default("INR"),
  lead_time_days: integer("lead_time_days").default(14),
  requires_coo: integer("requires_coo", { mode: "boolean" }).default(true),
});

export const purchaseOrders = sqliteTable("purchase_orders", {
  id: text("id").primaryKey(),
  po_number: text("po_number").notNull().unique(),
  supplier_id: text("supplier_id").notNull().references(() => suppliers.id),
  warehouse_id: text("warehouse_id").notNull().references(() => warehouses.id),
  status: text("status").notNull().default("draft"), // 'draft'|'ordered'|'in_transit'|'customs'|'received'|'cancelled'
  currency: text("currency").default("INR"),
  fx_rate: integer("fx_rate").default(160), // Paisa / INR * 100 -> 1.60
  subtotal_foreign: integer("subtotal_foreign").notNull(),
  freight_npr: integer("freight_npr").default(0),
  duty_npr: integer("duty_npr").default(0),
  vat_npr: integer("vat_npr").default(0),
  clearing_npr: integer("clearing_npr").default(0),
  inland_npr: integer("inland_npr").default(0),
  coo_received: integer("coo_received", { mode: "boolean" }).default(false),
  expected_at: text("expected_at"),
  received_at: text("received_at"),
  notes: text("notes"),
});

export const poLines = sqliteTable("po_lines", {
  id: text("id").primaryKey(),
  po_id: text("po_id").notNull().references(() => purchaseOrders.id),
  product_id: text("product_id").notNull().references(() => products.id),
  variant_id: text("variant_id"),
  qty_ordered: integer("qty_ordered").notNull(),
  qty_received: integer("qty_received").default(0),
  unit_cost_foreign: integer("unit_cost_foreign").notNull(),
  landed_unit_cost_npr: integer("landed_unit_cost_npr"),
});

export const customers = sqliteTable("customers", {
  id: text("id").primaryKey(),
  auth_user_id: text("auth_user_id"),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  email: text("email"),
  type: text("type").notNull().default("retail"), // 'retail' | 'salon'
  created_at: text("created_at").notNull(),
});

export const addresses = sqliteTable("addresses", {
  id: text("id").primaryKey(),
  customer_id: text("customer_id").notNull().references(() => customers.id),
  label: text("label").default("Home"),
  recipient: text("recipient").notNull(),
  phone: text("phone").notNull(),
  district: text("district").notNull(),
  city: text("city").notNull(),
  area: text("area"),
  landmark: text("landmark"),
  inside_valley: integer("inside_valley", { mode: "boolean" }).notNull(),
  is_default: integer("is_default", { mode: "boolean" }).default(false),
});

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  order_number: text("order_number").notNull().unique(),
  customer_id: text("customer_id").references(() => customers.id),
  status: text("status").notNull().default("pending"), // 'pending'|'confirmed'|'packed'|'dispatched'|'delivered'|'cancelled'|'returned'
  payment_method: text("payment_method").notNull().default("cod"), // 'cod'|'esewa'|'khalti'|'fonepay'|'bank'
  payment_status: text("payment_status").notNull().default("unpaid"), // 'unpaid'|'paid'|'refunded'
  subtotal_npr: integer("subtotal_npr").notNull(),
  discount_npr: integer("discount_npr").default(0),
  delivery_npr: integer("delivery_npr").default(0),
  vat_npr: integer("vat_npr").default(0),
  total_npr: integer("total_npr").notNull(),
  address_snapshot: text("address_snapshot"), // JSON
  cod_confirmed_at: text("cod_confirmed_at"),
  cod_confirmed_by: text("cod_confirmed_by"),
  courier: text("courier"),
  tracking_number: text("tracking_number"),
  placed_at: text("placed_at").notNull(),
  dispatched_at: text("dispatched_at"),
  delivered_at: text("delivered_at"),
  cancelled_at: text("cancelled_at"),
  notes: text("notes"),
});

export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey(),
  order_id: text("order_id").notNull().references(() => orders.id),
  product_id: text("product_id").notNull().references(() => products.id),
  variant_id: text("variant_id"),
  name_snapshot: text("name_snapshot").notNull(),
  sku_snapshot: text("sku_snapshot").notNull(),
  qty: integer("qty").notNull(),
  unit_price_npr: integer("unit_price_npr").notNull(),
  unit_cost_npr: integer("unit_cost_npr"),
  line_total_npr: integer("line_total_npr").notNull(),
});

export const payments = sqliteTable("payments", {
  id: text("id").primaryKey(),
  order_id: text("order_id").notNull().references(() => orders.id),
  method: text("method").notNull(), // 'cod'|'esewa'|'khalti'|'fonepay'|'bank'
  amount_npr: integer("amount_npr").notNull(),
  gateway_ref: text("gateway_ref"),
  status: text("status").notNull().default("pending"),
  received_at: text("received_at"),
});

export const salonAccounts = sqliteTable("salon_accounts", {
  id: text("id").primaryKey(),
  customer_id: text("customer_id").notNull().references(() => customers.id),
  salon_name: text("salon_name").notNull(),
  owner_name: text("owner_name").notNull(),
  district: text("district").notNull(),
  area: text("area"),
  chair_count: integer("chair_count").default(1),
  tier: text("tier").notNull().default("registered"), // 'registered'|'silver'|'gold'|'platinum'
  credit_limit_npr: integer("credit_limit_npr").default(0),
  credit_days: integer("credit_days").default(0),
  first_order_at: text("first_order_at"),
  last_order_at: text("last_order_at"),
  lifetime_npr: integer("lifetime_npr").default(0),
  avg_days_between_orders: integer("avg_days_between_orders"),
  next_nudge_at: text("next_nudge_at"),
  broadcast_opt_in: integer("broadcast_opt_in", { mode: "boolean" }).default(true),
  viber_number: text("viber_number"),
  notes: text("notes"),
});

export const priceTiers = sqliteTable("price_tiers", {
  id: text("id").primaryKey(),
  tier: text("tier").notNull(), // 'silver' | 'gold' | 'platinum'
  category_id: text("category_id"),
  product_id: text("product_id"),
  discount_pct: integer("discount_pct").notNull(), // e.g. 15 for 15%
});

export const quoteRequests = sqliteTable("quote_requests", {
  id: text("id").primaryKey(),
  salon_account_id: text("salon_account_id").references(() => salonAccounts.id),
  status: text("status").notNull().default("pending"), // 'pending' | 'quoted' | 'won' | 'lost'
  items: text("items").notNull(), // JSON
  message: text("message"),
  quoted_total_npr: integer("quoted_total_npr"),
  quoted_by: text("quoted_by"),
  quoted_at: text("quoted_at"),
  expires_at: text("expires_at"),
});

export const broadcasts = sqliteTable("broadcasts", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  body_np: text("body_np"),
  channel: text("channel").notNull().default("viber"), // 'viber'|'sms'|'email'|'in_app'
  audience: text("audience").notNull().default("all"), // 'all'|'tier'|'segment'
  audience_filter: text("audience_filter"), // JSON
  product_ids: text("product_ids"), // JSON array of UUIDs
  scheduled_at: text("scheduled_at"),
  sent_at: text("sent_at"),
  sent_count: integer("sent_count").default(0),
  created_by: text("created_by"),
});

export const staff = sqliteTable("staff", {
  id: text("id").primaryKey(),
  auth_user_id: text("auth_user_id"),
  name: text("name").notNull(),
  role: text("role").notNull().default("sales"), // 'owner'|'manager'|'sales'|'warehouse'|'support'
  active: integer("active", { mode: "boolean" }).default(true),
});
