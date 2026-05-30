/**
 * record-payment — Deno unit tests.
 *
 * Run: ~/.deno/bin/deno test --allow-env --allow-net supabase/functions/record-payment/index.test.ts
 */
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { z } from "https://esm.sh/zod@3.23.8";

// ── Mirror schema ─────────────────────────────────────────────────────────────

const RecordPaymentSchema = z.object({
  stage_id:       z.string().uuid("stage_id must be a UUID"),
  amount:         z.number().positive("Amount must be positive"),
  currency:       z.string().length(3, "Currency must be a 3-letter code").default("NGN"),
  payment_method: z.enum(["bank_transfer", "cash", "mobile_money", "cheque", "other"]).optional(),
  receipt_url:    z.string().url("receipt_url must be a valid URL").optional(),
  notes:          z.string().max(500, "Notes must be 500 chars or fewer").optional(),
  paid_at:        z.string().regex(/^\d{4}-\d{2}-\d{2}/, "paid_at must be YYYY-MM-DD").optional(),
});

const VALID_UUID = "00000000-0000-0000-0000-000000000001";

// ── Schema validation ─────────────────────────────────────────────────────────

Deno.test("schema: minimal valid payload passes", () => {
  const r = RecordPaymentSchema.safeParse({ stage_id: VALID_UUID, amount: 1000000 });
  assertEquals(r.success, true);
});

Deno.test("schema: full valid payload passes", () => {
  const r = RecordPaymentSchema.safeParse({
    stage_id:       VALID_UUID,
    amount:         5000000,
    currency:       "NGN",
    payment_method: "bank_transfer",
    receipt_url:    "https://example.com/receipt.pdf",
    notes:          "First instalment for foundation work",
    paid_at:        "2026-05-27",
  });
  assertEquals(r.success, true);
});

Deno.test("schema: missing stage_id fails", () => {
  const r = RecordPaymentSchema.safeParse({ amount: 1000 });
  assertEquals(r.success, false);
});

Deno.test("schema: invalid stage_id UUID fails", () => {
  const r = RecordPaymentSchema.safeParse({ stage_id: "not-a-uuid", amount: 1000 });
  assertEquals(r.success, false);
});

Deno.test("schema: zero amount fails", () => {
  const r = RecordPaymentSchema.safeParse({ stage_id: VALID_UUID, amount: 0 });
  assertEquals(r.success, false);
});

Deno.test("schema: negative amount fails", () => {
  const r = RecordPaymentSchema.safeParse({ stage_id: VALID_UUID, amount: -500 });
  assertEquals(r.success, false);
});

Deno.test("schema: invalid payment_method fails", () => {
  const r = RecordPaymentSchema.safeParse({ stage_id: VALID_UUID, amount: 1000, payment_method: "wire" });
  assertEquals(r.success, false);
});

Deno.test("schema: all payment methods pass", () => {
  for (const method of ["bank_transfer", "cash", "mobile_money", "cheque", "other"] as const) {
    const r = RecordPaymentSchema.safeParse({ stage_id: VALID_UUID, amount: 1000, payment_method: method });
    assertEquals(r.success, true, `method '${method}' should pass`);
  }
});

Deno.test("schema: invalid receipt_url fails", () => {
  const r = RecordPaymentSchema.safeParse({ stage_id: VALID_UUID, amount: 1000, receipt_url: "not-a-url" });
  assertEquals(r.success, false);
});

Deno.test("schema: notes over 500 chars fails", () => {
  const r = RecordPaymentSchema.safeParse({ stage_id: VALID_UUID, amount: 1000, notes: "x".repeat(501) });
  assertEquals(r.success, false);
});

Deno.test("schema: notes exactly 500 chars passes", () => {
  const r = RecordPaymentSchema.safeParse({ stage_id: VALID_UUID, amount: 1000, notes: "x".repeat(500) });
  assertEquals(r.success, true);
});

Deno.test("schema: invalid paid_at format fails", () => {
  const r = RecordPaymentSchema.safeParse({ stage_id: VALID_UUID, amount: 1000, paid_at: "27/05/2026" });
  assertEquals(r.success, false);
});

Deno.test("schema: valid paid_at ISO date passes", () => {
  const r = RecordPaymentSchema.safeParse({ stage_id: VALID_UUID, amount: 1000, paid_at: "2026-05-27" });
  assertEquals(r.success, true);
});

Deno.test("schema: currency longer than 3 chars fails", () => {
  const r = RecordPaymentSchema.safeParse({ stage_id: VALID_UUID, amount: 1000, currency: "NAIRA" });
  assertEquals(r.success, false);
});

// ── Payment status derivation logic ──────────────────────────────────────────

function deriveStatus(totalPaid: number, stagePaymentAmount: number | null): string {
  if (!stagePaymentAmount || stagePaymentAmount <= 0) return "partial";
  if (totalPaid >= stagePaymentAmount) return "paid";
  if (totalPaid > 0) return "partial";
  return "pending";
}

Deno.test("status: 0 paid → pending", () => {
  assertEquals(deriveStatus(0, 12_750_000), "pending");
});

Deno.test("status: partial payment → partial", () => {
  assertEquals(deriveStatus(5_000_000, 12_750_000), "partial");
});

Deno.test("status: exact full payment → paid", () => {
  assertEquals(deriveStatus(12_750_000, 12_750_000), "paid");
});

Deno.test("status: overpayment → paid", () => {
  assertEquals(deriveStatus(15_000_000, 12_750_000), "paid");
});

Deno.test("status: null stage_amount → partial (no invoice yet)", () => {
  assertEquals(deriveStatus(5_000, null), "partial");
});

// ── Total paid aggregation ────────────────────────────────────────────────────

function sumPaymentEvents(events: { amount: number }[]): number {
  return events.reduce((sum, e) => sum + Number(e.amount), 0);
}

Deno.test("total: sums multiple payment events", () => {
  assertEquals(sumPaymentEvents([
    { amount: 3_000_000 },
    { amount: 2_000_000 },
    { amount: 1_000_000 },
  ]), 6_000_000);
});

Deno.test("total: empty events = 0", () => {
  assertEquals(sumPaymentEvents([]), 0);
});

Deno.test("total: single event", () => {
  assertEquals(sumPaymentEvents([{ amount: 12_750_000 }]), 12_750_000);
});
