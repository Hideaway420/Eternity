# Build Prompt — Eternity Products Commerce & Inventory Platform

**Give this entire file to Gemini Antigravity as the build specification.**
It is self-contained. Real seed data is in `data/products_seed.csv`.

---

## 0. What you are building

An ecommerce and inventory platform for **Eternity Products**, a Nepal-based importer and distributor of professional hair styling tools, cosmetics and salon equipment (brand: Ikonic, imported from India).

The business has **two distinct customer types that must both be first-class**, not one bolted onto the other:

1. **D2C retail** — consumers buying styling tools. High volume, thin margin (25–30%), mostly cash on delivery.
2. **B2B salon accounts** — beauty parlours buying tools in bulk and salon furniture/equipment in single high-value units (~50% margin). There is an **existing base of parlour customers already buying regularly** — the platform must serve them as a community, not treat them as leads.

Later phases extend into multi-warehouse inventory and distribution.

### Non-negotiable context

- **Currency is NPR only.** Format as `NPR 12,920` or `रु 12,920`. Never use `$`.
- **Cash on delivery is the primary payment method.** Any checkout that treats COD as a fallback is wrong.
- **Stripe and PayPal cannot receive money in Nepal.** Do not integrate them. Use **eSewa**, **Khalti**, **Fonepay**, bank transfer and COD.
- **Delivery pricing differs inside vs outside Kathmandu valley.** This is a core pricing dimension, not an edge case.
- **VAT is 13%.** Prices are displayed VAT-inclusive to consumers; B2B invoices must show VAT as a separate line.
- **Cost and margin data is confidential.** It must never reach a non-owner role or any public API response.

---

## 1. Stack

```
Next.js 15          App Router, Server Components, Server Actions
TypeScript          strict mode
Supabase            Postgres + Auth + Storage + Row Level Security
Drizzle ORM         schema as code, typed queries, migrations
Tailwind CSS        + shadcn/ui components
Zod                 validation at every trust boundary
Vercel              hosting
```

Use Server Actions for mutations. Do not build a separate REST layer unless a mobile client needs it later.

---

## 2. Data model

Write this as Drizzle schema. All money columns are **integers in paisa** (NPR × 100) — never floats. All timestamps `timestamptz`.

### Catalogue

```
brands            id, name, slug, logo_url, country_of_origin
categories        id, name, name_np, slug, parent_id, sort_order, image_url
products          id, sku, slug (unique), name, name_np, description, description_np,
                  brand_id, category_id,
                  line ('traffic' | 'profit'),        -- drives merchandising + B2B gating
                  business_model ('D2C'|'B2B'|'BOTH'),
                  price_npr,                          -- selling price, VAT inclusive
                  compare_at_npr,                     -- Daraz anchor, shown struck through
                  cost_npr,                           -- CONFIDENTIAL, never in public queries
                  b2b_only boolean,
                  warranty_months, hs_code,
                  specs jsonb,                        -- {plates, wattage, temp_range, ...}
                  authenticity_note,
                  status ('draft'|'active'|'archived'),
                  created_at, updated_at
product_images    id, product_id, url, alt, alt_np, sort_order, is_primary
product_variants  id, product_id, sku, name (colour/size), price_delta_npr, barcode
```

### Inventory and warehouse

```
warehouses        id, name, type ('shop'|'warehouse'|'consignment'),
                  address, district, is_default, active
inventory         id, product_id, variant_id, warehouse_id,
                  qty_on_hand, qty_reserved, qty_incoming,
                  reorder_point, safety_stock, bin_location
                  UNIQUE (product_id, variant_id, warehouse_id)
stock_movements   id, product_id, variant_id, warehouse_id,
                  type ('receipt'|'sale'|'return'|'transfer'|'adjustment'|'damage'),
                  qty_delta,                          -- signed
                  ref_type, ref_id,                   -- order / PO / transfer
                  unit_cost_npr, reason, created_by, created_at
suppliers         id, name, country, contact, currency, lead_time_days,
                  requires_coo boolean                -- SAFTA certificate of origin
purchase_orders   id, po_number, supplier_id, warehouse_id,
                  status ('draft'|'ordered'|'in_transit'|'customs'|'received'|'cancelled'),
                  currency, fx_rate,                  -- NPR per INR at order time
                  subtotal_foreign, freight_npr, duty_npr, vat_npr,
                  clearing_npr, inland_npr,
                  coo_received boolean, expected_at, received_at, notes
po_lines          id, po_id, product_id, variant_id, qty_ordered, qty_received,
                  unit_cost_foreign, landed_unit_cost_npr
goods_receipts    id, po_id, warehouse_id, received_by, received_at, notes
grn_lines         id, grn_id, po_line_id, qty_accepted, qty_rejected, reject_reason
stock_transfers   id, from_warehouse_id, to_warehouse_id, status, created_by, created_at
```

**Landed cost allocation.** When a PO is received, distribute `freight + duty + clearing + inland` across its lines **by value share**, and write the result to `po_lines.landed_unit_cost_npr`. That figure — not the supplier invoice price — is the true cost. Write one `stock_movements` row of type `receipt` per accepted line carrying that unit cost.

### Customers and orders

```
customers         id, auth_user_id, name, phone (unique, indexed), email,
                  type ('retail'|'salon'), created_at
addresses         id, customer_id, label, recipient, phone, district, city,
                  area, landmark, inside_valley boolean, is_default
orders            id, order_number, customer_id, status, payment_method,
                  payment_status, subtotal_npr, discount_npr, delivery_npr,
                  vat_npr, total_npr,
                  address_snapshot jsonb,            -- immutable copy at order time
                  cod_confirmed_at, cod_confirmed_by,
                  courier, tracking_number,
                  placed_at, dispatched_at, delivered_at, cancelled_at, notes
order_items       id, order_id, product_id, variant_id,
                  name_snapshot, sku_snapshot,       -- survive later product edits
                  qty, unit_price_npr, unit_cost_npr, line_total_npr
payments          id, order_id, method ('cod'|'esewa'|'khalti'|'fonepay'|'bank'),
                  amount_npr, gateway_ref, status, received_at
```

**Order status machine.** Enforce transitions in code — do not let arbitrary status writes through.

```
pending → confirmed → packed → dispatched → delivered
                 ↓         ↓          ↓
             cancelled  cancelled   returned
```

`pending → confirmed` requires `cod_confirmed_at` when `payment_method = 'cod'`. This is the single most important business rule in the system: the confirmation call is what controls the COD refusal rate.

Stock is **reserved** at `confirmed` (increment `qty_reserved`) and **deducted** at `dispatched` (decrement `qty_on_hand`, write a `sale` movement). A `returned` order writes a `return` movement back in.

### B2B / salon community

```
salon_accounts    id, customer_id, salon_name, owner_name, district, area,
                  chair_count, tier ('registered'|'silver'|'gold'|'platinum'),
                  credit_limit_npr, credit_days,
                  first_order_at, last_order_at, lifetime_npr,
                  avg_days_between_orders, next_nudge_at,
                  broadcast_opt_in boolean, viber_number, notes
price_tiers       id, tier, category_id (nullable), product_id (nullable),
                  discount_pct
                  -- resolution order: product > category > tier default
quote_requests    id, salon_account_id, status, items jsonb, message,
                  quoted_total_npr, quoted_by, quoted_at, expires_at
broadcasts        id, title, body, body_np, channel ('viber'|'sms'|'email'|'in_app'),
                  audience ('all'|'tier'|'segment'), audience_filter jsonb,
                  product_ids uuid[], scheduled_at, sent_at, sent_count, created_by
broadcast_receipts id, broadcast_id, salon_account_id, delivered_at, opened_at, clicked_at
```

**Tier pricing resolution.** Given a salon account and a product, resolve in order: product-specific tier row → category tier row → tier default. Compute once server-side; never let the client send a price.

### Roles

```
staff             id, auth_user_id, name,
                  role ('owner'|'manager'|'sales'|'warehouse'|'support'), active
```

| Capability | owner | manager | sales | warehouse | support |
|---|:--:|:--:|:--:|:--:|:--:|
| See cost / margin | ✅ | ✅ | ❌ | ❌ | ❌ |
| Approve discount above tier | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit products / prices | ✅ | ✅ | ❌ | ❌ | ❌ |
| Confirm COD orders | ✅ | ✅ | ✅ | ❌ | ✅ |
| Receive stock / GRN | ✅ | ✅ | ❌ | ✅ | ❌ |
| Stock adjustments | ✅ | ✅ | ❌ | ✅ | ❌ |
| Send broadcasts | ✅ | ✅ | ❌ | ❌ | ❌ |
| Extend credit terms | ✅ | ❌ | ❌ | ❌ | ❌ |

Enforce with Supabase RLS **and** in server actions. RLS alone is not enough because service-role queries bypass it.

**`cost_npr` and margin columns must never appear in a query reachable by a non-owner/manager role.** Use an explicit public product view that omits them rather than relying on `SELECT *` discipline.

---

## 3. Storefront

### Routes

```
/                          home — hero, categories, best sellers, trust strip
/c/[category]              category listing with filters
/p/[slug]                  product detail
/cart
/checkout
/order/[orderNumber]       tracking, no login required (order number + phone)
/account                   orders, addresses
/salon                     B2B landing → application form
/salon/portal              authenticated salon account area
/about, /warranty, /contact
```

### Product detail page — this is where the sale is won

Order matters. Build it in this sequence:

1. Image gallery with zoom
2. Name, brand, SKU
3. **Price block** — `NPR 12,920`, and where `compare_at_npr` exists show it struck through as the Daraz anchor, plus a "same price, better service" line
4. **Authenticity panel** — the single highest-impact element on the page. Serial number verification promise, warranty card, box seal, and an embedded proof video. Label it clearly (`असली उत्पादन` / Genuine product).
5. Stock state — "In stock" / "Only 3 left" (never fake this) / "Order on request" for furniture
6. Add to cart, plus a "Get salon price" link for `line = 'profit'` items
7. Spec table from `specs` jsonb
8. Delivery estimate by district, with inside/outside valley pricing shown before checkout
9. Warranty and returns
10. Reviews / customer results
11. Related products

For `line = 'profit'` items (salon furniture), **replace the add-to-cart with a quote request**. Nobody buys a NPR 195,000 barber chair from a cart, and the site visit is the sales process. Show payback framing: price alongside a simple "earns back in N months" calculator.

### Checkout

Single page, minimal fields. Every extra field costs orders.

```
Phone number        (primary identity in Nepal — not email)
Recipient name
District            select → sets inside_valley
City / area
Landmark            (free text; Nepali addresses depend on landmarks)
Payment method      COD (default) | eSewa | Khalti | Bank transfer
```

- Show delivery charge as soon as the district is picked, never after.
- Show a clear **"Open the box before you pay"** guarantee on COD. This is the biggest single conversion unlock in this market.
- After placing: order number, expected delivery window, and a "we will call to confirm" note.

### Language

Nepali/English toggle. Store `name_np`, `description_np`, `body_np` alongside English. Do not machine-translate at request time. Default to English; remember the choice.

---

## 4. Admin

```
/admin                      dashboard — today's orders, COD queue, low stock, pending quotes
/admin/orders               list, filter, bulk actions
/admin/orders/[id]          detail, status transitions, confirmation call log
/admin/cod-queue            THE most-used screen — see below
/admin/products             list, edit, bulk price update
/admin/inventory            stock by warehouse, adjustments, transfers
/admin/purchase-orders      PO create, receive (GRN), landed cost allocation
/admin/salons               salon accounts, tiers, purchase history
/admin/quotes               quote requests → quoted → won/lost
/admin/broadcasts           compose, schedule, send, results
/admin/reports              sales, margin (gated), stock value, COD refusal rate
```

### COD confirmation queue

Build this properly; it is used more than any other screen.

A list of `pending` orders showing: customer name, phone (click to call), items, total, district, and a prior-history flag (`new` / `repeat` / `previously refused`). Three actions: **Confirmed**, **Could not reach**, **Cancelled** with reason. Track attempt count and timestamps. Auto-cancel after N failed attempts (configurable, default 3).

Report refusal rate weekly by district and by product. When it climbs, this data tells you where.

### Reorder alerts

When `qty_on_hand - qty_reserved <= reorder_point`, raise an alert on the dashboard with a one-click "create PO" action pre-filled with the supplier and a suggested quantity.

---

## 5. Salon portal and community

```
/salon/portal               dashboard: your prices, reorder shortcuts, announcements
/salon/portal/catalogue     full catalogue at their tier price
/salon/portal/orders        history, one-click reorder
/salon/portal/quotes        equipment quotes and status
/salon/portal/statement     credit balance, due dates (gold/platinum only)
```

The salon sees **their** price, never the retail price with a discount badge — a distributor price shown as a discount invites negotiation on every order.

### Broadcast system

Compose → pick audience (all / tier / district / lapsed) → pick channel → schedule → send. Attach products so the message renders as a card with image, salon price and a "reserve" action.

Enforce two rules in the product itself:

1. **Only `broadcast_opt_in = true` accounts receive broadcasts.** No exceptions.
2. **A reorder nudge is a direct message, not a broadcast.** Build it as a separate flow triggered from `next_nudge_at`, addressed to one account, referencing their last order date and quantity. If these two get merged the list goes quiet.

Track delivery and open rates in `broadcast_receipts`.

**Channel integrations:** Viber is the priority channel in Nepal; SMS via a local gateway (Sparrow or similar) is the fallback for time-critical messages. Design the sender as an interface with per-channel adapters so a channel can be swapped without touching the calling code.

---

## 5b. Visual design

The `Design/` folder holds nine design concepts, each with a `DESIGN.md` (full colour token set, typography, spacing scale), a `code.html` reference implementation, and a `screen.png` render. They share the **Serene Opulence** system — a soft neutral palette (`primary #5e5e5c`, warm off-white surfaces `#fbf9f8`) with Material-style semantic tokens.

**Pick one concept, then follow it exactly.** Compare the `screen.png` files and choose; do not blend several.

Map the chosen `DESIGN.md` colour tokens onto Tailwind theme variables (`surface`, `surface-container`, `on-surface`, `primary`, `on-primary`, `outline`, `error`, and the rest) so shadcn/ui components inherit them rather than carrying hard-coded colours. Use `code.html` as the reference for component structure and spacing.

Two adjustments the concepts do not cover, both required:

- **Trust elements need to stand out.** The authenticity panel on the product page must not disappear into a neutral palette. Give it a distinct container treatment.
- **The B2B portal should read as a different surface from the retail storefront.** A salon owner logging in should know immediately they are seeing their trade prices, not the retail site.

---

## 6. Build order

Ship each phase before starting the next. Every phase must leave the business better off on its own.

| Phase | Scope | Done when |
|---|---|---|
| **1** | Schema, auth, seed from CSV, catalogue browse, PDP | A customer can find a product and see a real price |
| **2** | Cart, COD checkout, order confirmation, tracking | A real order comes through the site |
| **3** | Admin orders + COD confirmation queue | Orders are managed in the app, not a notebook |
| **4** | Inventory: single warehouse, stock movements, reorder alerts | Stock counts are trustworthy |
| **5** | eSewa + Khalti | Prepaid orders arrive |
| **6** | Salon accounts, tier pricing, portal, quote requests | A salon logs in and reorders at their price |
| **7** | Purchase orders, GRN, landed cost allocation | True landed cost is computed, not estimated |
| **8** | Multi-warehouse, transfers | Stock is accurate across shop and warehouse |
| **9** | Broadcast + reorder nudges | The community channel runs from the app |
| **10** | Reports, margin dashboards, COD analytics | Decisions come from data |

---

## 7. Seed data

`data/products_seed.csv` — 196 real products with sourced pricing.

| Column | Notes |
|---|---|
| `sku` | `ETP-001` … |
| `slug` | unique, URL-safe |
| `name`, `brand`, `category` | |
| `line` | `Traffic` or `Profit` → maps to `products.line` |
| `business_model` | `D2C` / `B2B` / `BOTH` |
| `price_npr` | selling price, VAT inclusive |
| `cost_npr` | **confidential** |
| `daraz_price_npr` | → `compare_at_npr` (the anchor). Blank where no listing exists |
| `india_list_inr` | supplier reference |
| `margin_pct`, `landed_est_npr` | |
| `price_confidence` | `VERIFIED` / `LIKELY-MATCH` / `NO-NEPAL-LISTING` |
| `source_url` | where the price came from |
| `target_persona`, `content_angle` | merchandising copy hints |
| `b2b_only` | `true` → quote flow instead of add-to-cart |
| `stock_priority` | 1 = furniture (order against sale), 2 = stock it |

**Import rule:** rows where `price_confidence` is `LIKELY-MATCH` or `CONFIRM-BRAND` import as `status = 'draft'`, not `active`. The price needs human confirmation before it goes live. Rows marked `NO-NEPAL-LISTING` are fine to activate — that tag means no competitor listing exists, not that the price is unknown.

---

## 8. Rules that are easy to get wrong

1. **Money is integer paisa.** Floating-point money produces rounding drift that shows up as one-rupee discrepancies in reports.
2. **Snapshot names, SKUs and prices onto orders.** Editing a product must never rewrite history.
3. **Never trust a client-sent price.** Recompute every price server-side from the product and the customer's tier.
4. **`cost_npr` never leaves the server for a non-owner/manager.** Use an explicit public projection.
5. **Phone number is the customer identity**, not email. Index it, normalise it (`+977`, strip spaces and dashes) before comparison.
6. **Stock reserves at confirmed, deducts at dispatched.** Deducting at order time oversells against orders that are later refused.
7. **All stock changes go through `stock_movements`.** Never `UPDATE inventory SET qty = ...` directly — the ledger is what makes discrepancies findable.
8. **VAT is 13% and displayed inclusive to consumers, itemised for B2B.**
9. **Delivery pricing keys off `inside_valley`**, resolved from district — never free-typed.
10. **Do not integrate Stripe or PayPal.** They cannot receive money in Nepal.
11. **Every destructive admin action is soft-delete + audit log.** Who, what, when, previous value.
12. **Idempotency keys on payment callbacks.** Gateways retry; double-crediting an order is worse than failing it.

---

## 9. Definition of done for phase 1

- `pnpm dev` runs clean, TypeScript strict passes with no errors
- Seed script loads all 196 products; `LIKELY-MATCH` and `CONFIRM-BRAND` rows land as `draft`
- Catalogue and PDP render real data with NPR formatting
- Lighthouse performance ≥ 90 on the PDP (mobile — most Nepali traffic is mobile)
- No `cost_npr` in any network response observable from a customer session
- Nepali/English toggle works on the PDP
- Product images lazy-load; PDP is usable on a 3G connection
