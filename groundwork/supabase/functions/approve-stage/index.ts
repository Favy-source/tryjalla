/**
 * approve-stage — Tier-aware stage approval / rejection routing.
 *
 * Actions by tier:
 *
 *   self_serve (Self Verify):
 *     "mark_completed" — owner only, no review. Stage completes immediately.
 *
 *   hybrid (Jalla Verify):
 *     "submit_for_approval" — owner only. Stage → awaiting_approval.
 *     "approve"             — jala_professional or admin. Stage completes + certificate stub.
 *     "reject"              — jala_professional or admin. Flags specific substages.
 *
 *   full_service (Jalla Management):
 *     "approve" / "reject"  — admin only. All client actions are performed by admin.
 *
 * After every action: writes audit_log + notification.
 * On complete: unlocks the next stage (stage_number + 1).
 * On reject:   sets substage.status = 'rejected' + rejection_note per substage.
 *
 * Returns: { stage, next_stage_unlocked }
 */
import { z } from "https://esm.sh/zod@3.23.8";
import {
  requireAuth,
  getServiceClient,
  getUserRoles,
  json,
  errorResponse,
  AuthError,
} from "../_shared/auth.ts";

// ── Schema ────────────────────────────────────────────────────────────────────

const ApproveStageSchema = z.object({
  stage_id: z.string().uuid("stage_id must be a UUID"),
  action:   z.enum([
    "mark_completed",       // self_serve owner
    "submit_for_approval",  // hybrid owner
    "approve",              // professional / admin
    "reject",               // professional / admin
  ]),
  // Required only for reject action
  rejected_substage_ids: z.array(z.string().uuid()).optional(),
  // Per-substage rejection notes: { [substage_id]: "note text" }
  rejection_notes: z.record(z.string().uuid(), z.string().max(500)).optional(),
});

type ApproveStageInput = z.infer<typeof ApproveStageSchema>;

// ── Stage helpers ─────────────────────────────────────────────────────────────

async function completeStage(
  svc: ReturnType<typeof getServiceClient>,
  stage: Record<string, unknown>,
): Promise<boolean> {
  await svc
    .from("stages")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", stage.id as string);

  const nextNum = (stage.stage_number as number) + 1;
  if (nextNum <= 10) {
    await svc
      .from("stages")
      .update({ is_locked: false, status: "in_progress" })
      .eq("project_id", stage.project_id as string)
      .eq("stage_number", nextNum);
    return true; // next stage unlocked
  }
  return false;
}

async function rejectSubstages(
  svc: ReturnType<typeof getServiceClient>,
  stageId: string,
  rejectedIds: string[],
  rejectionNotes: Record<string, string>,
  rejectedBy: string,
): Promise<void> {
  // Set stage back to in_progress
  await svc
    .from("stages")
    .update({ status: "in_progress" })
    .eq("id", stageId);

  // Flag each rejected substage
  for (const substageId of rejectedIds) {
    await svc
      .from("project_substages")
      .update({
        status:           "rejected",
        rejection_note:   rejectionNotes[substageId] ?? null,
        rejected_at:      new Date().toISOString(),
        rejected_by:      rejectedBy,
        requires_reupload: true,
        completed_at:     null,
      })
      .eq("id", substageId);
  }
}

async function insertNotification(
  svc: ReturnType<typeof getServiceClient>,
  userId: string,
  type: string,
  title: string,
  body: string,
  entityType: string,
  entityId: string,
): Promise<void> {
  await svc.from("notifications").insert({
    user_id:     userId,
    type,
    title,
    body,
    entity_type: entityType,
    entity_id:   entityId,
  });
}

// ── Handler ───────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  if (req.method !== "POST") return errorResponse("Method not allowed", 405);

  try {
    const { user } = await requireAuth(req);
    const svc = getServiceClient();
    const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? null;

    // Parse + validate
    let rawBody: unknown;
    try { rawBody = await req.json(); }
    catch { return errorResponse("Invalid JSON body"); }

    const parsed = ApproveStageSchema.safeParse(rawBody);
    if (!parsed.success) {
      return errorResponse(
        "Validation failed: " + parsed.error.issues.map((i) => i.message).join("; "),
        422,
      );
    }

    const input: ApproveStageInput = parsed.data;

    // Load stage + project + owner tier in one query
    const { data: stageRow, error: stageErr } = await svc
      .from("stages")
      .select("*, projects ( id, owner_id, assigned_professional_id, name )")
      .eq("id", input.stage_id)
      .single();

    if (stageErr || !stageRow) return errorResponse("Stage not found", 404);

    const stage   = stageRow as Record<string, unknown>;
    const project = stage.projects as {
      id: string;
      owner_id: string;
      assigned_professional_id: string | null;
      name: string;
    };

    // Load owner tier (always read from DB — never trust client)
    const { data: ownerProfile } = await svc
      .from("profiles")
      .select("subscription_tier")
      .eq("id", project.owner_id)
      .single();

    if (!ownerProfile) return errorResponse("Owner profile not found", 404);

    const tier = ownerProfile.subscription_tier as string;
    const callerRoles = await getUserRoles(user.id);
    const isOwner = user.id === project.owner_id;
    const isProfessional = callerRoles.some((r) =>
      ["jala_professional", "admin", "super_admin"].includes(r)
    );

    // Validate current stage status is compatible with action
    const currentStatus = stage.status as string;

    if (input.action === "mark_completed") {
      if (tier !== "self_serve") {
        return errorResponse("mark_completed is only valid for self_serve projects", 400);
      }
      if (!isOwner) {
        return errorResponse("Only the project owner can self-verify a stage", 403);
      }
      if (currentStatus === "completed") {
        return errorResponse("Stage is already completed", 400);
      }
    }

    if (input.action === "submit_for_approval") {
      if (tier !== "hybrid") {
        return errorResponse("submit_for_approval is only valid for hybrid tier projects", 400);
      }
      if (!isOwner) {
        return errorResponse("Only the project owner can submit for approval", 403);
      }
      if (currentStatus !== "in_progress") {
        return errorResponse(`Stage must be in_progress to submit (current: ${currentStatus})`, 400);
      }
    }

    if (input.action === "approve") {
      if (tier === "self_serve") {
        return errorResponse("self_serve projects use mark_completed, not approve", 400);
      }
      if (!isProfessional) {
        return errorResponse("Only a Jalla Professional or admin can approve stages", 403);
      }
      if (currentStatus !== "awaiting_approval") {
        return errorResponse(`Stage must be awaiting_approval to approve (current: ${currentStatus})`, 400);
      }
    }

    if (input.action === "reject") {
      if (!isProfessional) {
        return errorResponse("Only a Jalla Professional or admin can reject stages", 403);
      }
      if (!input.rejected_substage_ids || input.rejected_substage_ids.length === 0) {
        return errorResponse("rejected_substage_ids is required for reject action", 400);
      }
    }

    // Execute action
    let nextStageUnlocked = false;

    switch (input.action) {
      case "mark_completed": {
        nextStageUnlocked = await completeStage(svc, stage);
        await insertNotification(
          svc, project.owner_id, "stage_approved",
          `Stage ${stage.stage_number} completed`,
          `${stage.name} has been marked complete.${nextStageUnlocked ? ` Stage ${(stage.stage_number as number) + 1} is now active.` : ""}`,
          "stage", input.stage_id,
        );
        break;
      }

      case "submit_for_approval": {
        await svc.from("stages")
          .update({ status: "awaiting_approval" })
          .eq("id", input.stage_id);

        await insertNotification(
          svc, project.owner_id, "stage_submitted",
          `Stage ${stage.stage_number} submitted for review`,
          `${stage.name} is now awaiting approval from your Jalla Professional.`,
          "stage", input.stage_id,
        );
        break;
      }

      case "approve": {
        nextStageUnlocked = await completeStage(svc, stage);
        // Notify the project owner
        await insertNotification(
          svc, project.owner_id, "stage_approved",
          `Stage ${stage.stage_number} approved`,
          `${stage.name} has been reviewed and approved.${nextStageUnlocked ? ` Stage ${(stage.stage_number as number) + 1} is now active.` : ""}`,
          "stage", input.stage_id,
        );
        break;
      }

      case "reject": {
        await rejectSubstages(
          svc,
          input.stage_id,
          input.rejected_substage_ids!,
          input.rejection_notes ?? {},
          user.id,
        );
        // Notify the project owner
        await insertNotification(
          svc, project.owner_id, "stage_rejected",
          `Stage ${stage.stage_number} requires attention`,
          `${stage.name} has been reviewed. ${input.rejected_substage_ids!.length} substage(s) require correction.`,
          "stage", input.stage_id,
        );
        break;
      }
    }

    // Reload the updated stage
    const { data: updatedStage } = await svc
      .from("stages")
      .select("id, stage_number, name, status, is_locked, payment_percentage, payment_status")
      .eq("id", input.stage_id)
      .single();

    // Audit log
    await svc.from("audit_log").insert({
      actor_id:    user.id,
      entity_type: "stage",
      entity_id:   input.stage_id,
      action:      input.action,
      metadata: {
        tier,
        stage_number:          stage.stage_number,
        project_id:            project.id,
        rejected_substage_ids: input.rejected_substage_ids ?? null,
        next_stage_unlocked:   nextStageUnlocked,
      },
      ip_address: ip,
    });

    return json({ stage: updatedStage, next_stage_unlocked: nextStageUnlocked }, 200);
  } catch (err) {
    if (err instanceof AuthError) return errorResponse(err.message, err.status);
    console.error("[approve-stage] unhandled:", err);
    return errorResponse("Internal server error", 500);
  }
});
