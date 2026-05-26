/**
 * /projects/:projectId — Project detail page.
 *
 * Day 4: skeleton with KPI stat cards and stage list placeholder.
 * Day 7: full implementation — stages, substages, budget, payments, chat, documents.
 */
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ProjectRow {
  id: string;
  name: string;
  country: string;
  project_type: string;
  building_type: string | null;
  floors: number;
  budget: number | null;
  status: string;
  created_at: string;
}

interface StageRow {
  id: string;
  stage_number: number;
  name: string;
  status: string;
  is_locked: boolean;
  payment_percentage: number;
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StageBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    not_started:       "border-brand-border-grey text-brand-mid-grey",
    in_progress:       "border-brand-near-black text-brand-near-black font-medium",
    awaiting_approval: "border-brand-near-black text-brand-near-black",
    completed:         "border-brand-near-black bg-brand-near-black text-white",
  };
  const label: Record<string, string> = {
    not_started:       "Not started",
    in_progress:       "In progress",
    awaiting_approval: "Awaiting approval",
    completed:         "Completed",
  };
  return (
    <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs ${map[status] ?? map.not_started}`}>
      {label[status] ?? status}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject]  = useState<ProjectRow | null>(null);
  const [stages,  setStages]   = useState<StageRow[]>([]);
  const [loading, setLoading]  = useState(true);
  const [error,   setError]    = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const pid = projectId as string;
        const [{ data: proj, error: projErr }, { data: stageData, error: stageErr }] =
          await Promise.all([
            supabase.from("projects").select("*").eq("id", pid).single(),
            supabase.from("stages")
              .select("id, stage_number, name, status, is_locked, payment_percentage")
              .eq("project_id", pid)
              .order("stage_number"),
          ]);

        if (cancelled) return;
        if (projErr)  throw new Error(projErr.message);
        if (stageErr) throw new Error(stageErr.message);
        setProject(proj as ProjectRow);
        setStages((stageData ?? []) as StageRow[]);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [projectId]);

  // ── Loading ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-mid-grey" />
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────

  if (error || !project) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <p className="text-sm text-brand-mid-grey">{error ?? "Project not found."}</p>
        <Link to="/projects" className="text-sm font-medium text-brand-near-black underline underline-offset-4">
          Back to projects
        </Link>
      </div>
    );
  }

  const completedStages = stages.filter((s) => s.status === "completed").length;
  const activeStage     = stages.find((s)  => s.status === "in_progress" || s.status === "awaiting_approval");

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="border-b border-brand-border-grey bg-white px-6 py-5">
        <Link
          to="/projects"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-brand-mid-grey hover:text-brand-near-black transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          My Projects
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-brand-near-black">{project.name}</h1>
            <p className="text-sm text-brand-mid-grey mt-1">
              {project.building_type
                ? `${project.building_type.charAt(0).toUpperCase() + project.building_type.slice(1)} · `
                : ""}
              {project.floors} floor{project.floors !== 1 ? "s" : ""} · {project.country}
            </p>
          </div>
          <span className="inline-flex items-center rounded-md border border-brand-border-grey px-2.5 py-0.5 text-xs text-brand-mid-grey capitalize">
            {project.status}
          </span>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 px-6 py-5 sm:grid-cols-4">
        <StatCard label="Budget"       value={project.budget ? `₦${(project.budget / 1_000_000).toFixed(1)}M` : "—"} />
        <StatCard label="Stages done"  value={`${completedStages} / 10`} />
        <StatCard label="Active stage" value={activeStage ? `Stage ${activeStage.stage_number}` : "—"} />
        <StatCard label="Progress"     value={`${Math.round((completedStages / 10) * 100)}%`} />
      </div>

      {/* Stage list — Day 7 will replace with StageAccordion */}
      <div className="px-6 pb-8">
        <h2 className="mb-3 text-sm font-semibold text-brand-near-black">Stages</h2>
        <div className="divide-y divide-brand-border-grey rounded-lg border border-brand-border-grey bg-white">
          {stages.map((stage) => (
            <div key={stage.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-brand-border-grey text-xs font-medium text-brand-mid-grey">
                  {stage.stage_number}
                </span>
                <span className={`text-sm ${stage.is_locked ? "text-brand-mid-grey" : "text-brand-near-black"}`}>
                  {stage.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-brand-mid-grey">{stage.payment_percentage}%</span>
                <StageBadge status={stage.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-brand-border-grey bg-white p-4">
      <p className="text-xs text-brand-mid-grey">{label}</p>
      <p className="mt-1 text-lg font-semibold text-brand-near-black">{value}</p>
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <div className="flex h-64 items-center justify-center">
      <p className="text-sm text-brand-mid-grey">
        Failed to load project. Please refresh.
      </p>
    </div>
  );
}
