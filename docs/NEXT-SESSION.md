# Next session: what to pick up

Written 2026-08-20, after commits `bc63845` and `9e730f3` shipped to `main` and deployed.

Read `CLAUDE.md` (or `GEMINI.md` / `AGENTS.md`, they are the same content) **first**. It holds the
rules. This file is only the open work.

---

## Current state

Live at `https://www.eternityproducts.online`, verified 15/15 on production after deploy:

- `/api/admin/*` returns 401 without a session. `cost_npr` no longer reaches any public response.
- Every page canonicalizes to itself. Before this it canonicalized to the homepage, which is why
  nothing ranked.
- Sitemap is 16 URLs: 7 real products and 5 categories. No "Coming Soon" slugs.
- Unknown slugs 404 instead of returning 200 with an invented product.
- Orders persist to the database. Checkout used to discard every order silently.
- `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `TURSO_DATABASE_URL` and
  `TURSO_AUTH_TOKEN` are all set in Vercel and confirmed working.

---

## Do these first

### 1. Verify the order insert against Turso

**This is the only part of the new code never exercised in production.** `/api/orders` was proven
to load, reject unstocked SKUs and reject bad phone numbers, but all three of those return before
touching the database. The insert path itself is untested against the live Turso schema.

```bash
vercel env pull .env.local
npm run db:push
```

`drizzle-kit push` reconciles Turso to `src/db/schema.ts` and is additive for new columns. Then place
one real order on the live site and confirm it appears, and delete the test row afterwards.

If checkout 500s before you run this, a column is missing on Turso. That is the cause.

### 2. Turn the analytics on

The tracking code shipped but is dormant. Every block is skipped when its ID is unset, so nothing is
being collected right now. Add in Vercel:

```
NEXT_PUBLIC_GA4_ID=
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_TIKTOK_PIXEL_ID=
```

`view_item`, `add_to_cart`, `begin_checkout` and `purchase` fire automatically once they are set
(`src/lib/analytics.ts`, wired in `ProductColorSelector.tsx` and `checkout/page.tsx`).

TikTok matters most here, it is the main sales channel.

### 3. Resubmit to Google Search Console

The canonical fix means the catalogue can be indexed for the first time. Submit
`https://www.eternityproducts.online/sitemap.xml` and request indexing for the 7 product URLs and
5 category URLs. Expect weeks, not days.

---

## Open items, with paths

### `/salon/portal` is gated but entirely fake

`src/app/salon/portal/page.tsx`. Behind middleware and noindexed, so it cannot leak or be found, but:

- the salon account is a hardcoded object (~line 21-30): Gold Tier, 15% discount, NPR 500,000 credit
- every product image is one hardcoded Unsplash URL (~line 116)
- **3 buttons, 0 `onClick` handlers**: "Fast 1-Click Reorder", "Request Furniture Quote", "Quick Order"
- nothing in Header, Footer or nav links to it

Decide: build the B2B portal properly, or delete the route. Leaving a dead page costs nothing today
but will confuse the next person.

### Three lib modules are imported by nothing

- `src/lib/pricing.ts` (B2B tier discounts)
- `src/lib/landed-cost.ts` (import duty / freight costing)
- `src/lib/status-machine.ts` (order status transitions, including a COD phone-confirmation rule)

`status-machine.ts` is the interesting one: `/api/orders` writes `status: "pending"` directly rather
than going through it. When you build order management in the admin panel, route transitions through
that module instead of writing status strings by hand, otherwise the COD confirmation rule is
unenforced.

### Contradictory eyewear rows in the seed

`src/db/index.ts` seeds `ETP-EYE-01` and `ETP-EYE-02` named "... - Coming Soon" but carrying prices
(NPR 12,920 and NPR 14,500) and `status: 'active'`. They are correctly treated as not-for-sale today
because `eyewear` has `stocked: false` in `src/lib/taxonomy.ts`, but the data itself contradicts its
own name. Clean it up when real eyewear stock arrives.

Related: the local database has **no `eyewear` category row and no eyewear products**, so
`/c/eyewear` renders entirely from the hardcoded `CATEGORY_PRODUCTS_MAP` fallback.

### Duplicate product image rows

7 products each have 2 `product_images` rows pointing at the **same URL** under different ids
(`img-prod-etp-*` from one seed script, `img-spa-*` / `img-chair-*` from `initTables`). Invisible
today because the gallery dedupes by URL. The `product_images.image_hash` column exists precisely to
catch this. Low priority.

### `CATEGORY_PRODUCTS_MAP` is 295 lines of hardcoded fallback

`src/app/(storefront)/c/[category]/page.tsx`. It only runs when the DB lookup returns nothing. Now
that category slugs match the DB it should rarely fire. Delete it once you trust the database, but
verify against production first, not locally.

### 11 raw `<img>` tags left on the storefront

Converted the 6 that affect Core Web Vitals (hero, product grids, PDP main image) via
`src/components/storefront/ProductImage.tsx`. The rest are cart drawer, search modal, checkout
thumbnails and the header/footer logos. None are LCP elements. Use `ProductImage` if you touch them.

---

## Deliberately deferred, do not start these yet

**Pricing test on the NPR 115k-145k spa range and NPR 30-40k chairs.** Needs roughly two weeks of the
analytics from step 2 above. Running it without conversion data produces numbers with no basis. The
one pricing lever already shipped is the "You save NPR X" display, which uses the real
`compare_at_npr` field.

**Nepali (`ne-NP`) indexing.** `src/lib/i18n.ts` is a `useState` toggle that resets on every
navigation and only translates header labels. `formatNpr` in `src/lib/money.ts` accepts a `locale`
param that no call site passes. Real Nepali SEO needs locale route segments and translated page
bodies. The broken `ne-NP` hreflang was removed rather than left advertising a locale that does not
exist.

**Programmatic district SEO** (77 districts). With placeholders noindexed you have 7 indexable
products. Generating dozens of near-identical location pages on that base is the doorway-page pattern
Google penalises. Revisit after real stock is loaded and the catalogue is indexed.

---

## Before you claim anything is done

```bash
npm run typecheck
npm run test:auth
npx tsx scripts/test-order-totals.ts
npm run build
```

Then check the real behaviour, not just that it compiles. Several bugs in this codebase typechecked
and built cleanly while being completely broken at runtime: the canonical leak, the silently
discarded orders, and a `robots.txt` that blocked the highest-value category page. `CLAUDE.md` has a
"traps we already fell into" section, read it.
