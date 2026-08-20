# GEMINI.md - working rules for the Eternity Products project

> `CLAUDE.md`, `GEMINI.md` and `AGENTS.md` are kept in sync and carry the same rules. Editing one means editing all three.

Instructions for the Google Antigravity agent and Gemini CLI working in this folder. Self-contained on purpose: Antigravity may load only this file, so do not treat it as a pointer to `CLAUDE.md`.

Antigravity specifics:

- Work inside this repo only. Do not create files outside it, and do not add a dependency without saying why in the response.
- Prefer editing an existing file over creating a new one. Do not write `*.md` summary, report, or plan files unless asked.
- Before reporting a task complete, run `npx tsc --noEmit` and `npm run build` and quote the result. A green editor is not verification.
- Artefacts, walkthroughs, and any customer-facing copy follow the writing style at the bottom of this file.

---

## What this project is

Business research and full web application implementation for **Eternity Products**, a Nepal-based importer and distributor of professional hair styling tools, cosmetics, salon equipment (brand: Ikonic, imported from India), and premium eyewear (brands: Oakley, Ray-Ban Tech).

Two customer types, two economics:

- **D2C retail**: styling tools and premium eyewear. High volume, 25-30% margin, mostly cash on delivery.
- **B2B salon accounts**: parlours buying tools in bulk and salon furniture in high-value single units, ~50% margin. There is an existing base of parlour customers; they are an installed base, not a lead list.

---

## Master brand and contact info

- **Official domain**: `https://www.eternityproducts.online`
- **Official phone / Viber / WhatsApp**: `+977 9868089892` (direct WhatsApp: `https://wa.me/9779868089892`)
- **Official TikTok Shop**: `https://www.tiktok.com/@eternity.products?is_from_webapp=1&sender_device=pc`
- **GitHub repository**: `https://github.com/Hideaway420/Eternity.git`
- **Live Vercel deployment**: `https://eternity-black-nine.vercel.app`

---

## The rule that matters most

**Never invent a price, SKU, product link, rating, review, or statistic.**

This project's entire value is that its numbers are traceable. Every price was read from a live page or computed from one, and every row carries a confidence tag saying which.

This applies to structured data too. Do not emit a fabricated `aggregateRating` or `review` in Product JSON-LD. The site previously served a static 4.9 rating over 48 reviews plus two invented named reviewers on every product URL. That is a Google manual-action risk and it is now removed. If real review data does not exist, render nothing.

### Confidence tags

| Tag | Meaning |
|---|---|
| `VERIFIED` | Read from a live page during research; URL recorded |
| `LIKELY-MATCH` | Name-matched across sources, not exact. Needs human confirmation |
| `NO-NEPAL-LISTING` | Real product, no Daraz Nepal equivalent found. The opportunity, not a gap |
| `NEEDS-SUPPLIER-INPUT` | No public data exists; awaiting the user's supplier list |
| `CONFIRM` | Found, but the user should check against their own account or agent |

---

## Hard rules

1. **Money is integer paisa (NPR x 100).** Never floats, never store NPR. The DB column is named `price_npr` but it holds paisa: NPR 120,000 is stored as `12000000`. Convert and render only through `src/lib/money.ts` (`formatNpr`, `paisaToNpr`, `nprToPaisa`, `calculateVat`). `formatNpr` takes paisa.
2. **`cost_npr`, `compare_at_npr` margins, and distributor discounts must never reach a public or unauthenticated response.** An anonymous `GET /api/admin/products` once returned 38 products with `cost_npr` attached. Every admin route now calls `requireAdmin()`. Never add a public selector that pulls those columns.
3. **Never emit `offers` or `availability: InStock` for a product that is not for sale.** Gate on `isForSale(product)`, not on price.
4. **Payments**: COD (primary, open-box inspection guarantee), eSewa, Khalti, Fonepay, bank transfer. **Never Stripe or PayPal.**
5. **Identity is a Nepali phone number (`+977`), not email.** Normalise through `src/lib/phone.ts` (`normalizePhone`, `isValidNepalPhone`).
6. **Non-trivial logic leaves one runnable self-check behind.** Money paths, security paths, parsers, and branches get a single `assert`-based script in `scripts/`, matching `scripts/test-auth.ts` and `scripts/test-order-totals.ts`. No test framework, no fixtures.
7. **Verify before claiming done.** Run `npx tsc --noEmit` and `npm run build`. Never report success without running them.
8. **VAT is 13%**, charged on CIF plus customs duty. Consumer prices display VAT-inclusive, so `calculateVat` extracts the VAT already folded into a total. It is never added a second time.
9. **Exchange rate**: NPR is pegged to INR at **1.60**.

---

## Architecture

### Stack

Next.js 15 App Router, TypeScript, Tailwind CSS, Lucide icons, Zustand for cart state, Zod for input validation. Drizzle ORM over `@libsql/client`. Design tokens live in `tailwind.config.ts`: `#FDFBF7` ivory (`primary-container`), `#D4AF37` (`gold`), `#1E2224` (`inverse-surface`).

### Taxonomy: `src/lib/taxonomy.ts` is the single source of truth

Never hardcode a category slug, name, or id anywhere else. Nav, sitemap, category pages, the admin category picker, and the DB seed all read from this file. Before it existed the five pillars were hardcoded in six places with three different slug spellings, so DB category lookups silently missed and fell through to hardcoded arrays.

Each pillar carries `slug`, `id`, `name`, `name_np`, `line`, `sortOrder`, `stocked`, `requiresDeposit`, `aliases`.

| Slug | id | Line | Stocked | Deposit |
|---|---|---|---|---|
| `manicure-pedicure-spa-furniture` | `cat-spa` | profit | yes | yes |
| `luxury-chairs` | `cat-chairs` | profit | yes | no |
| `hair-straighteners` | `cat-straighteners` | traffic | no | no |
| `hair-dryers-curlers` | `cat-dryers` | traffic | no | no |
| `eyewear` | `cat-eyewear` | traffic | no | no |

Exports to use instead of literals: `PILLARS`, `getPillar(slug)`, `resolveAlias(slug)`, `getPillarById(id)`, `CATEGORY_REDIRECTS`, `STOCKED_CATEGORY_IDS`, `isForSale(product)`, `DEPOSIT_CATEGORY_IDS`.

Legacy slugs 301 through `CATEGORY_REDIRECTS`, consumed by `next.config.ts`. **Never link to an alias.** `getPillar()` deliberately does not resolve aliases; that is what forces the redirect. An unknown category slug must `notFound()`, never fall back to a catalogue. `/c/nike-shoes` used to return 200 rendering the eyewear catalogue.

### Stock truth: `isForSale(product)`, never `price_npr > 0`

The seed carries prices for products in categories that are not stocked, including two eyewear rows named "Coming Soon" priced at NPR 12,920 and NPR 14,500 with an active status. A `price_npr > 0` test wrongly marks 22 unstocked products as purchasable.

Today only `cat-spa` and `cat-chairs` are stocked. To stock a category, flip `stocked: true` on its pillar in `src/lib/taxonomy.ts`. Nothing else needs changing: the sitemap, the noindex decision, the buy button, and the JSON-LD `offers` block all read from it.

Unstocked products stay browsable but are kept out of the sitemap, marked `robots: { index: false, follow: true }`, and emit no `offers`.

### Deposits: only `cat-spa`

Manicure and pedicure spa furniture is built to order and books with a 10-15% upfront deposit via eSewa, Khalti, Fonepay, or bank transfer. Everything else, luxury chairs included, is cash on delivery with open-box inspection.

Gate on `DEPOSIT_CATEGORY_IDS`. **Do not key this off `line === "profit"`**, which also covers luxury chairs and once showed chair buyers deposit-only payment options.

### Auth

- `src/lib/session.ts` holds the HMAC-signed session helpers (`ADMIN_COOKIE`, `signSession`, `verifySession`, `SESSION_COOKIE_OPTIONS`) built on Web Crypto so the same code runs in Edge middleware and in Node route handlers. **It must not import `next/headers` or `next/server`.** Sessions expire after 7 days and fail closed when the secret is unset.
- `src/lib/auth.ts` exports `requireAdmin()` for route handlers and server actions. It returns a 401 `NextResponse` to return early, or `null` when the caller is authenticated.
- `src/middleware.ts` matcher covers `/admin/:path*`, `/api/admin/:path*`, `/salon/:path*`. `/admin/login` and `/api/admin/login` stay public. API paths get a real 401 so the admin UI can react; page routes rewrite to `/not-found` so the admin panel stays cloaked as a 404.
- **Middleware does not cover server actions.** Every `"use server"` action that mutates data must call `requireAdmin()` itself. `src/actions/addProduct.ts` is the working example.

### Environment variables

Mandatory in production: `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`. See `.env.example`.

Login fails closed with HTTP 503 when any admin variable is unset. `src/db/index.ts` throws at runtime rather than silently using an in-memory database. The old `file::memory:` fallback meant every Vercel cold start began with an empty DB: admin writes reported success and vanished, and the storefront served fallbacks. The only remaining in-memory case is `NEXT_PHASE === "phase-production-build"`, because `next build` prerenders before any deployment env exists.

Optional and env-gated: `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_TIKTOK_PIXEL_ID`. Each analytics block is skipped when its id is unset.

### Database and migrations

`src/db/schema.ts` is the source of truth for all 21 tables. `npm run db:push` (drizzle-kit, configured in `drizzle.config.ts`) is how tables get created, against Turso when `TURSO_DATABASE_URL` is set and against local `file:eternity.db` otherwise.

**Do not hand-write DDL.** The `initTables()` block in `src/db/index.ts` created only 6 of the 21 tables and drifted from the schema. It survives for seed data and back-fills, not as the migration path.

### Route handlers may only export HTTP methods

A `route.ts` may export `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS` plus Next's config keys (`dynamic`, `revalidate`, `runtime`, and so on). Exporting a helper from a route file is a build error. Put shared logic in `src/lib/`. `src/lib/order-totals.ts` exists for exactly this reason: the money math sits outside `src/app/api/orders/route.ts` so `scripts/test-order-totals.ts` can cover it without a database.

### Canonical URLs

**Never set `alternates.canonical` in `src/app/layout.tsx`.** Next merges metadata shallowly per key, so a root canonical is inherited by every child route that does not override it, canonicalising the whole site to one page. A hardcoded absolute canonical in the root layout once told Google the entire catalogue duplicated the homepage.

Every route declares its own. `metadataBase` in the root layout is fine and stays.

### robots.txt

`Disallow` is **prefix matching**, not exact matching. `Disallow: /c/hair-dryers` also blocks `/c/hair-dryers-curlers`, and `Disallow: /c/manicure-pedicure` also blocks `/c/manicure-pedicure-spa-furniture`. An earlier `src/app/robots.ts` did both and blocked the two highest-value category pages while the sitemap still submitted them.

Two rules follow:

- Never add a `Disallow` entry that is a prefix of a canonical URL.
- Never disallow a URL that 301s. Blocking a redirect stops crawlers following it, so link equity never consolidates on the canonical.

Current disallow list: `/admin/`, `/api/`, `/salon/`, `/order/`, `/checkout`. AI crawlers (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-Web, PerplexityBot, Applebot-Extended, Google-Extended) are allowed deliberately.

### Storefront conventions

- **Grids**: `grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6`, 100% clickable `<Link>` card wrappers with `active:scale-[0.98]`, images bound in `aspect-square overflow-hidden`.
- **Images**: use `ProductImage` from `src/components/storefront/ProductImage.tsx`. It renders `next/image` with `fill`, so the caller must supply a positioned, overflow-hidden wrapper. It falls through to a plain `<img>` for `data:` and `blob:` sources because `next/image` cannot optimise them.
- **Feature flags**: `is_hero` (1 = hero product `ETP-SPA-01`), `is_featured` (featured storefront collection).
- **ISR**: `export const revalidate = 60;` with `revalidatePath()` on writes.
- **i18n**: English (`en`) and Nepali (`np`) through `src/lib/i18n.ts`. Currency renders `NPR 12,920` or `रु 12,920`.
- **Admin upload**: `/api/admin/upload-image` allowlists extensions and MIME types and caps size. An unsanitised extension previously allowed `.svg` and `.html` upload, which is stored XSS on our own origin.

---

## Traps we already fell into

Do not repeat these.

1. **Root-layout canonical inheritance.** A canonical in `src/app/layout.tsx` is inherited by every child route. It pointed the whole catalogue at the homepage. Each route declares its own.
2. **robots.txt prefix matching.** `Disallow: /c/hair-dryers` silently blocked `/c/hair-dryers-curlers`. Check every disallow entry against the canonical URL list before adding it.
3. **A `loading.tsx` at a route-group root forces streaming.** Once the response streams, the status is already flushed, so `notFound()` inside the page cannot set a 404 and the bad URL returns 200. Do not add a `loading.tsx` at a route-group root while any route under it depends on `notFound()` returning a real 404.
4. **`INSERT OR IGNORE` skips a row whose UNIQUE column already exists under a different id.** The seed created luxury chairs as `prod-etp-chair-0N` but they already existed as `prod-etp-lsc-0N`, so the inserts were ignored, the dependent `product_images` rows hit a foreign-key error, and the whole batch aborted. Result: three real chairs with no images and a feature-flag backfill that never ran. Resolve dependent rows by a stable business key (SKU) with a `SELECT`, and keep seed data in its own try block, isolated from schema DDL.
5. **`next/image` needs a positioned parent and cannot optimise `data:` URLs.** With `fill` it requires a positioned wrapper, and a `data:` src fails to optimise. `ProductImage` handles both; use it instead of importing `next/image` directly.
6. **Price is not stock.** See `isForSale` above. Two eyewear rows are literally named "Coming Soon" and carry a price and an active status.
7. **Middleware does not cover server actions.** A matcher on `/admin/:path*` protects the page, not the `"use server"` function that page posts to.

---

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production build. Run before claiming done |
| `npm run typecheck` (`npx tsc --noEmit`) | Type check. Run before claiming done |
| `npm run db:push` | Create/update all 21 tables from `src/db/schema.ts` |
| `npm run db:generate` | Generate a drizzle migration into `./drizzle` |
| `npm run test:auth` | Session signing self-check (`scripts/test-auth.ts`) |
| `npx tsx scripts/test-order-totals.ts` | Checkout money self-check |
| `npm run seed` | Seed from `src/db/seed.ts` |
| `npm run audit:categories` | Category audit (`scripts/auditCategories.ts`) |
| `npm run lint` | Next lint |

Other seed and maintenance scripts: `npm run seed:premium`, `npm run restore:premium`, `npm run purge:reset`, `npm run migrate:flags`.

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
