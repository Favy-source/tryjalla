/**
 * _shared/auth.ts — Auth utilities for every edge function.
 *
 * Import pattern (from a sibling function):
 *   import { getSupabaseClient, getServiceClient, requireAuth, requireRole, requireMinTier } from "../_shared/auth.ts";
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── Clients ───────────────────────────────────────────────────────────────────

/** User-scoped client — respects RLS, validates JWT via Authorization header. */
export function getSupabaseClient(req: Request) {
  const authHeader = req.headers.get("Authorization");
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader ?? "" } } },
  );
}

/** Service-role client — bypasses RLS. Use ONLY for cross-user operations. */
export function getServiceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

// ── Auth checks ───────────────────────────────────────────────────────────────

/** Verify JWT and return the authenticated user. Throws 401 if not authed. */
export async function requireAuth(req: Request) {
  const client = getSupabaseClient(req);
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) {
    throw new AuthError("Unauthorized", 401);
  }
  return { user, client };
}

/**
 * Require the authenticated user to have a specific role.
 * Reads from user_roles via service client (cannot be spoofed by the caller).
 */
export async function requireRole(req: Request, role: string) {
  const { user, client } = await requireAuth(req);
  const svc = getServiceClient();

  const { data: roles } = await svc
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  if (!roles?.some((r: { role: string }) => r.role === role)) {
    throw new AuthError(`Missing role: ${role}`, 403);
  }
  return { user, client };
}

/**
 * Require the authenticated user to be on a tier >= minTier.
 * Tier order: self_serve < hybrid < full_service.
 */
export async function requireMinTier(req: Request, minTier: string) {
  const { user, client } = await requireAuth(req);
  const svc = getServiceClient();

  const TIER_ORDER = ["self_serve", "hybrid", "full_service"];

  const { data: profile } = await svc
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single();

  if (
    !profile ||
    TIER_ORDER.indexOf(profile.subscription_tier) < TIER_ORDER.indexOf(minTier)
  ) {
    throw new AuthError(`Requires ${minTier} tier or higher`, 403);
  }
  return { user, client, tier: profile.subscription_tier as string };
}

/** Get all roles for a user_id via service client. */
export async function getUserRoles(userId: string): Promise<string[]> {
  const svc = getServiceClient();
  const { data } = await svc
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  return (data ?? []).map((r: { role: string }) => r.role);
}

// ── Response helpers ──────────────────────────────────────────────────────────

export function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function errorResponse(message: string, status = 400) {
  return json({ error: message }, status);
}

// ── Error types ───────────────────────────────────────────────────────────────

export class AuthError extends Error {
  constructor(message: string, public status: number = 401) {
    super(message);
    this.name = "AuthError";
  }
}

export class ValidationError extends Error {
  constructor(message: string, public details?: unknown) {
    super(message);
    this.name = "ValidationError";
  }
}
