import { db } from "@/db";
import { priceTiers } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export interface TierPriceResult {
  originalPricePaisa: number;
  tierPricePaisa: number;
  discountPct: number;
  tier: string;
  resolutionSource: "product" | "category" | "tier_default";
}

const DEFAULT_TIER_DISCOUNTS: Record<string, number> = {
  registered: 5,
  silver: 10,
  gold: 15,
  platinum: 25,
};

export async function resolveTierPrice(
  productId: string,
  categoryId: string | null,
  retailPricePaisa: number,
  tier: string = "registered"
): Promise<TierPriceResult> {
  const normalizedTier = tier.toLowerCase();
  
  if (normalizedTier === "retail" || !normalizedTier) {
    return {
      originalPricePaisa: retailPricePaisa,
      tierPricePaisa: retailPricePaisa,
      discountPct: 0,
      tier: "retail",
      resolutionSource: "tier_default",
    };
  }

  // 1. Check Product-specific tier override
  const productTier = await db
    .select()
    .from(priceTiers)
    .where(and(eq(priceTiers.tier, normalizedTier), eq(priceTiers.product_id, productId)))
    .get();

  if (productTier) {
    const discountPct = productTier.discount_pct;
    const tierPricePaisa = Math.round(retailPricePaisa * (1 - discountPct / 100));
    return {
      originalPricePaisa: retailPricePaisa,
      tierPricePaisa,
      discountPct,
      tier: normalizedTier,
      resolutionSource: "product",
    };
  }

  // 2. Check Category-specific tier override
  if (categoryId) {
    const categoryTier = await db
      .select()
      .from(priceTiers)
      .where(and(eq(priceTiers.tier, normalizedTier), eq(priceTiers.category_id, categoryId)))
      .get();

    if (categoryTier) {
      const discountPct = categoryTier.discount_pct;
      const tierPricePaisa = Math.round(retailPricePaisa * (1 - discountPct / 100));
      return {
        originalPricePaisa: retailPricePaisa,
        tierPricePaisa,
        discountPct,
        tier: normalizedTier,
        resolutionSource: "category",
      };
    }
  }

  // 3. Fallback to default tier discount
  const discountPct = DEFAULT_TIER_DISCOUNTS[normalizedTier] || 5;
  const tierPricePaisa = Math.round(retailPricePaisa * (1 - discountPct / 100));

  return {
    originalPricePaisa: retailPricePaisa,
    tierPricePaisa,
    discountPct,
    tier: normalizedTier,
    resolutionSource: "tier_default",
  };
}
