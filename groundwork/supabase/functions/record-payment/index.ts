/**
 * record-payment — Record a payment installment against a project stage.
 *
 * One payments row exists per stage per project (upsert).
 * Each call adds a payment_events row (installment history).
 *
 * Status progression:
 *   pending → partial  (total_paid < stage.payment_amount)
 *   partial → paid     (total_paid >= stage.payment_amount)
 *
 * Side effects:
 *   - Updates payments.status + stages.payment_status
 *   - Inserts payment_events record
 *   - Writes audit_log
 *   - Sends payment_recorded notification to project owner
 *
 * Returns: { payment, stage_payment_status, total_paid }
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

const RecordPaymentSchema = z.object({
  stage_id:       z.string().uuid("stage_id must be a UUID"),
  amount:         z.number().positive("Amount must be positive"),
  currency:       z.string().length(3, "Currency must be a 3-letter code").default("NGN"),
  payment_method: z.enum(["bank_transfer", "cash", "mobile_money", "cheque", "other"]).optional(),
  receipt_url:    z.string().url("receipt_url must be a valid URL").optional(),
  notes:          z.string().max(500, "Notes must be 500 chars or fewer").optional(),
  paid_at:        z.string().regex(/^\d{4}-\d{2}-\d{2}/, "paid_at must be YYYY-MM-DD").optional(),
});

type RecordPaymentInput = z.infer<typeof RecordPaymentSchema>;

// ── Payment status derivation ─────────────────────────────────────────────────

function deriveStatus(totalPaid: number, stagePaymentAmount: number | null): string {
  if (!stagePaymentAmount || stagePaymentAmount <= 0) return "partial";
  if (totalPaid >= stagePaymentAmount) return "paid";
  if (totalPaid > 0) return "partial";
  return "pending";
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

    const parsed = RecordPaymentSchema.safeParse(rawBody);
    if (!parsed.success) {
      return errorResponse(
        "Validation failed: " + parsed.error.issues.map((i) => i.message).join("; "),
        422,
      );
    }

    const input: RecordPaymentInput = parsed.data;

    // Load stage + project
    const { data: stageRow, error: stageErr } = await svc
      .from("stages")
      .select("id, stage_number, name, payment_amount, payment_percentage, projects(id, owner_id, name)")
      .eq("id", input.stage_id)
      .single();

    if (stageErr || !stageRow) return errorResponse("Stage not found", 404);

    const stage = stageRow as Record<string, unknown>;
    const project = stage.projects as { id: string; owner_id: string; name: string };

    // Permission check: owner or admin/professional
    const isOwner = user.id === project.owner_id;
    if (!isOwner) {
      const roles = await getUserRoles(user.id);
      const hasPriv = roles.some((r) =>
        ["admin", "super_admin", "jala_professional"].includes(r),
      );
      if (!hasPriv) return errorResponse("Not authorised to record payments for this project", 403);
    }

    // Upsert the payments row for this stage
    const { data: existingPayment } = await svc
      .from("payments")
      .select("id, amount")
      .eq("stage_id", input.stage_id)
      .eq("project_id", project.id)
      .maybeSingle();

    let paymentId: string;

    if (existingPayment) {
      paymentId = (existingPayment as { id: string }).id;
    } else {
      const { data: newPayment, error: insertErr } = await svc
        .from("payments")
        .insert({
          project_id:     project.id,
          stage_id:       input.stage_id,
          amount:         input.amount,
          currency:       input.currency,
          status:         "pending",
          payment_method: input.payment_method ?? null,
          receipt_url:    input.receipt_url ?? null,
          notes:          input.notes ?? null,
          recorded_by:    user.id,
          paid_at:        input.paid_at ?? new Date().toISOString().slice(0, 10),
        })
        .select("id")
        .single();

      if (insertErr || !newPayment) {
        console.error("[record-payment] insert error:", insertErr);
        return errorResponse("Failed to create payment record", 500);
      }
      paymentId = (newPayment as { id: string }).id;
    }

    // Insert payment_events row (installment record)
    await svc.from("payment_events").insert({
      payment_id:  paymentId,
      amount:      input.amount,
      receipt_url: input.receipt_url ?? null,
      notes:       input.notes ?? null,
      recorded_by: user.id,
    });

    // Calculate total paid for this stage from all payment_events
    const { data: eventsData } = await svc
      .from("payment_events")
      .select("amount")
      .eq("payment_id", paymentId);

    const totalPaid = ((eventsData ?? []) as { amount: number }[]).reduce(
      (sum, e) => sum + Number(e.amount),
      0,
    );

    const stagePaymentAmount = stage.payment_amount as number | null;
    const newStatus = deriveStatus(totalPaid, stagePaymentAmount);

    // Update payment row with latest status + method/receipt if provided
    await svc.from("payments").update({
      status:         newStatus,
      payment_method: input.payment_method ?? undefined,
      receipt_url:    input.receipt_url ?? undefined,
      paid_at:        input.paid_at ?? new Date().toISOString().slice(0, 10),
      recorded_by:    user.id,
    }).eq("id", paymentId);

    // Mirror status onto stages.payment_status
    await svc.from("stages")
      .update({ payment_status: newStatus })
      .eq("id", input.stage_id);

    // Reload updated payment
    const { data: updatedPayment } = await svc
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .single();

    // Notification
    await svc.from("notifications").insert({
      user_id:     project.owner_id,
      type:        "payment_recorded",
      title:       `Payment recorded — Stage ${stage.stage_number}`,
      body:        `₦${totalPaid.toLocaleString()} recorded for ${stage.name} (${newStatus}).`,
      entity_type: "payment",
      entity_id:   paymentId,
    });

    // Audit log
    await svc.from("audit_log").insert({
      actor_id:    user.id,
      entity_type: "payment",
      entity_id:   paymentId,
      action:      "recorded",
      metadata: {
        stage_id:     input.stage_id,
        stage_number: stage.stage_number,
        amount:       input.amount,
        total_paid:   totalPaid,
        new_status:   newStatus,
      },
      ip_address: ip,
    });

    return json({ payment: updatedPayment, stage_payment_status: newStatus, total_paid: totalPaid }, 201);
  } catch (err) {
    if (err instanceof AuthError) return errorResponse(err.message, err.status);
    console.error("[record-payment] unhandled:", err);
    return errorResponse("Internal server error", 500);
  }
});
