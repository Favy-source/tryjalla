/**
 * document-share — Deno unit tests.
 *
 * Run: ~/.deno/bin/deno test --allow-env --allow-net supabase/functions/document-share/index.test.ts
 */
import { assertEquals, assertMatch } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { z } from "https://esm.sh/zod@3.23.8";

// ── Mirror schema ─────────────────────────────────────────────────────────────

const CreateShareSchema = z.object({
  document_id:     z.string().uuid(),
  expires_in_days: z.number().int().min(1).max(30).default(7),
});

const VALID_UUID = "00000000-0000-0000-0000-000000000001";

// ── Schema validation ─────────────────────────────────────────────────────────

Deno.test("schema: valid minimal payload", () => {
  const r = CreateShareSchema.safeParse({ document_id: VALID_UUID });
  assertEquals(r.success, true);
  assertEquals((r.data as { expires_in_days: number }).expires_in_days, 7);
});

Deno.test("schema: custom expiry within range", () => {
  const r = CreateShareSchema.safeParse({ document_id: VALID_UUID, expires_in_days: 14 });
  assertEquals(r.success, true);
});

Deno.test("schema: missing document_id fails", () => {
  const r = CreateShareSchema.safeParse({ expires_in_days: 7 });
  assertEquals(r.success, false);
});

Deno.test("schema: invalid UUID fails", () => {
  const r = CreateShareSchema.safeParse({ document_id: "not-a-uuid" });
  assertEquals(r.success, false);
});

Deno.test("schema: expires_in_days = 0 fails (minimum is 1)", () => {
  const r = CreateShareSchema.safeParse({ document_id: VALID_UUID, expires_in_days: 0 });
  assertEquals(r.success, false);
});

Deno.test("schema: expires_in_days = 31 fails (maximum is 30)", () => {
  const r = CreateShareSchema.safeParse({ document_id: VALID_UUID, expires_in_days: 31 });
  assertEquals(r.success, false);
});

Deno.test("schema: expires_in_days = 30 passes", () => {
  const r = CreateShareSchema.safeParse({ document_id: VALID_UUID, expires_in_days: 30 });
  assertEquals(r.success, true);
});

Deno.test("schema: expires_in_days = 1 passes", () => {
  const r = CreateShareSchema.safeParse({ document_id: VALID_UUID, expires_in_days: 1 });
  assertEquals(r.success, true);
});

// ── Token generation ──────────────────────────────────────────────────────────

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.test("token: is 64 hex characters", () => {
  const token = generateToken();
  assertEquals(token.length, 64);
  assertMatch(token, /^[0-9a-f]{64}$/);
});

Deno.test("token: two generated tokens are unique", () => {
  const a = generateToken();
  const b = generateToken();
  assertEquals(a === b, false);
});

// ── Token expiry logic ────────────────────────────────────────────────────────

function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date();
}

function makeExpiry(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString();
}

Deno.test("expiry: future date is not expired", () => {
  assertEquals(isExpired(makeExpiry(7)), false);
});

Deno.test("expiry: past date is expired", () => {
  assertEquals(isExpired(makeExpiry(-1)), true);
});

Deno.test("expiry: 7 days from now is in the future", () => {
  const expires = makeExpiry(7);
  assertEquals(new Date(expires) > new Date(), true);
});

Deno.test("expiry: 30 days max expiry is valid", () => {
  const expires = makeExpiry(30);
  assertEquals(isExpired(expires), false);
});

// ── Share URL construction ────────────────────────────────────────────────────

function buildShareUrl(siteUrl: string, token: string): string {
  return `${siteUrl}/share/${token}`;
}

Deno.test("share URL: uses SITE_URL + /share/ prefix", () => {
  const url = buildShareUrl("http://localhost:5173", "abc123");
  assertEquals(url, "http://localhost:5173/share/abc123");
});

Deno.test("share URL: works with production domain", () => {
  const url = buildShareUrl("https://groundwork.tryjalla.com", "abc123");
  assertEquals(url, "https://groundwork.tryjalla.com/share/abc123");
});
