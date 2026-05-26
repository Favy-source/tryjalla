/**
 * budget-engine.ts — computes stage payment amounts and the 9-section cost
 * breakdown from a project's total budget.
 *
 * Usage:
 *   const result = computeBudgetBreakdown({ budget: 50_000_000, floors: 2 });
 *   result.stageAllocations[0].amount // => 2_500_000 (5% of 50M)
 *   result.sectionBreakdown[200]       // => Foundation amount
 *
 * Both the wizard summary and the project detail budget tab read from this.
 */
import { STAGE_PAYMENT_ALLOCATIONS } from "@/lib/constants";
import {
  COST_SECTION_PERCENTAGES,
  COST_SECTIONS,
  type CostSectionCode,
} from "@/lib/floor-costs";

// ── Types ────────────────────────────────────────────────────────────────────

export interface StageAllocation {
  stage: number;
  name: string;
  percentage: number;
  amount: number;
}

export interface SectionAllocation {
  code: CostSectionCode;
  name: string;
  percentage: number;
  amount: number;
  isPerFloor: boolean;
}

export interface BudgetBreakdown {
  totalBudget: number;
  stageAllocations: StageAllocation[];
  sectionBreakdown: SectionAllocation[];
  /** Section amounts keyed by code — matches the DB `budget_breakdown` jsonb shape. */
  sectionMap: Record<number, number>;
}

// ── Engine ────────────────────────────────────────────────────────────────────

/**
 * Compute the full budget breakdown from a total budget amount.
 *
 * @param budget - Total project budget in local currency
 * @param floors - Number of floors (used to weight upper-floor section)
 */
export function computeBudgetBreakdown(params: {
  budget: number;
  floors?: number;
}): BudgetBreakdown {
  const { budget, floors = 1 } = params;

  // ── Stage allocations (fixed percentages, always sum to 100%) ────────────
  const stageAllocations: StageAllocation[] = STAGE_PAYMENT_ALLOCATIONS.map(
    ({ stage, name, pct }) => ({
      stage,
      name,
      percentage: pct,
      amount: Math.round((pct / 100) * budget),
    }),
  );

  // ── Section breakdown ────────────────────────────────────────────────────
  // Section 400 (Upper Floor Elevation) scales with additional floors.
  // Base: 15% shared by ground + upper. Each upper floor adds proportionally.
  // For a bungalow (floors=1), section 400 = 0.
  const additionalFloors = Math.max(0, floors - 1);
  const hasUpperFloors = additionalFloors > 0;

  // Adjust section 400 percentage if no upper floors
  const adjustedPercentages: Record<CostSectionCode, number> = {
    ...COST_SECTION_PERCENTAGES,
  };

  if (!hasUpperFloors) {
    // Redistribute section 400 percentage into sections 300 and 500
    const freed = adjustedPercentages[400];
    adjustedPercentages[400] = 0;
    adjustedPercentages[300] += Math.round(freed * 0.6);
    adjustedPercentages[500] += freed - Math.round(freed * 0.6);
  } else if (additionalFloors > 1) {
    // Scale up section 400 for multiple upper floors (diminishing returns)
    const floorScaling = 1 + (additionalFloors - 1) * 0.4;
    const extra = Math.round(adjustedPercentages[400] * (floorScaling - 1));
    adjustedPercentages[400] += extra;
    // Proportionally reduce other sections to keep total at 100%
    const totalOver = extra;
    const reducible: CostSectionCode[] = [300, 600, 800, 900];
    const perSection = Math.floor(totalOver / reducible.length);
    reducible.forEach((code) => {
      adjustedPercentages[code] = Math.max(1, adjustedPercentages[code] - perSection);
    });
  }

  const sectionBreakdown: SectionAllocation[] = COST_SECTIONS.map(
    ({ code, name, isPerFloor }) => {
      const pct = adjustedPercentages[code];
      return {
        code,
        name,
        percentage: pct,
        amount: Math.round((pct / 100) * budget),
        isPerFloor,
      };
    },
  );

  const sectionMap: Record<number, number> = {};
  sectionBreakdown.forEach(({ code, amount }) => {
    sectionMap[code] = amount;
  });

  return {
    totalBudget: budget,
    stageAllocations,
    sectionBreakdown,
    sectionMap,
  };
}

/**
 * Format a currency amount for display.
 * Uses Intl.NumberFormat — handles NGN, GHS, KES, etc.
 */
export function formatCurrency(
  amount: number,
  currencyCode: string,
  options?: { compact?: boolean },
): string {
  if (options?.compact) {
    if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}B`;
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // Fallback if currency code is unknown
    return `${amount.toLocaleString()}`;
  }
}
