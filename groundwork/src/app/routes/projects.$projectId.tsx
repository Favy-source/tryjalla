/**
 * /projects/:projectId — Full project detail page.
 *
 * Tabs: Overview (stages) | Budget (Day 10) | Documents (Day 11)
 *
 * Overview tab: KPI cards + StageList with all 10 StageAccordions.
 * Each stage loads its substages. Substage status can be toggled inline.
 */
import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useSearchParams } from "react-router";
import { ArrowLeft, Loader2, Calendar, DollarSign, Layers, Clock3 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTier } from "@/hooks/useTier";
import { computeBudgetBreakdown } from "@/lib/budget-engine";
import { StageList } from "@/components/projects/StageList";
import { BudgetDonut } from "@/components/projects/BudgetDonut";
import { FloorCostBreakdown } from "@/components/projects/FloorCostBreakdown";
import { PaymentMilestones } from "@/components/projects/PaymentMilestones";
import { RecordPaymentDialog } from "@/components/projects/RecordPaymentDialog";
import { DocumentVault } from "@/components/projects/DocumentVault";
import { DeliverableChecklist } from "@/components/projects/DeliverableChecklist";
import { ProjectChat } from "@/components/projects/ProjectChat";
import type { StageData } from "@/components/projects/StageAccordion";
import type { SubstageData } from "@/components/projects/SubstageRow";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ProjectRow {
  id:                      string;
  name:                    string;
  country:                 string;
  project_type:            string;
  building_type:           string | null;
  floors:                  number;
  budget:                  number | null;
  budget_breakdown:        unknown;
  status:                  string;
  owner_id:                string;
  assigned_professional_id: string | null;
  target_completion_date:  string | null;
  created_at:              string;
}

// ── Days active helper ────────────────────────────────────────────────────────

function daysActive(createdAt: string): number {
  return Math.max(1, Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24),
  ));
}

// ── KPI stat card ─────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon: Icon,
}: {
  label: string; value: string; sub?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border border-brand-border-grey bg-white p-4">
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs text-brand-mid-grey">{label}</p>
        <Icon className="h-4 w-4 text-brand-border-grey" />
      </div>
      <p className="text-xl font-semibold text-brand-near-black">{value}</p>
      {sub && <p className="text-xs text-brand-mid-grey mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Tab nav ───────────────────────────────────────────────────────────────────

const TABS = [
  { key: "overview",   label: "Overview"  },
  { key: "budget",     label: "Budget"    },
  { key: "documents",  label: "Documents" },
  { key: "chat",       label: "Chat"      },
] as const;

type TabKey = typeof TABS[number]["key"];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProjectDetailPage() {
  const { projectId }               = useParams<{ projectId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user }                    = useAuth();
  const { tier }                    = useTier();

  const activeTab = (searchParams.get("tab") as TabKey) ?? "overview";

  const [project,  setProject]  = useState<ProjectRow | null>(null);
  const [stages,   setStages]   = useState<StageData[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  // ── Data loading ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const pid = projectId as string;

        // Load project + stages + substages in parallel
        const [projResult, stagesResult] = await Promise.all([
          supabase.from("projects").select("*").eq("id", pid).single(),
          supabase.from("stages")
            .select(`
              id, stage_number, name, status, is_locked,
              payment_percentage, payment_amount, payment_status,
              project_substages (
                id, substage_number, name, description, status,
                notes, evidence_urls, rejection_note, completed_at
              )
            `)
            .eq("project_id", pid)
            .order("stage_number"),
        ]);

        if (cancelled) return;
        if (projResult.error)   throw new Error(projResult.error.message);
        if (stagesResult.error) throw new Error(stagesResult.error.message);

        setProject(projResult.data as ProjectRow);
        setStages(
          (stagesResult.data ?? []).map((s) => ({
            ...s,
            substages: (s.project_substages ?? []) as SubstageData[],
          })) as StageData[],
        );
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [projectId]);

  // ── Derived values ────────────────────────────────────────────────────────────

  const isOwner        = user?.id === project?.owner_id;
  const isProfessional = false; // populated from user_roles in a future update (Day 12)
  const canEdit        = isOwner;

  const budgetBreakdown = project
    ? computeBudgetBreakdown({ budget: project.budget ?? 0, floors: project.floors })
    : null;

  const [dialogOpen,            setDialogOpen]            = useState(false);
  const [recordPaymentStageId,  setRecordPaymentStageId]  = useState<string | null>(null);
  const [recordPaymentStageName, setRecordPaymentStageName] = useState<string | undefined>();

  function handleOpenRecordPayment(stageId: string) {
    const stage = stages.find((s) => s.id === stageId);
    setRecordPaymentStageId(stageId);
    setRecordPaymentStageName(stage?.name);
    setDialogOpen(true);
  }

  function handlePaymentRecorded(stageId: string, newStatus: string) {
    setStages((prev) =>
      prev.map((s) => s.id === stageId ? { ...s, payment_status: newStatus } : s),
    );
  }

  const completedStages = stages.filter((s) => s.status === "completed").length;
  const activeStage     = stages.find(
    (s) => s.status === "in_progress" || s.status === "awaiting_approval",
  );
  const progressPct = Math.round((completedStages / 10) * 100);

  const handleStagesUpdate = useCallback((updated: StageData[]) => {
    setStages(updated);
  }, []);

  // ── Loading state ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-mid-grey" />
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────────

  if (error || !project) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <p className="text-sm text-brand-mid-grey">{error ?? "Project not found."}</p>
        <Link
          to="/projects"
          className="text-sm font-medium text-brand-near-black underline underline-offset-4"
        >
          Back to projects
        </Link>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-full">
      {/* Page header */}
      <div className="border-b border-brand-border-grey bg-white px-4 py-4 sm:px-6">
        <Link
          to="/projects"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-brand-mid-grey hover:text-brand-near-black transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          My Projects
        </Link>

        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-xl font-semibold text-brand-near-black">{project.name}</h1>
            <p className="text-sm text-brand-mid-grey mt-0.5">
              {project.building_type
                ? `${project.building_type.charAt(0).toUpperCase() + project.building_type.slice(1)} · `
                : ""}
              {project.floors} floor{project.floors !== 1 ? "s" : ""} · {project.country}
            </p>
          </div>
          <span className="shrink-0 inline-flex items-center rounded-md border border-brand-border-grey px-2.5 py-0.5 text-xs text-brand-mid-grey capitalize">
            {project.status}
          </span>
        </div>

        {/* Overall progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-brand-mid-grey mb-1">
            <span>Overall progress</span>
            <span>{progressPct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-brand-light-grey">
            <div
              className="h-full rounded-full bg-brand-near-black transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 px-4 py-4 sm:px-6 sm:grid-cols-4">
        <StatCard
          label="Total Budget"
          value={project.budget
            ? `₦${(project.budget / 1_000_000).toFixed(1)}M`
            : "—"}
          icon={DollarSign}
        />
        <StatCard
          label="Stages Done"
          value={`${completedStages} / 10`}
          sub={`${progressPct}% complete`}
          icon={Layers}
        />
        <StatCard
          label="Active Stage"
          value={activeStage ? `Stage ${activeStage.stage_number}` : "—"}
          sub={activeStage?.name}
          icon={Clock3}
        />
        <StatCard
          label="Days Active"
          value={`${daysActive(project.created_at)}`}
          sub={project.target_completion_date
            ? `Target: ${new Date(project.target_completion_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
            : undefined}
          icon={Calendar}
        />
      </div>

      {/* Tab nav */}
      <div className="border-b border-brand-border-grey px-4 sm:px-6">
        <nav className="flex gap-0 -mb-px overflow-x-auto">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSearchParams(key === "overview" ? {} : { tab: key })}
              className={`shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === key
                  ? "border-brand-near-black text-brand-near-black"
                  : "border-transparent text-brand-mid-grey hover:text-brand-near-black"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div className="px-4 py-6 sm:px-6">
        {activeTab === "overview" && (
          <StageList
            stages={stages}
            canEdit={canEdit}
            isOwner={isOwner}
            isProfessional={isProfessional}
            ownerTier={tier ?? "self_serve"}
            onUpdate={handleStagesUpdate}
          />
        )}

        {activeTab === "budget" && (
          <div className="space-y-8">
            {/* Donut + section table */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h2 className="text-sm font-semibold text-brand-near-black mb-3">Budget Breakdown</h2>
                <BudgetDonut
                  breakdown={budgetBreakdown}
                  currency={project.country === "NG" ? "NGN" : "USD"}
                />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-brand-near-black mb-3">Section Costs</h2>
                <FloorCostBreakdown
                  breakdown={budgetBreakdown}
                  floors={project.floors}
                  currency={project.country === "NG" ? "NGN" : "USD"}
                />
              </div>
            </div>

            {/* Payment milestones */}
            <div>
              <h2 className="text-sm font-semibold text-brand-near-black mb-3">Payment Milestones</h2>
              <PaymentMilestones
                stages={stages}
                currency={project.country === "NG" ? "NGN" : "USD"}
                canRecordPayment={isOwner}
                onRecordPayment={handleOpenRecordPayment}
              />
            </div>

            <RecordPaymentDialog
              open={dialogOpen}
              stageId={recordPaymentStageId}
              stageName={recordPaymentStageName}
              currency={project.country === "NG" ? "NGN" : "USD"}
              onClose={() => setDialogOpen(false)}
              onSuccess={handlePaymentRecorded}
            />
          </div>
        )}

        {activeTab === "documents" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-sm font-semibold text-brand-near-black mb-3">Document Vault</h2>
              <DocumentVault projectId={project.id} canUpload={isOwner} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-brand-near-black mb-3">Deliverable Checklist</h2>
              <DeliverableChecklist stages={stages} />
            </div>
          </div>
        )}

        {activeTab === "chat" && (
          <ProjectChat projectId={project.id} />
        )}
      </div>
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
