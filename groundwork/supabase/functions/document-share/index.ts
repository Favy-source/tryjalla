/**
 * document-share — Create or validate expiring share tokens for project documents.
 *
 * POST /document-share          → create a new share token (auth required)
 * GET  /document-share?token=X  → validate token + return document URL (public)
 *
 * Token format: 32-byte random hex string
 * Default expiry: 7 days (configurable up to 30 days)
 *
 * Returns (POST): { token, expires_at, share_url }
 * Returns (GET):  { document: { name, file_url, mime_type, category }, expires_at }
 */
import { z } from "https://esm.sh/zod@3.23.8";
import {
  requireAuth,
  getServiceClient,
  json,
  errorResponse,
  AuthError,
} from "../_shared/auth.ts";

// ── Schema ────────────────────────────────────────────────────────────────────

const CreateShareSchema = z.object({
  document_id: z.string().uuid("document_id must be a UUID"),
  expires_in_days: z.number().int().min(1).max(30).default(7),
});

// ── Token generation ──────────────────────────────────────────────────────────

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ── Handler ───────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, content-type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      },
    });
  }

  const svc = getServiceClient();
  const url = new URL(req.url);

  // ── GET: validate token (public — no auth required) ────────────────────────
  if (req.method === "GET") {
    const token = url.searchParams.get("token");
    if (!token) return errorResponse("token query parameter is required", 400);

    const { data: share, error } = await svc
      .from("document_shares")
      .select("expires_at, project_documents(id, name, file_url, mime_type, category)")
      .eq("token", token)
      .maybeSingle();

    if (error || !share) return errorResponse("Share link not found or has expired", 404);

    const expiresAt = new Date(share.expires_at);
    if (expiresAt < new Date()) {
      return errorResponse("This share link has expired", 410);
    }

    const doc = share.project_documents as Record<string, unknown>;
    return json({ document: doc, expires_at: share.expires_at });
  }

  // ── POST: create share token (auth required) ───────────────────────────────
  if (req.method !== "POST") return errorResponse("Method not allowed", 405);

  try {
    const { user } = await requireAuth(req);
    const ip = req.headers.get("x-forwarded-for") ?? null;

    let rawBody: unknown;
    try { rawBody = await req.json(); }
    catch { return errorResponse("Invalid JSON body"); }

    const parsed = CreateShareSchema.safeParse(rawBody);
    if (!parsed.success) {
      return errorResponse(
        "Validation failed: " + parsed.error.issues.map((i) => i.message).join("; "),
        422,
      );
    }

    const { document_id, expires_in_days } = parsed.data;

    // Verify caller has access to this document
    const { data: doc, error: docErr } = await svc
      .from("project_documents")
      .select("id, name, project_id, projects(owner_id, assigned_professional_id)")
      .eq("id", document_id)
      .single();

    if (docErr || !doc) return errorResponse("Document not found", 404);

    const project = (doc as Record<string, unknown>).projects as {
      owner_id: string;
      assigned_professional_id: string | null;
    };

    const isOwner    = user.id === project.owner_id;
    const isAssigned = user.id === project.assigned_professional_id;

    if (!isOwner && !isAssigned) {
      const { data: roles } = await svc
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      const hasPriv = (roles ?? []).some((r: { role: string }) =>
        ["admin", "super_admin", "jala_professional"].includes(r.role),
      );
      if (!hasPriv) return errorResponse("Not authorised to share this document", 403);
    }

    const token    = generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expires_in_days);

    await svc.from("document_shares").insert({
      document_id,
      token,
      expires_at: expiresAt.toISOString(),
      created_by: user.id,
    });

    // Audit log
    await svc.from("audit_log").insert({
      actor_id:    user.id,
      entity_type: "document",
      entity_id:   document_id,
      action:      "share_created",
      metadata:    { expires_in_days, expires_at: expiresAt.toISOString() },
      ip_address:  ip,
    });

    const shareUrl = `${Deno.env.get("SITE_URL") ?? "http://localhost:5173"}/share/${token}`;

    return json({ token, expires_at: expiresAt.toISOString(), share_url: shareUrl }, 201);
  } catch (err) {
    if (err instanceof AuthError) return errorResponse(err.message, err.status);
    console.error("[document-share] unhandled:", err);
    return errorResponse("Internal server error", 500);
  }
});
