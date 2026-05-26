import { describe, it, expect } from "vitest";
import { SUBSTAGE_SEED, TOTAL_SUBSTAGES } from "@/lib/substage-seed";

describe("SUBSTAGE_SEED", () => {
  it("covers all 10 stages", () => {
    for (let i = 1; i <= 10; i++) {
      expect(SUBSTAGE_SEED[i]).toBeDefined();
      expect(SUBSTAGE_SEED[i].length).toBeGreaterThan(0);
    }
  });

  it("every substage has a name and description", () => {
    Object.values(SUBSTAGE_SEED).flat().forEach((s) => {
      expect(s.name.length).toBeGreaterThan(0);
      expect(s.description.length).toBeGreaterThan(0);
    });
  });

  it("total substage count is 60", () => {
    expect(TOTAL_SUBSTAGES).toBe(60);
  });

  it("stage 4 (Foundation) has 7 substages", () => {
    expect(SUBSTAGE_SEED[4]).toHaveLength(7);
  });

  it("stage 10 (Final Handover) has 3 substages", () => {
    expect(SUBSTAGE_SEED[10]).toHaveLength(3);
  });
});
