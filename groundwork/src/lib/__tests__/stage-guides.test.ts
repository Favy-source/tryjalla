import { describe, it, expect } from "vitest";
import { STAGE_GUIDES, getSubstageGuide, getStageGuide } from "@/lib/stage-guides";

describe("STAGE_GUIDES", () => {
  it("has entries for all 10 stages", () => {
    for (let i = 1; i <= 10; i++) {
      expect(STAGE_GUIDES[i], `Stage ${i} missing`).toBeDefined();
    }
  });

  it("every stage has a non-empty overview", () => {
    Object.entries(STAGE_GUIDES).forEach(([n, g]) => {
      expect(g.overview.length, `Stage ${n} overview empty`).toBeGreaterThan(0);
    });
  });

  it("every stage has at least 3 before-approve checklist items", () => {
    Object.entries(STAGE_GUIDES).forEach(([n, g]) => {
      expect(g.beforeApprove.length, `Stage ${n} beforeApprove too short`).toBeGreaterThanOrEqual(3);
    });
  });

  it("every substage guide has whatToCheck, evidenceToCapture, and redFlags", () => {
    Object.entries(STAGE_GUIDES).forEach(([stageNum, stage]) => {
      Object.entries(stage.substages).forEach(([subNum, sub]) => {
        expect(sub.whatToCheck.length,      `Stage ${stageNum} sub ${subNum}: whatToCheck empty`).toBeGreaterThan(0);
        expect(sub.evidenceToCapture.length, `Stage ${stageNum} sub ${subNum}: evidenceToCapture empty`).toBeGreaterThan(0);
        expect(sub.redFlags.length,          `Stage ${stageNum} sub ${subNum}: redFlags empty`).toBeGreaterThan(0);
      });
    });
  });

  it("stage 4 (Foundation) has 7 substage guides", () => {
    expect(Object.keys(STAGE_GUIDES[4].substages)).toHaveLength(7);
  });

  it("stage 10 (Final Handover) has 3 substage guides", () => {
    expect(Object.keys(STAGE_GUIDES[10].substages)).toHaveLength(3);
  });

  it("beforeApprove items are non-empty strings", () => {
    Object.entries(STAGE_GUIDES).forEach(([n, g]) => {
      g.beforeApprove.forEach((item, i) => {
        expect(item.trim().length, `Stage ${n} item ${i} is empty`).toBeGreaterThan(0);
      });
    });
  });
});

describe("getSubstageGuide", () => {
  it("returns guide for known stage/substage", () => {
    const guide = getSubstageGuide(4, 1);
    expect(guide).not.toBeNull();
    expect(guide!.whatToCheck.length).toBeGreaterThan(0);
  });

  it("returns null for unknown stage", () => {
    expect(getSubstageGuide(99, 1)).toBeNull();
  });

  it("returns null for unknown substage in a known stage", () => {
    expect(getSubstageGuide(1, 99)).toBeNull();
  });

  it("stage 4 substage 4 (Reinforced concrete footings) has a tip", () => {
    const guide = getSubstageGuide(4, 4);
    expect(guide?.tip).toBeDefined();
    expect(guide!.tip!.length).toBeGreaterThan(0);
  });
});

describe("getStageGuide", () => {
  it("returns stage 1 guide", () => {
    const guide = getStageGuide(1);
    expect(guide).not.toBeNull();
    expect(guide!.whyItMatters.length).toBeGreaterThan(0);
  });

  it("returns null for out-of-range stage", () => {
    expect(getStageGuide(11)).toBeNull();
  });
});
