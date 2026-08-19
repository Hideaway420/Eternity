# GEMINI.md — Antigravity Agent Configuration & Memory

Master reference for Google DeepMind Antigravity AI agent working on **Eternity Products**.

---

## 🚀 Project Overview

**Eternity Products** is a Nepal-based importer and distributor of professional hair styling tools, cosmetics, salon equipment (Ikonic brand, imported from India), and premium eyewear (Oakley, Ray-Ban Tech).

### Key Links & Contact Details
- **Official Domain**: `https://www.eternityproducts.online`
- **Official Phone / Viber / WhatsApp**: `+977 9868089892` (WhatsApp: `https://wa.me/9779868089892`)
- **TikTok Shop**: `https://www.tiktok.com/@eternity.products?is_from_webapp=1&sender_device=pc`
- **GitHub Repository**: `https://github.com/Hideaway420/Eternity.git`
- **Live Vercel Site**: `https://eternity-black-nine.vercel.app`

---

## 🛠️ Stack & Architecture

- **App Framework**: Next.js 15 (App Router, Server & Client Components)
- **Styling**: Tailwind CSS + Custom Serene Opulence Tokens (`#FDFBF7` Ivory, `#D4AF37` Gold, `#1E2224` Dark Slate)
- **Database Layer**: Drizzle ORM + `@libsql/client` (SQLite / LibSQL)
- **Internationalization**: Dual Language Switcher (`src/lib/i18n.ts`) for English (`en`) & Nepali (`np`)
- **Direct Image Upload API**: `/api/admin/upload-image` supporting direct device file uploads
- **Seeded Data & Active Inventory**:
  - `eyewear`: 2 Placeholder products (Ray-Ban Tech & Oakley, `coming_soon`)
  - `hair-straighteners`: 10 Placeholder products (`out_of_stock`)
  - `hair-dryers-curlers`: 10 Placeholder products (`out_of_stock`)
  - `luxury-chairs`: 3 Restored real luxury chairs (`active / in_stock`)
  - `manicure-pedicure-spa-furniture`: 4 Restored real pedicure spa stations (`active / in_stock`)

---

## 🔑 Invariant Rules

1. **Integer Paisa Math**: Store money in integer paisa (`price_npr * 100`). Format output using `formatNpr()`.
2. **Confidential Margin Vault**: Never expose `cost_npr` or gross margin percentages to non-owner roles or public API routes.
3. **Open-Box COD**: Default payment is Cash on Delivery with open-box inspection guarantee across Nepal.
4. **Vercel Resiliency**: Database initialization gracefully falls back to `file::memory:` or fallback mock data when `TURSO_DATABASE_URL` is unconfigured to prevent 500 EROFS errors.
5. **Strict 5-Pillar Taxonomy Silos**: Category pages strictly query `WHERE category_slug = ?` (No data bleeding allowed across categories: `eyewear`, `hair-straighteners`, `hair-dryers-curlers`, `luxury-chairs`, `manicure-pedicure-spa-furniture`).
6. **Hidden Admin Edge Security & Direct Image Upload**: Requests to `/admin/*` missing valid `ADMIN_SESSION` cookie rewrite to `/not-found` (404 Not Found). Direct file uploads handled via `/api/admin/upload-image`.
7. **Mobile 2-Column Product Grids**: All storefront grids enforce `grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6` with 100% clickable `<Link>` card wrappers and `aspect-square` image bounds.
8. **Brand Identity SEO & Product Snippets**: Site Name configured as `"Eternity Products"` via `WebSite` JSON-LD schema & Next.js `applicationName` metadata. All PDPs inject complete Schema.org `Product` JSON-LD (`aggregateRating`, `review`, `brand`, `offers`, `shippingDetails`, `hasMerchantReturnPolicy`).
