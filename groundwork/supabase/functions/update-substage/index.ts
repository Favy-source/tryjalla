/**
 * update-substage — Update a single project substage.
 *
 * Allowed callers:
 *   - Project owner (any substage in their project)
 *   - jala_professional assigned to the project
 *   - admin / super_admin
 *
 * Allowed updates:
 *   - status: not_started | in_progress | complete
 *     (rejected is set by approve-stage only — not here)
 *   - notes: free-text field note
 *   - evidence_urls: append new URLs to the existing array
 *     (full evidence file upload via Storage is handled client-side)
 *
 * Side effects:
 *   - If status → complete: sets completed_at = now()
 *   - If status ← complete: clears completed_at
 *   - After update: checks whether ALL substages for the parent stage
 *     are now complete and returns `all_substages_complete` flag so the
 *     client can prompt the owner to submit for approval.
 *   - Writes to audit_log
 *
 * Returns: { substage, all_substages_complete }
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

const UpdateSubstageSchema = z.object({
  substage_id:   z.string().uuid("substage_id must be a UUID"),
  status:        z.enum(["not_started", "in_progress", "complete"]).optional(),
  notes:         z.string().max(2000).nullable().optional(),
  evidence_urls: z.array(z.string().url("Each evidence URL must be valid")).optional(),
});

type UpdateSubstageInput = z.infer<typeof UpdateSubstageSchema>;

// ── Permission check ──────────────────────────────────────────────────────────

async function assertCanUpdate(
  svc: ReturnType<typeof getServiceClient>,
  userId: string,
  substageId: string,
): Promise<{ substage: Record<string, unknown>; projectOwnerId: string }> {
  // Fetch substage → stage → project in one query
  const { data, error } = await svc
    .from("project_substages")
    .select(`
      *,
      projects ( id, owner_id, assigned_professional_id )
    `)
    .eq("id", substageId)
    .single();

  if (error || !data) throw new Error("Substage not found", { cause: 404 });

  const project = (data as Record<string, unknown>).projects as {
    id: string;
    owner_id: string;
    assigned_professional_id: string | null;
  };

  // Check calling user is owner, assigned professional, admin, or super_admin
  const isOwner      = project.owner_id === userId;
  const isAssigned   = project.assigned_professional_id === userId;

  if (!isOwner && !isAssigned) {
    // Check if user has admin/super_admin/jala_professional role
    const { data: roles } = await svc
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    const userRoles = (roles ?? []).map((r: { role: string }) => r.role);
    const hasPrivRole = userRoles.some((r) =>
      ["admin", "super_admin", "jala_professional"].includes(r)
    );

    if (!hasPrivRole) {
      throw new AuthError("Not authorised to update this substage", 403);
    }
  }

  return { substage: data as Record<string, unknown>, projectOwnerId: project.owner_id };
}

// ── Stage completion check ────────────────────────────────────────────────────

async function checkAllSubstagesComplete(
  svc: ReturnType<typeof getServiceClient>,
  stageId: string,
): Promise<boolean> {
  const { data, error } = await svc
    .from("project_substages")
    .select("status")
    .eq("stage_id", stageId);

  if (error || !data) return false;
  return (data as { status: string }[]).every((s) => s.status === "complete");
}

// ── Handler ───────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, content-type",
        "Access-Control-Allow-Methods": "PATCH, OPTIONS",
      },
    });
  }

  if (req.method !== "PATCH") return errorResponse("Method not allowed", 405);

  try {
    const { user } = await requireAuth(req);
    const svc = getServiceClient();
    const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? null;

    // Parse + validate
    let rawBody: unknown;
    try { rawBody = await req.json(); }
    catch { return errorResponse("Invalid JSON body"); }

    const parsed = UpdateSubstageSchema.safeParse(rawBody);
    if (!parsed.success) {
      return errorResponse(
        "Validation failed: " + parsed.error.issues.map((i) => i.message).join("; "),
        422,
      );
    }

    const input: UpdateSubstageInput = parsed.data;

    // Permission check
    const { substage } = await assertCanUpdate(svc, user.id, input.substage_id);

    // Reject attempts to set status = 'rejected' via this endpoint
    // (rejected is set by approve-stage only)
    if ((input.status as string) === "rejected") {
      return errorResponse("Use approve-stage to reject a substage", 400);
    }

    // Build update payload
    const update: Record<string, unknown> = {};

    if (input.status !== undefined) {
      update.status = input.status;
      update.completed_at = input.status === "complete" ? new Date().toISOString() : null;
    }

    if (input.notes !== undefined) {
      update.notes = input.notes;
    }

    if (input.evidence_urls !== undefined && input.evidence_urls.length > 0) {
      // Append to existing evidence_urls
      const existingUrls = (substage.evidence_urls as string[]) ?? [];
      const newUrls = [...new Set([...existingUrls, ...input.evidence_urls])];
      update.evidence_urls = newUrls;
    }

    // If clearing rejection — reset rejection fields
    if (
      input.status === "in_progress" &&
      (substage.status as string) === "rejected"
    ) {
      update.rejection_note    = null;
      update.rejected_at       = null;
      update.rejected_by       = null;
      update.requires_reupload = false;
    }

    // If nothing to update, return early
    if (Object.keys(update).length === 0) {
      return json({ substage, all_substages_complete: false });
    }

    // Execute update
    const { data: updated, error: updateErr } = await svc
      .from("project_substages")
      .update(update)
      .eq("id", input.substage_id)
      .select()
      .single();

    if (updateErr || !updated) {
      console.error("[update-substage] update error:", updateErr);
      return errorResponse("Failed to update substage", 500);
    }

    // Check if all substages in the parent stage are now complete
    const stageId = (updated as Record<string, unknown>).stage_id as string;
    const allComplete = await checkAllSubstagesComplete(svc, stageId);

    // Audit log
    await svc.from("audit_log").insert({
      actor_id:    user.id,
      entity_type: "substage",
      entity_id:   input.substage_id,
      action:      "updated",
      metadata: {
        status_change: input.status
          ? { from: substage.status, to: input.status }
          : null,
        evidence_added: input.evidence_urls?.length ?? 0,
        notes_updated:  input.notes !== undefined,
      },
      ip_address: ip,
      diff: {
        before: { status: substage.status, notes: substage.notes },
        after:  { status: input.status ?? substage.status, notes: input.notes ?? substage.notes },
      },
    });

    return json({ substage: updated, all_substages_complete: allComplete });
  } catch (err) {
    if (err instanceof AuthError) return errorResponse(err.message, err.status);
    const cause = (err as Error & { cause?: unknown }).cause;
    if (cause === 404) return errorResponse("Substage not found", 404);
    console.error("[update-substage] unhandled:", err);
    return errorResponse("Internal server error", 500);
  }
});
