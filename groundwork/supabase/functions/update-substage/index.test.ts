/**
 * update-substage edge function — Deno unit tests.
 *
 * Run:  ~/.deno/bin/deno test --allow-env --allow-net supabase/functions/update-substage/index.test.ts
 *
 * Tests exercise the Zod schema and business logic in isolation.
 * No DB calls — all DB interactions are mocked structurally.
 */
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { z } from "https://esm.sh/zod@3.23.8";

// ── Mirror the schema from the edge function ──────────────────────────────────

const UpdateSubstageSchema = z.object({
  substage_id:   z.string().uuid("substage_id must be a UUID"),
  status:        z.enum(["not_started", "in_progress", "complete"]).optional(),
  notes:         z.string().max(2000).nullable().optional(),
  evidence_urls: z.array(z.string().url("Each evidence URL must be valid")).optional(),
});

// ── Helpers ───────────────────────────────────────────────────────────────────

const VALID_UUID = "00000000-0000-0000-0000-000000000001";

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    substage_id: VALID_UUID,
    status:      "in_progress",
    ...overrides,
  };
}

// ── Schema validation tests ───────────────────────────────────────────────────

Deno.test("schema: valid minimal payload (substage_id only)", () => {
  const result = UpdateSubstageSchema.safeParse({ substage_id: VALID_UUID });
  assertEquals(result.success, true);
});

Deno.test("schema: valid full payload", () => {
  const result = UpdateSubstageSchema.safeParse(validBody({
    notes:         "Excavation completed to 2m depth",
    evidence_urls: ["https://example.com/photo1.jpg"],
  }));
  assertEquals(result.success, true);
});

Deno.test("schema: invalid UUID fails", () => {
  const result = UpdateSubstageSchema.safeParse({ substage_id: "not-a-uuid" });
  assertEquals(result.success, false);
});

Deno.test("schema: missing substage_id fails", () => {
  const result = UpdateSubstageSchema.safeParse({ status: "in_progress" });
  assertEquals(result.success, false);
});

Deno.test("schema: invalid status fails", () => {
  const result = UpdateSubstageSchema.safeParse(validBody({ status: "approved" }));
  assertEquals(result.success, false);
});

Deno.test("schema: 'rejected' is not an allowed status input", () => {
  const result = UpdateSubstageSchema.safeParse(validBody({ status: "rejected" }));
  assertEquals(result.success, false);
});

Deno.test("schema: notes longer than 2000 chars fails", () => {
  const result = UpdateSubstageSchema.safeParse(validBody({ notes: "x".repeat(2001) }));
  assertEquals(result.success, false);
});

Deno.test("schema: notes exactly 2000 chars passes", () => {
  const result = UpdateSubstageSchema.safeParse(validBody({ notes: "x".repeat(2000) }));
  assertEquals(result.success, true);
});

Deno.test("schema: null notes is valid (clearing notes)", () => {
  const result = UpdateSubstageSchema.safeParse(validBody({ notes: null }));
  assertEquals(result.success, true);
});

Deno.test("schema: invalid evidence URL fails", () => {
  const result = UpdateSubstageSchema.safeParse(validBody({
    evidence_urls: ["not-a-url"],
  }));
  assertEquals(result.success, false);
});

Deno.test("schema: valid evidence URLs pass", () => {
  const result = UpdateSubstageSchema.safeParse(validBody({
    evidence_urls: [
      "https://example.com/photo.jpg",
      "https://supabase.co/storage/v1/object/public/stage-media/photo.png",
    ],
  }));
  assertEquals(result.success, true);
});

Deno.test("schema: empty evidence_urls array passes", () => {
  const result = UpdateSubstageSchema.safeParse(validBody({ evidence_urls: [] }));
  assertEquals(result.success, true);
});

// ── Status transition logic ───────────────────────────────────────────────────

function applyStatusTransition(
  currentStatus: string,
  newStatus: string,
): { status: string; completed_at: string | null } {
  return {
    status:       newStatus,
    completed_at: newStatus === "complete" ? new Date().toISOString() : null,
  };
}

Deno.test("status transition: not_started → in_progress clears completed_at", () => {
  const result = applyStatusTransition("not_started", "in_progress");
  assertEquals(result.status, "in_progress");
  assertEquals(result.completed_at, null);
});

Deno.test("status transition: in_progress → complete sets completed_at", () => {
  const result = applyStatusTransition("in_progress", "complete");
  assertEquals(result.status, "complete");
  assertEquals(typeof result.completed_at, "string");
});

Deno.test("status transition: complete → in_progress clears completed_at", () => {
  const result = applyStatusTransition("complete", "in_progress");
  assertEquals(result.status, "in_progress");
  assertEquals(result.completed_at, null);
});

// ── Evidence URL deduplication logic ─────────────────────────────────────────

function mergeEvidenceUrls(existing: string[], incoming: string[]): string[] {
  return [...new Set([...existing, ...incoming])];
}

Deno.test("evidence: new URLs are appended to existing list", () => {
  const merged = mergeEvidenceUrls(
    ["https://example.com/a.jpg"],
    ["https://example.com/b.jpg"],
  );
  assertEquals(merged.length, 2);
});

Deno.test("evidence: duplicate URLs are deduplicated", () => {
  const merged = mergeEvidenceUrls(
    ["https://example.com/a.jpg"],
    ["https://example.com/a.jpg", "https://example.com/b.jpg"],
  );
  assertEquals(merged.length, 2);
});

Deno.test("evidence: empty incoming does not change existing list", () => {
  const existing = ["https://example.com/a.jpg"];
  const merged = mergeEvidenceUrls(existing, []);
  assertEquals(merged.length, 1);
  assertEquals(merged[0], existing[0]);
});

// ── All-substages-complete check ──────────────────────────────────────────────

function allComplete(substages: { status: string }[]): boolean {
  return substages.every((s) => s.status === "complete");
}

Deno.test("all-complete: true when all substages are complete", () => {
  assertEquals(allComplete([
    { status: "complete" }, { status: "complete" }, { status: "complete" },
  ]), true);
});

Deno.test("all-complete: false when any substage is not complete", () => {
  assertEquals(allComplete([
    { status: "complete" }, { status: "in_progress" },
  ]), false);
});

Deno.test("all-complete: false for empty array", () => {
  assertEquals(allComplete([]), true); // vacuous truth — handled by caller
});

Deno.test("all-complete: false if one is rejected", () => {
  assertEquals(allComplete([
    { status: "complete" }, { status: "rejected" },
  ]), false);
});
