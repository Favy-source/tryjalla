/**
 * /projects — My Projects list page.
 *
 * Shows a card grid of the user's projects loaded from Supabase.
 * Empty state shown when no projects exist.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { FolderPlus, FolderOpen, Loader2, CheckCircle2, Circle, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ProjectSummary {
  id:            string;
  name:          string;
  country:       string;
  building_type: string | null;
  floors:        number;
  budget:        number | null;
  status:        string;
  created_at:    string;
  stages: {
    stage_number: number;
    status:       string;
  }[];
}

// ── Stage progress dots ───────────────────────────────────────────────────────

function StageDots({ stages }: { stages: ProjectSummary["stages"] }) {
  const sorted = [...stages].sort((a, b) => a.stage_number - b.stage_number);
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {sorted.map((s) => {
        if (s.status === "completed")
          return <CheckCircle2 key={s.stage_number} className="h-3.5 w-3.5 text-brand-near-black" />;
        if (s.status === "in_progress" || s.status === "awaiting_approval")
          return <Clock key={s.stage_number} className="h-3.5 w-3.5 text-brand-mid-grey" />;
        return <Circle key={s.stage_number} className="h-3.5 w-3.5 text-brand-border-grey" />;
      })}
    </div>
  );
}

// ── Project card ──────────────────────────────────────────────────────────────

function ProjectCard({ project }: { project: ProjectSummary }) {
  const completedStages  = project.stages.filter((s) => s.status === "completed").length;
  const activeStage      = project.stages.find(
    (s) => s.status === "in_progress" || s.status === "awaiting_approval"
  );
  const progressPct      = Math.round((completedStages / 10) * 100);

  return (
    <Link
      to={`/projects/${project.id}`}
      className="flex flex-col rounded-xl border border-brand-border-grey bg-white p-5 hover:border-brand-near-black transition-colors"
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="text-sm font-semibold text-brand-near-black leading-snug line-clamp-2">
          {project.name}
        </h3>
        <span className="shrink-0 inline-flex items-center rounded-md border border-brand-border-grey px-2 py-0.5 text-xs text-brand-mid-grey capitalize">
          {project.status}
        </span>
      </div>

      {/* Meta */}
      <p className="text-xs text-brand-mid-grey mb-4">
        {project.building_type
          ? `${project.building_type.charAt(0).toUpperCase() + project.building_type.slice(1)} · `
          : ""}
        {project.floors} floor{project.floors !== 1 ? "s" : ""} · {project.country}
      </p>

      {/* Stage dots */}
      <StageDots stages={project.stages} />

      {/* Progress bar */}
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-brand-light-grey">
        <div
          className="h-full rounded-full bg-brand-near-black transition-all"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between text-xs text-brand-mid-grey">
        <span>
          {activeStage
            ? `Stage ${activeStage.stage_number} active`
            : completedStages === 10
            ? "Completed"
            : "Not started"}
        </span>
        <span>{progressPct}%</span>
      </div>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data, error: err } = await supabase
          .from("projects")
          .select(`
            id, name, country, building_type, floors, budget, status, created_at,
            stages ( stage_number, status )
          `)
          .eq("owner_id", user!.id)
          .order("created_at", { ascending: false });

        if (cancelled) return;
        if (err) throw new Error(err.message);
        setProjects((data ?? []) as ProjectSummary[]);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [user]);

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="border-b border-brand-border-grey bg-white px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-brand-near-black">My Projects</h1>
          <p className="text-sm text-brand-mid-grey mt-1">
            Track every build from ground to handover.
          </p>
        </div>
        <Link
          to="/projects/new"
          className="flex items-center gap-2 rounded-lg bg-brand-near-black px-4 py-2 text-sm font-medium text-white hover:bg-brand-rich-black transition-colors"
        >
          <FolderPlus className="w-4 h-4" />
          <span className="hidden sm:inline">New project</span>
        </Link>
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-brand-mid-grey" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm text-brand-mid-grey mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm font-medium text-brand-near-black underline underline-offset-4"
            >
              Retry
            </button>
          </div>
        ) : projects.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-brand-border-grey bg-white mb-4">
              <FolderOpen className="h-7 w-7 text-brand-border-grey" />
            </div>
            <h2 className="text-base font-semibold text-brand-near-black mb-2">
              No projects yet
            </h2>
            <p className="text-sm text-brand-mid-grey max-w-xs mb-6">
              Create your first project to start tracking your construction build
              stage by stage.
            </p>
            <Link
              to="/projects/new"
              className="flex items-center gap-2 rounded-lg bg-brand-near-black px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-rich-black transition-colors"
            >
              <FolderPlus className="w-4 h-4" />
              Create your first project
            </Link>
          </div>
        ) : (
          /* Project grid */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <div className="flex h-64 items-center justify-center">
      <p className="text-sm text-brand-mid-grey">
        Failed to load projects. Please refresh.
      </p>
    </div>
  );
}
