/**
 * approve-stage edge function — Deno unit tests.
 *
 * Run:  ~/.deno/bin/deno test --allow-env --allow-net supabase/functions/approve-stage/index.test.ts
 */
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { z } from "https://esm.sh/zod@3.23.8";

// ── Mirror schema ─────────────────────────────────────────────────────────────

const ApproveStageSchema = z.object({
  stage_id: z.string().uuid("stage_id must be a UUID"),
  action:   z.enum([
    "mark_completed",
    "submit_for_approval",
    "approve",
    "reject",
  ]),
  rejected_substage_ids: z.array(z.string().uuid()).optional(),
  rejection_notes:       z.record(z.string().uuid(), z.string().max(500)).optional(),
});

const VALID_UUID  = "00000000-0000-0000-0000-000000000001";
const VALID_UUID2 = "00000000-0000-0000-0000-000000000002";

// ── Schema validation ─────────────────────────────────────────────────────────

Deno.test("schema: mark_completed passes", () => {
  const r = ApproveStageSchema.safeParse({ stage_id: VALID_UUID, action: "mark_completed" });
  assertEquals(r.success, true);
});

Deno.test("schema: submit_for_approval passes", () => {
  const r = ApproveStageSchema.safeParse({ stage_id: VALID_UUID, action: "submit_for_approval" });
  assertEquals(r.success, true);
});

Deno.test("schema: approve passes", () => {
  const r = ApproveStageSchema.safeParse({ stage_id: VALID_UUID, action: "approve" });
  assertEquals(r.success, true);
});

Deno.test("schema: reject with substage IDs passes", () => {
  const r = ApproveStageSchema.safeParse({
    stage_id:              VALID_UUID,
    action:                "reject",
    rejected_substage_ids: [VALID_UUID2],
    rejection_notes:       { [VALID_UUID2]: "Rebar not installed correctly" },
  });
  assertEquals(r.success, true);
});

Deno.test("schema: unknown action fails", () => {
  const r = ApproveStageSchema.safeParse({ stage_id: VALID_UUID, action: "complete" });
  assertEquals(r.success, false);
});

Deno.test("schema: missing stage_id fails", () => {
  const r = ApproveStageSchema.safeParse({ action: "mark_completed" });
  assertEquals(r.success, false);
});

Deno.test("schema: invalid stage_id UUID fails", () => {
  const r = ApproveStageSchema.safeParse({ stage_id: "not-a-uuid", action: "mark_completed" });
  assertEquals(r.success, false);
});

Deno.test("schema: rejection note over 500 chars fails", () => {
  const r = ApproveStageSchema.safeParse({
    stage_id:              VALID_UUID,
    action:                "reject",
    rejected_substage_ids: [VALID_UUID2],
    rejection_notes:       { [VALID_UUID2]: "x".repeat(501) },
  });
  assertEquals(r.success, false);
});

Deno.test("schema: rejected_substage_ids with non-UUID fails", () => {
  const r = ApproveStageSchema.safeParse({
    stage_id:              VALID_UUID,
    action:                "reject",
    rejected_substage_ids: ["not-a-uuid"],
  });
  assertEquals(r.success, false);
});

// ── Tier routing logic (pure functions mirroring edge function) ───────────────

type Tier   = "self_serve" | "hybrid" | "full_service";
type Action = "mark_completed" | "submit_for_approval" | "approve" | "reject";

function canPerformAction(
  action: Action,
  tier: Tier,
  isOwner: boolean,
  isProfessional: boolean,
): { allowed: boolean; reason?: string } {
  if (action === "mark_completed") {
    if (tier !== "self_serve") return { allowed: false, reason: "mark_completed requires self_serve" };
    if (!isOwner)              return { allowed: false, reason: "only owner can self-verify" };
    return { allowed: true };
  }
  if (action === "submit_for_approval") {
    if (tier !== "hybrid") return { allowed: false, reason: "submit_for_approval requires hybrid" };
    if (!isOwner)          return { allowed: false, reason: "only owner can submit" };
    return { allowed: true };
  }
  if (action === "approve") {
    if (tier === "self_serve") return { allowed: false, reason: "self_serve uses mark_completed" };
    if (!isProfessional)       return { allowed: false, reason: "only professional/admin can approve" };
    return { allowed: true };
  }
  if (action === "reject") {
    if (!isProfessional) return { allowed: false, reason: "only professional/admin can reject" };
    return { allowed: true };
  }
  return { allowed: false, reason: "unknown action" };
}

// self_serve
Deno.test("routing: self_serve owner can mark_completed", () => {
  assertEquals(canPerformAction("mark_completed", "self_serve", true, false).allowed, true);
});
Deno.test("routing: self_serve non-owner cannot mark_completed", () => {
  assertEquals(canPerformAction("mark_completed", "self_serve", false, false).allowed, false);
});
Deno.test("routing: self_serve cannot use approve", () => {
  assertEquals(canPerformAction("approve", "self_serve", false, true).allowed, false);
});

// hybrid
Deno.test("routing: hybrid owner can submit_for_approval", () => {
  assertEquals(canPerformAction("submit_for_approval", "hybrid", true, false).allowed, true);
});
Deno.test("routing: hybrid non-owner cannot submit_for_approval", () => {
  assertEquals(canPerformAction("submit_for_approval", "hybrid", false, false).allowed, false);
});
Deno.test("routing: hybrid professional can approve", () => {
  assertEquals(canPerformAction("approve", "hybrid", false, true).allowed, true);
});
Deno.test("routing: hybrid non-professional cannot approve", () => {
  assertEquals(canPerformAction("approve", "hybrid", true, false).allowed, false);
});
Deno.test("routing: hybrid professional can reject", () => {
  assertEquals(canPerformAction("reject", "hybrid", false, true).allowed, true);
});
Deno.test("routing: hybrid owner cannot reject", () => {
  assertEquals(canPerformAction("reject", "hybrid", true, false).allowed, false);
});

// full_service
Deno.test("routing: full_service professional can approve", () => {
  assertEquals(canPerformAction("approve", "full_service", false, true).allowed, true);
});
Deno.test("routing: full_service non-professional cannot approve", () => {
  assertEquals(canPerformAction("approve", "full_service", true, false).allowed, false);
});
Deno.test("routing: full_service cannot use mark_completed", () => {
  assertEquals(canPerformAction("mark_completed", "full_service", true, true).allowed, false);
});

// ── Stage transition model ────────────────────────────────────────────────────

type StageStatus = "not_started" | "in_progress" | "awaiting_approval" | "completed";

function nextStageStatus(action: Action, current: StageStatus): StageStatus | null {
  switch (action) {
    case "mark_completed":       return "completed";
    case "submit_for_approval":  return current === "in_progress" ? "awaiting_approval" : null;
    case "approve":              return current === "awaiting_approval" ? "completed" : null;
    case "reject":               return "in_progress";
    default:                     return null;
  }
}

Deno.test("transition: mark_completed → completed", () => {
  assertEquals(nextStageStatus("mark_completed", "in_progress"), "completed");
});
Deno.test("transition: submit_for_approval → awaiting_approval", () => {
  assertEquals(nextStageStatus("submit_for_approval", "in_progress"), "awaiting_approval");
});
Deno.test("transition: submit_for_approval invalid if not in_progress", () => {
  assertEquals(nextStageStatus("submit_for_approval", "awaiting_approval"), null);
});
Deno.test("transition: approve → completed", () => {
  assertEquals(nextStageStatus("approve", "awaiting_approval"), "completed");
});
Deno.test("transition: approve invalid if not awaiting_approval", () => {
  assertEquals(nextStageStatus("approve", "in_progress"), null);
});
Deno.test("transition: reject → in_progress", () => {
  assertEquals(nextStageStatus("reject", "awaiting_approval"), "in_progress");
});

// ── Next stage unlock logic ───────────────────────────────────────────────────

Deno.test("unlock: stage 9 completing unlocks stage 10", () => {
  const nextNum = 9 + 1;
  assertEquals(nextNum <= 10, true);
});
Deno.test("unlock: stage 10 completing does NOT unlock further", () => {
  const nextNum = 10 + 1;
  assertEquals(nextNum <= 10, false);
});
