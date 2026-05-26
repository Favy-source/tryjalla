import { describe, it, expect } from "vitest";
import { computeBudgetBreakdown, formatCurrency } from "@/lib/budget-engine";
import { COST_SECTIONS } from "@/lib/floor-costs";
import { STAGE_PAYMENT_ALLOCATIONS } from "@/lib/constants";

describe("computeBudgetBreakdown", () => {
  const BUDGET = 50_000_000; // 50M NGN

  it("stage allocations sum to total budget", () => {
    const { stageAllocations, totalBudget } = computeBudgetBreakdown({ budget: BUDGET });
    const sum = stageAllocations.reduce((acc, s) => acc + s.amount, 0);
    // Allow ±10 rounding tolerance
    expect(Math.abs(sum - totalBudget)).toBeLessThanOrEqual(10);
  });

  it("stage percentages match STAGE_PAYMENT_ALLOCATIONS", () => {
    const { stageAllocations } = computeBudgetBreakdown({ budget: BUDGET });
    STAGE_PAYMENT_ALLOCATIONS.forEach(({ stage, pct }) => {
      const alloc = stageAllocations.find((s) => s.stage === stage);
      expect(alloc).toBeDefined();
      expect(alloc!.percentage).toBe(pct);
    });
  });

  it("returns all 10 stage allocations", () => {
    const { stageAllocations } = computeBudgetBreakdown({ budget: BUDGET });
    expect(stageAllocations).toHaveLength(10);
  });

  it("returns all 9 sections in breakdown", () => {
    const { sectionBreakdown } = computeBudgetBreakdown({ budget: BUDGET });
    expect(sectionBreakdown).toHaveLength(COST_SECTIONS.length);
  });

  it("section 400 is 0 for bungalow (1 floor)", () => {
    const { sectionBreakdown } = computeBudgetBreakdown({ budget: BUDGET, floors: 1 });
    const section400 = sectionBreakdown.find((s) => s.code === 400);
    expect(section400!.amount).toBe(0);
  });

  it("section 400 is non-zero for multi-floor", () => {
    const { sectionBreakdown } = computeBudgetBreakdown({ budget: BUDGET, floors: 2 });
    const section400 = sectionBreakdown.find((s) => s.code === 400);
    expect(section400!.amount).toBeGreaterThan(0);
  });

  it("sectionMap keys match section codes", () => {
    const { sectionMap, sectionBreakdown } = computeBudgetBreakdown({ budget: BUDGET });
    sectionBreakdown.forEach(({ code }) => {
      expect(sectionMap[code]).toBeDefined();
    });
  });

  it("handles zero budget gracefully", () => {
    const { stageAllocations } = computeBudgetBreakdown({ budget: 0 });
    stageAllocations.forEach((s) => expect(s.amount).toBe(0));
  });
});

describe("formatCurrency", () => {
  it("formats NGN", () => {
    const result = formatCurrency(50_000_000, "NGN");
    expect(result).toContain("50");
  });

  it("compact: formats millions", () => {
    expect(formatCurrency(50_000_000, "NGN", { compact: true })).toBe("50.0M");
  });

  it("compact: formats thousands", () => {
    expect(formatCurrency(500_000, "NGN", { compact: true })).toBe("500K");
  });

  it("compact: formats billions", () => {
    expect(formatCurrency(2_500_000_000, "NGN", { compact: true })).toBe("2.5B");
  });
});
