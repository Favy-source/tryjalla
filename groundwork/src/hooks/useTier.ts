/**
 * useTier — reads the current user's subscription tier from their profile
 * and returns the tier key + full feature map from TIER_FEATURES.
 *
 * This is the ONLY place components should read tier data from.
 * Do NOT re-read profiles.subscription_tier directly in components.
 *
 * Usage:
 *   const { tier, features, meetsMin } = useTier();
 *   if (meetsMin("hybrid")) { ... }
 */
import { useAuth } from "@/hooks/useAuth";
import {
  TIER_FEATURES,
  TIER_ORDER,
  getTierFeatures,
  meetsMinTier,
  type Tier,
  type TierFeatures,
} from "@/lib/tier-features";

export interface UseTierReturn {
  /** Current tier key — "self_serve" | "hybrid" | "full_service" */
  tier: Tier;

  /** Full feature map for the current tier */
  features: TierFeatures;

  /**
   * Returns true if the current user's tier is >= the given minimum.
   * Use this to gate UI elements.
   *
   * @example
   * if (meetsMin("hybrid")) showApprovalButton();
   */
  meetsMin: (min: Tier) => boolean;

  /** Whether the tier data is still loading (profile hasn't been fetched yet) */
  loading: boolean;
}

export function useTier(): UseTierReturn {
  const { profile, loading } = useAuth();

  const tierRaw = profile?.subscription_tier ?? "self_serve";

  // Validate the tier value — if the DB has something unexpected, fall back
  const tier: Tier = (TIER_ORDER as string[]).includes(tierRaw)
    ? (tierRaw as Tier)
    : "self_serve";

  const features = getTierFeatures(tier);

  function meetsMin(min: Tier): boolean {
    return meetsMinTier(tier, min);
  }

  return { tier, features, meetsMin, loading };
}

// Re-export TIER_FEATURES so components can reference the full map without
// importing from two places.
export { TIER_FEATURES };
