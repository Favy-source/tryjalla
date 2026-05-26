import { describe, it, expect } from "vitest";
import {
  TIER_FEATURES,
  TIER_ORDER,
  meetsMinTier,
  getTierFeatures,
  type Tier,
} from "@/lib/tier-features";

describe("TIER_FEATURES", () => {
  it("defines all three tiers", () => {
    expect(TIER_FEATURES.self_serve).toBeDefined();
    expect(TIER_FEATURES.hybrid).toBeDefined();
    expect(TIER_FEATURES.full_service).toBeDefined();
  });

  it("self_serve: free, max 1 contractor per project, no certificates", () => {
    const t = TIER_FEATURES.self_serve;
    expect(t.price).toBe(0);
    expect(t.maxContractorsPerProject).toBe(1);
    expect(t.certificatesIssued).toBe(false);
    expect(t.stageApproval).toBe("self");
  });

  it("hybrid: $199/mo, professional approves, certificates issued", () => {
    const t = TIER_FEATURES.hybrid;
    expect(t.price).toBe(199);
    expect(t.stageApproval).toBe("professional");
    expect(t.certificatesIssued).toBe(true);
    expect(t.maxContractorsPerProject).toBe(Infinity);
  });

  it("full_service: custom price, admin approves, certificates issued", () => {
    const t = TIER_FEATURES.full_service;
    expect(t.price).toBeNull();
    expect(t.stageApproval).toBe("admin");
    expect(t.certificatesIssued).toBe(true);
    expect(t.upgradeRequiresApproval).toBe(true);
  });
});

describe("TIER_ORDER", () => {
  it("is ordered from lowest to highest tier", () => {
    expect(TIER_ORDER).toEqual(["self_serve", "hybrid", "full_service"]);
  });
});

describe("meetsMinTier", () => {
  it("same tier meets itself", () => {
    const tiers: Tier[] = ["self_serve", "hybrid", "full_service"];
    tiers.forEach((t) => expect(meetsMinTier(t, t)).toBe(true));
  });

  it("higher tier meets lower minimum", () => {
    expect(meetsMinTier("hybrid", "self_serve")).toBe(true);
    expect(meetsMinTier("full_service", "self_serve")).toBe(true);
    expect(meetsMinTier("full_service", "hybrid")).toBe(true);
  });

  it("lower tier does NOT meet higher minimum", () => {
    expect(meetsMinTier("self_serve", "hybrid")).toBe(false);
    expect(meetsMinTier("self_serve", "full_service")).toBe(false);
    expect(meetsMinTier("hybrid", "full_service")).toBe(false);
  });
});

describe("getTierFeatures", () => {
  it("returns correct features for known tiers", () => {
    expect(getTierFeatures("self_serve")).toBe(TIER_FEATURES.self_serve);
    expect(getTierFeatures("hybrid")).toBe(TIER_FEATURES.hybrid);
    expect(getTierFeatures("full_service")).toBe(TIER_FEATURES.full_service);
  });

  it("falls back to self_serve for unknown tier strings", () => {
    expect(getTierFeatures("unknown_tier")).toBe(TIER_FEATURES.self_serve);
    expect(getTierFeatures("")).toBe(TIER_FEATURES.self_serve);
  });
});
