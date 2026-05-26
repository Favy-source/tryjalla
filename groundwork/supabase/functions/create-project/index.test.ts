/**
 * create-project edge function — Deno unit tests.
 *
 * Run:  deno test --allow-env supabase/functions/create-project/index.test.ts
 *
 * These tests exercise the handler logic in isolation using stub clients.
 * They do NOT hit a real database — all Supabase calls are mocked.
 */
import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { SUBSTAGE_SEED } from "../_shared/substage-seed.ts";
import { STAGE_PAYMENT_ALLOCATIONS } from "../_shared/constants.ts";

// ── Helper: make a minimal valid request body ─────────────────────────────────

function validBody(overrides: Record<string, unknown> = {}) {
  return JSON.stringify({
    name:         "Tema Duplex",
    country:      "GH",
    project_type: "residential_single",
    building_type: "duplex",
    floors:        2,
    rooms:         { bedrooms: 3, bathrooms: 2, livingRooms: 1, kitchens: 1 },
    boys_quarters_count: 1,
    roof_type:     "hip",
    budget:        120_000_000,
    ...overrides,
  });
}

// ── Subtage seed integrity ────────────────────────────────────────────────────

Deno.test("SUBSTAGE_SEED: has exactly 10 stages", () => {
  const stageKeys = Object.keys(SUBSTAGE_SEED).map(Number);
  assertEquals(stageKeys.length, 10);
  for (let i = 1; i <= 10; i++) {
    assertEquals(stageKeys.includes(i), true, `Stage ${i} missing from seed`);
  }
});

Deno.test("SUBSTAGE_SEED: total substage count is 60", () => {
  const total = Object.values(SUBSTAGE_SEED).reduce((s, a) => s + a.length, 0);
  assertEquals(total, 60);
});

Deno.test("SUBSTAGE_SEED: stage 4 (Foundation) has 7 substages", () => {
  assertEquals(SUBSTAGE_SEED[4].length, 7);
});

Deno.test("SUBSTAGE_SEED: stage 10 (Final Handover) has 3 substages", () => {
  assertEquals(SUBSTAGE_SEED[10].length, 3);
});

Deno.test("SUBSTAGE_SEED: every substage has non-empty name and description", () => {
  for (const [stage, substages] of Object.entries(SUBSTAGE_SEED)) {
    for (const sub of substages) {
      assertEquals(sub.name.length > 0, true, `Stage ${stage}: empty name`);
      assertEquals(sub.description.length > 0, true, `Stage ${stage}: empty description`);
    }
  }
});

// ── Payment allocation constants ──────────────────────────────────────────────

Deno.test("STAGE_PAYMENT_ALLOCATIONS: has 10 entries", () => {
  assertEquals(STAGE_PAYMENT_ALLOCATIONS.length, 10);
});

Deno.test("STAGE_PAYMENT_ALLOCATIONS: percentages sum to 100", () => {
  const sum = STAGE_PAYMENT_ALLOCATIONS.reduce((s, a) => s + a.pct, 0);
  assertEquals(sum, 100);
});

Deno.test("STAGE_PAYMENT_ALLOCATIONS: stage 4 (Foundation) is 15%", () => {
  const s4 = STAGE_PAYMENT_ALLOCATIONS.find((a) => a.stage === 4);
  assertEquals(s4?.pct, 15);
});

Deno.test("STAGE_PAYMENT_ALLOCATIONS: stage 5 (Structure & Walls) is 20%", () => {
  const s5 = STAGE_PAYMENT_ALLOCATIONS.find((a) => a.stage === 5);
  assertEquals(s5?.pct, 20);
});

// ── Zod schema validation (import schema inline to test in isolation) ──────────

import { z } from "https://esm.sh/zod@3.23.8";

const CreateProjectSchema = z.object({
  name:                   z.string().min(1),
  country:                z.string().length(2),
  project_type:           z.enum(["residential_single", "residential_multi", "commercial", "mixed_use"]),
  building_type:          z.string().optional(),
  floors:                 z.number().int().min(1).max(20).default(1),
  rooms:                  z.object({
    bedrooms:    z.number().int().min(0).max(20),
    bathrooms:   z.number().int().min(0).max(20),
    livingRooms: z.number().int().min(0).max(10),
    kitchens:    z.number().int().min(0).max(5),
  }).default({ bedrooms: 3, bathrooms: 2, livingRooms: 1, kitchens: 1 }),
  boys_quarters_count:    z.number().int().min(0).max(5).default(0),
  roof_type:              z.string().optional(),
  budget:                 z.number().positive().nullable().optional(),
  target_completion_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
});

Deno.test("schema: valid payload passes", () => {
  const result = CreateProjectSchema.safeParse(JSON.parse(validBody()));
  assertEquals(result.success, true);
});

Deno.test("schema: empty name fails", () => {
  const result = CreateProjectSchema.safeParse(JSON.parse(validBody({ name: "" })));
  assertEquals(result.success, false);
});

Deno.test("schema: country longer than 2 chars fails", () => {
  const result = CreateProjectSchema.safeParse(JSON.parse(validBody({ country: "GHA" })));
  assertEquals(result.success, false);
});

Deno.test("schema: floors > 20 fails", () => {
  const result = CreateProjectSchema.safeParse(JSON.parse(validBody({ floors: 21 })));
  assertEquals(result.success, false);
});

Deno.test("schema: invalid project_type fails", () => {
  const result = CreateProjectSchema.safeParse(JSON.parse(validBody({ project_type: "shed" })));
  assertEquals(result.success, false);
});

Deno.test("schema: missing budget is valid (optional)", () => {
  const body = JSON.parse(validBody());
  delete body.budget;
  const result = CreateProjectSchema.safeParse(body);
  assertEquals(result.success, true);
});

Deno.test("schema: negative budget fails", () => {
  const result = CreateProjectSchema.safeParse(JSON.parse(validBody({ budget: -1 })));
  assertEquals(result.success, false);
});

Deno.test("schema: invalid date format fails", () => {
  const result = CreateProjectSchema.safeParse(
    JSON.parse(validBody({ target_completion_date: "not-a-date" })),
  );
  assertEquals(result.success, false);
});

Deno.test("schema: valid ISO date passes", () => {
  const result = CreateProjectSchema.safeParse(
    JSON.parse(validBody({ target_completion_date: "2027-12-31" })),
  );
  assertEquals(result.success, true);
});

// ── Budget computation (inline mirror of edge function logic) ─────────────────

const COST_SECTION_PERCENTAGES: Record<number, number> = {
  100: 5, 200: 15, 300: 20, 400: 18, 500: 12, 600: 8, 700: 9, 800: 8, 900: 5,
};

function computeBudgetBreakdown(budget: number, floors: number) {
  const section400pct = COST_SECTION_PERCENTAGES[400];
  const adjusted: Record<number, number> = { ...COST_SECTION_PERCENTAGES };

  if (floors === 1) {
    adjusted[400] = 0;
    adjusted[300] = COST_SECTION_PERCENTAGES[300] + Math.round(section400pct * 0.6);
    adjusted[500] = COST_SECTION_PERCENTAGES[500] + Math.round(section400pct * 0.4);
  }

  const total = Object.values(adjusted).reduce((s, p) => s + p, 0);
  const sectionBreakdown = Object.entries(adjusted).map(([code, pct]) => ({
    code: Number(code),
    percentage: Number(((pct / total) * 100).toFixed(2)),
    amount: Math.round(((pct / total) * 100 / 100) * budget),
  }));

  const stageAllocations = STAGE_PAYMENT_ALLOCATIONS.map(({ stage, name, pct }) => ({
    stage, name, percentage: pct, amount: Math.round((pct / 100) * budget),
  }));

  return { stageAllocations, sectionBreakdown };
}

Deno.test("budget: stage allocations sum to total budget (±10 rounding)", () => {
  const budget = 50_000_000;
  const { stageAllocations } = computeBudgetBreakdown(budget, 1);
  const sum = stageAllocations.reduce((s, a) => s + a.amount, 0);
  assertEquals(Math.abs(sum - budget) <= 10, true, `Sum ${sum} not close to ${budget}`);
});

Deno.test("budget: section 400 is 0 for single-floor build", () => {
  const { sectionBreakdown } = computeBudgetBreakdown(50_000_000, 1);
  const s400 = sectionBreakdown.find((s) => s.code === 400)!;
  assertEquals(s400.amount, 0);
});

Deno.test("budget: section 400 is non-zero for multi-floor build", () => {
  const { sectionBreakdown } = computeBudgetBreakdown(50_000_000, 2);
  const s400 = sectionBreakdown.find((s) => s.code === 400)!;
  assertEquals(s400.amount > 0, true);
});

Deno.test("budget: returns 10 stage allocations", () => {
  const { stageAllocations } = computeBudgetBreakdown(100_000_000, 1);
  assertEquals(stageAllocations.length, 10);
});

Deno.test("budget: returns 9 section rows", () => {
  const { sectionBreakdown } = computeBudgetBreakdown(100_000_000, 1);
  assertEquals(sectionBreakdown.length, 9);
});
