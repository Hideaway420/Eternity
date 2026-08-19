# CLAUDE.md — working rules for Eternity Products project

Guidance for any AI agent working in this folder: Claude Code, Gemini Antigravity, or otherwise.

---

## What this project is

Business research and full web application implementation for **Eternity Products** — a Nepal-based importer and distributor of professional hair styling tools, cosmetics, salon equipment (brand: Ikonic, imported from India), and premium eyewear (brands: Oakley, Ray-Ban Tech).

Two customer types, two economics:

- **D2C retail** — styling tools & premium eyewear. High volume, 25–30% margin, mostly cash on delivery.
- **B2B salon accounts** — parlours buying tools in bulk and salon furniture in high-value single units, ~50% margin. There is an existing base of parlour customers; they are an installed base, not a lead list.

---

## Master Brand & Contact Info

- **Official Domain**: `https://www.eternityproducts.online`
- **Official Phone / Viber / WhatsApp**: `+977 9868089892` (Direct WhatsApp: `https://wa.me/9779868089892`)
- **Official TikTok Shop**: `https://www.tiktok.com/@eternity.products?is_from_webapp=1&sender_device=pc`
- **GitHub Repository**: `https://github.com/Hideaway420/Eternity.git`
- **Live Vercel Deployment**: `https://eternity-black-nine.vercel.app`

---

## The rule that matters most

**Never invent a price, SKU, product link, or statistic.**

This project's entire value is that its numbers are traceable. Every price was read from a live page or computed from one, and every row carries a confidence tag saying which.

### Confidence tags

| Tag | Meaning |
|---|---|
| `VERIFIED` | Read from a live page during research; URL recorded |
| `LIKELY-MATCH` | Name-matched across sources, not exact — needs human confirmation |
| `NO-NEPAL-LISTING` | Real product, no Daraz Nepal equivalent found. The opportunity, not a gap |
| `NEEDS-SUPPLIER-INPUT` | No public data exists; awaiting the user's supplier list |
| `CONFIRM` | Found, but the user should check against their own account or agent |

---

## Technical Architecture & Key Systems

- **Framework**: Next.js 15 App Router, TypeScript, Tailwind CSS, Lucide Icons.
- **Database**: Drizzle ORM + `@libsql/client`.
  - Local: `file:eternity.db`
  - Cloud / Vercel: Turso LibSQL via `TURSO_DATABASE_URL` & `TURSO_AUTH_TOKEN` (Fallback: `file::memory:` to prevent Vercel 500 EROFS errors).
- **Official 5-Pillar Taxonomy Silos**:
  1. `eyewear` (Premium Eyewear: Oakley, Ray-Ban Tech)
  2. `hair-straighteners`
  3. `hair-dryers-curlers`
  4. `luxury-chairs`
  5. `manicure-pedicure-spa-furniture`
- **Dynamic Database-Driven Homepage**:
  - `is_hero`: Boolean feature flag (1 = Hero Product `ETP-SPA-01`).
  - `is_featured`: Boolean feature flag (1 = Featured Storefront Collection).
  - ISR Revalidation: `export const revalidate = 60;` with instant `revalidatePath()` on writes.
- **Edge Security & Direct Image Upload ("Ghost Route")**:
  - Edge Middleware (`src/middleware.ts`) rewrites unauthorized `/admin/*` requests to `/not-found` (404 Not Found) if `ADMIN_SESSION` cookie is missing or invalid.
  - Inventory Studio Ghost Upload UI at `/admin/inventory-studio`.
  - Direct device image upload route at `/api/admin/upload-image`.
- **Mobile UX Grid Standard**:
  - All storefront product grids enforce `grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6`.
  - 100% clickable `<Link>` card wrappers with `active:scale-[0.98]` tap feedback.
  - Product images bound in `aspect-square overflow-hidden`.
- **Brand Identity SEO & Product Snippets**:
  - WebSite JSON-LD schema injected for Google Search Site Name (`"Eternity Products"`).
  - Next.js Metadata API configured with `applicationName: "Eternity Products"`.
  - High-res favicon icons configured (`icon.png` 192x192, `apple-icon.png` 180x180).
  - Search Console compliant Product JSON-LD (`aggregateRating`, `review`, `brand`, `offers`, `shippingDetails`, `hasMerchantReturnPolicy`).
- **Internationalization (i18n)**: English (`en`) & Nepali (`np`) dual language engine (`src/lib/i18n.ts`).
- **Currency**: NPR only. Format `NPR 12,920` or `रु 12,920`. In code, money is **integer paisa** (NPR × 100) — never floats.
- **Exchange rate**: NPR is pegged to INR at **1.60**.
- **VAT**: 13%, charged on CIF + customs duty. Consumer prices display VAT-inclusive.
- **Confidential data**: `cost_npr`, margin percentages, and distributor discounts must never reach a public API response or customer-facing page.
- **Payments**: COD (primary open-box guarantee), eSewa, Khalti, Fonepay, Bank Transfer. Never Stripe or PayPal.
- **Identity**: Phone number (`+977`), not email.

---

## Writing style for user-facing artefacts

Direct and concrete. Name the number, the file, the action.

- No em dashes
- Avoid: delve, crucial, robust, comprehensive, nuanced, multifaceted, leverage, unlock, seamless
- Short paragraphs. Lead with the finding, then the evidence
- Nepali-language content uses Roman script mixed with Nepali Devanagari script

---

## The user

Runs Eternity Products. Sells on TikTok (`@eternity.products`) and Facebook, imports from India, and already supplies beauty parlours directly.
