/**
 * The official 5-pillar taxonomy. Single source of truth.
 *
 * Nav, sitemap, category pages, the admin category picker and the DB seed all read from here.
 * Before this file the five pillars were hardcoded in six places with three different slug
 * spellings, which is why DB-backed category lookups silently missed and fell back to
 * hardcoded arrays.
 */

export interface Pillar {
  /** Canonical URL slug. The only slug that should ever be linked or indexed. */
  slug: string;
  /** Stable DB primary key for the categories row. */
  id: string;
  name: string;
  name_np: string;
  /** Business line: traffic = D2C volume, profit = B2B margin. */
  line: "traffic" | "profit";
  sortOrder: number;
  /**
   * Whether we actually hold stock for this pillar today.
   * Unstocked pillars stay browsable but are kept out of the index and out of llms.txt pricing.
   */
  stocked: boolean;
  /**
   * Whether this category is booked with a 10-15% upfront deposit instead of cash on delivery.
   * Only spa furniture is built to order; luxury chairs ship COD like everything else.
   */
  requiresDeposit: boolean;
  /** Legacy slugs that must 301 to `slug`, never render as live duplicates. */
  aliases: string[];
}

export const PILLARS: Pillar[] = [
  {
    slug: "manicure-pedicure-spa-furniture",
    id: "cat-spa",
    name: "Manicure & Pedicure Spa Furniture",
    name_np: "म्यानिक्योर र पेडिक्योर स्पा फर्निचर",
    line: "profit",
    sortOrder: 1,
    stocked: true,
    requiresDeposit: true,
    aliases: ["spa", "spa-furniture", "manicure-pedicure"],
  },
  {
    slug: "luxury-chairs",
    id: "cat-chairs",
    name: "Luxury Salon Chairs",
    name_np: "लक्जरी सैलुन कुर्सी",
    line: "profit",
    sortOrder: 2,
    stocked: true,
    requiresDeposit: false,
    aliases: ["luxury-salon-chairs", "salon-chairs"],
  },
  {
    slug: "hair-straighteners",
    id: "cat-straighteners",
    name: "Hair Straighteners",
    name_np: "हेयर स्ट्रेटनर",
    line: "traffic",
    sortOrder: 3,
    stocked: false,
    requiresDeposit: false,
    aliases: ["straighteners"],
  },
  {
    slug: "hair-dryers-curlers",
    id: "cat-dryers",
    name: "Hair Dryers & Curlers",
    name_np: "हेयर ड्रायर र कर्लर",
    line: "traffic",
    sortOrder: 4,
    stocked: false,
    requiresDeposit: false,
    aliases: ["hair-dryers", "dryers-curlers"],
  },
  {
    slug: "eyewear",
    id: "cat-eyewear",
    name: "Premium Eyewear",
    name_np: "प्रिमियम आइवेयर",
    line: "traffic",
    sortOrder: 5,
    stocked: false,
    requiresDeposit: false,
    aliases: ["premium-eyewear", "premium-eyewears"],
  },
];

const BY_SLUG = new Map(PILLARS.map((p) => [p.slug, p]));
const BY_ALIAS = new Map(PILLARS.flatMap((p) => p.aliases.map((a) => [a, p] as const)));

/** Canonical pillar for a slug, or undefined. Aliases do NOT resolve here — they must redirect. */
export function getPillar(slug: string): Pillar | undefined {
  return BY_SLUG.get(slug);
}

/** Canonical pillar an alias points at, or undefined. */
export function resolveAlias(slug: string): Pillar | undefined {
  return BY_ALIAS.get(slug);
}

export function getPillarById(id: string): Pillar | undefined {
  return PILLARS.find((p) => p.id === id);
}

/** Permanent redirects for every legacy slug, consumed by next.config.ts. */
export const CATEGORY_REDIRECTS = PILLARS.flatMap((p) =>
  p.aliases.map((alias) => ({
    source: `/c/${alias}`,
    destination: `/c/${p.slug}`,
    permanent: true,
  }))
);

/** Category ids we actually hold stock for today. */
export const STOCKED_CATEGORY_IDS = new Set(PILLARS.filter((p) => p.stocked).map((p) => p.id));

/**
 * Whether a product is genuinely purchasable right now.
 *
 * Price alone is not enough. The seed data carries prices for products in categories we do not
 * stock (including two eyewear rows literally named "Coming Soon" with a price and an active
 * status), so a `price_npr > 0` test wrongly marks 22 unstocked products as for sale.
 *
 * Owner's position: only manicure/pedicure spa furniture and luxury chairs are real stock.
 * When a category is genuinely stocked, flip `stocked` on its pillar above and these products
 * become purchasable and indexable again - no other code changes needed.
 */
export function isForSale(product: { price_npr: number; category_id?: string | null }): boolean {
  if (!product.price_npr || product.price_npr <= 0) return false;
  // Uncategorised products are assumed sellable; the admin panel now requires a category.
  if (!product.category_id) return true;
  return STOCKED_CATEGORY_IDS.has(product.category_id);
}

/** Category ids booked with an upfront deposit rather than cash on delivery. */
export const DEPOSIT_CATEGORY_IDS = new Set(
  PILLARS.filter((p) => p.requiresDeposit).map((p) => p.id)
);
