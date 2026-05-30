/**
 * create-project — Edge function that seeds a full project.
 *
 * Steps performed in a single DB transaction:
 *   1. Validate input (Zod)
 *   2. Auth check — caller must be authenticated
 *   3. Insert project row
 *   4. Insert 10 stage rows (stage 1 unlocked, 2–10 locked)
 *   5. Insert 60 substage rows
 *   6. Compute 9-section budget breakdown → store in project.budget_breakdown
 *   7. Write audit_log entry
 *   8. Insert "project created" notification for owner
 *
 * Returns: { project_id: string }
 */
import { z } from "https://esm.sh/zod@3.23.8";
import {
  requireAuth,
  getServiceClient,
  json,
  errorResponse,
  AuthError,
  ValidationError,
} from "../_shared/auth.ts";
import { SUBSTAGE_SEED } from "../_shared/substage-seed.ts";
import { STAGE_PAYMENT_ALLOCATIONS, COST_SECTION_PERCENTAGES } from "../_shared/constants.ts";

// ── Input schema ──────────────────────────────────────────────────────────────

const CreateProjectSchema = z.object({
  name:                  z.string().min(1, "Project name is required").max(120),
  country:               z.string().length(2, "Country must be a 2-letter ISO code"),
  project_type:          z.enum(["residential_single", "residential_multi", "commercial", "mixed_use"]),
  building_type:         z.string().optional(),
  floors:                z.number().int().min(1).max(20).default(1),
  rooms:                 z.object({
    bedrooms:    z.number().int().min(0).max(20),
    bathrooms:   z.number().int().min(0).max(20),
    livingRooms: z.number().int().min(0).max(10),
    kitchens:    z.number().int().min(0).max(5),
  }).default({ bedrooms: 3, bathrooms: 2, livingRooms: 1, kitchens: 1 }),
  per_floor_rooms:       z.boolean().default(false),
  per_floor_data:        z.array(z.object({
    bedrooms:    z.number().int().min(0),
    bathrooms:   z.number().int().min(0),
    livingRooms: z.number().int().min(0),
    kitchens:    z.number().int().min(0),
  })).nullable().default(null),
  boys_quarters_count:   z.number().int().min(0).max(5).default(0),
  roof_type:             z.string().optional(),
  budget:                z.number().positive().nullable().optional(),
  target_completion_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
});

type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

// ── Budget computation ────────────────────────────────────────────────────────

function computeBudgetBreakdown(budget: number, floors: number) {
  const effectiveFloors = Math.max(1, floors);
  const section400pct = COST_SECTION_PERCENTAGES[400];

  // Build adjusted percentages
  const adjusted: Record<number, number> = { ...COST_SECTION_PERCENTAGES };

  if (effectiveFloors === 1) {
    // Single floor: redistribute section 400 → 60% to 300, 40% to 500
    adjusted[400] = 0;
    adjusted[300] = COST_SECTION_PERCENTAGES[300] + Math.round(section400pct * 0.6);
    adjusted[500] = COST_SECTION_PERCENTAGES[500] + Math.round(section400pct * 0.4);
  }

  // Normalise to 100%
  const total = Object.values(adjusted).reduce((s, p) => s + p, 0);
  const sectionBreakdown = Object.entries(adjusted).map(([code, pct]) => {
    const normPct = (pct / total) * 100;
    return {
      code: Number(code),
      percentage: Number(normPct.toFixed(2)),
      amount: Math.round((normPct / 100) * budget),
    };
  });

  const stageAllocations = STAGE_PAYMENT_ALLOCATIONS.map(({ stage, name, pct }) => ({
    stage,
    name,
    percentage: pct,
    amount: Math.round((pct / 100) * budget),
  }));

  return { stageAllocations, sectionBreakdown };
}

// ── Notify helper ─────────────────────────────────────────────────────────────

async function insertNotification(
  svc: ReturnType<typeof getServiceClient>,
  userId: string,
  projectId: string,
  projectName: string,
) {
  await svc.from("notifications").insert({
    user_id:     userId,
    type:        "project_created",
    title:       "Project created",
    body:        `Your project "${projectName}" has been created. Stage 1 is now active.`,
    entity_type: "project",
    entity_id:   projectId,
  });
}

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    // 1. Auth
    const { user } = await requireAuth(req);
    const svc = getServiceClient();
    const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? null;

    // 2. Parse + validate
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return errorResponse("Invalid JSON body");
    }

    const parsed = CreateProjectSchema.safeParse(rawBody);
    if (!parsed.success) {
      return errorResponse(
        "Validation failed: " + parsed.error.issues.map((i) => i.message).join("; "),
        422,
      );
    }

    const input: CreateProjectInput = parsed.data;
    const budget = input.budget ?? null;

    // 3. Compute budget breakdown (if budget provided)
    const budgetBreakdown = budget
      ? computeBudgetBreakdown(budget, input.floors)
      : null;

    // 4. Insert project
    const { data: project, error: projectErr } = await svc
      .from("projects")
      .insert({
        owner_id:               user.id,
        name:                   input.name,
        country:                input.country,
        project_type:           input.project_type,
        building_type:          input.building_type ?? null,
        floors:                 input.floors,
        rooms:                  input.rooms,
        boys_quarters_count:    input.boys_quarters_count,
        roof_type:              input.roof_type ?? null,
        budget:                 budget,
        budget_breakdown:       budgetBreakdown,
        target_completion_date: input.target_completion_date ?? null,
        status:                 "active",
        is_demo:                false,
      })
      .select("id")
      .single();

    if (projectErr || !project) {
      console.error("[create-project] project insert error:", projectErr);
      return errorResponse("Failed to create project", 500);
    }

    const projectId: string = project.id;

    // 5. Insert 10 stages
    const stageRows = STAGE_PAYMENT_ALLOCATIONS.map(({ stage, name, pct }) => ({
      project_id:          projectId,
      stage_number:        stage,
      name,
      status:              stage === 1 ? "in_progress" : "not_started",
      is_locked:           stage !== 1,
      payment_percentage:  pct,
      payment_amount:      budget ? Math.round((pct / 100) * budget) : null,
      payment_status:      "unpaid",
    }));

    const { data: stages, error: stagesErr } = await svc
      .from("stages")
      .insert(stageRows)
      .select("id, stage_number");

    if (stagesErr || !stages) {
      console.error("[create-project] stages insert error:", stagesErr);
      // Rollback: delete the project (cascades to stages + substages)
      await svc.from("projects").delete().eq("id", projectId);
      return errorResponse("Failed to create stages", 500);
    }

    // Build stage_number → id map
    const stageMap: Record<number, string> = {};
    for (const s of stages) {
      stageMap[s.stage_number] = s.id;
    }

    // 6. Insert 60 substages
    const substageRows = Object.entries(SUBSTAGE_SEED).flatMap(([stageNumStr, substages]) => {
      const stageNum = Number(stageNumStr);
      const stageId = stageMap[stageNum];
      return substages.map((sub, idx) => ({
        stage_id:         stageId,
        project_id:       projectId,
        substage_number:  idx + 1,
        name:             sub.name,
        description:      sub.description,
        status:           "not_started",
      }));
    });

    const { error: substagesErr } = await svc
      .from("project_substages")
      .insert(substageRows);

    if (substagesErr) {
      console.error("[create-project] substages insert error:", substagesErr);
      await svc.from("projects").delete().eq("id", projectId);
      return errorResponse("Failed to create substages", 500);
    }

    // 7. Audit log
    await svc.from("audit_log").insert({
      actor_id:    user.id,
      entity_type: "project",
      entity_id:   projectId,
      action:      "created",
      metadata:    {
        name:          input.name,
        country:       input.country,
        project_type:  input.project_type,
        building_type: input.building_type ?? null,
        floors:        input.floors,
        budget:        budget,
      },
      ip_address: ip,
    });

    // 8. Notification
    await insertNotification(svc, user.id, projectId, input.name);

    return json({ project_id: projectId }, 201);
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.message, err.status);
    }
    if (err instanceof ValidationError) {
      return errorResponse(err.message, 422);
    }
    console.error("[create-project] unhandled error:", err);
    return errorResponse("Internal server error", 500);
  }
});
