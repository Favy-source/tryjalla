/**
 * DeliverableChecklist — compact per-stage checklist showing substage
 * completion status as a deliverable list.
 *
 * Shown in the Documents tab alongside the DocumentVault, giving context
 * on what has been physically completed before documents are archived.
 */
import { CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react";
import type { StageData } from "./StageAccordion";

interface DeliverableChecklistProps {
  stages: StageData[];
}

function DeliverableIcon({ status }: { status: string }) {
  switch (status) {
    case "complete":   return <CheckCircle2 className="h-4 w-4 text-brand-near-black shrink-0" />;
    case "in_progress": return <Clock className="h-4 w-4 text-brand-mid-grey shrink-0" />;
    case "rejected":   return <AlertCircle className="h-4 w-4 text-brand-mid-grey shrink-0" />;
    default:           return <Circle className="h-4 w-4 text-brand-border-grey shrink-0" />;
  }
}

export function DeliverableChecklist({ stages }: DeliverableChecklistProps) {
  const activeStages = stages.filter(
    (s) => !s.is_locked && s.substages.length > 0,
  );

  if (activeStages.length === 0) {
    return (
      <p className="text-sm text-brand-mid-grey py-4 text-center">
        No active stages with deliverables yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {activeStages
        .sort((a, b) => a.stage_number - b.stage_number)
        .map((stage) => {
          const completedCount = stage.substages.filter((s) => s.status === "complete").length;
          const total = stage.substages.length;
          const pct   = total > 0 ? Math.round((completedCount / total) * 100) : 0;

          return (
            <div key={stage.id} className="rounded-xl border border-brand-border-grey bg-white overflow-hidden">
              {/* Stage header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-brand-border-grey bg-brand-light-grey">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-brand-border-grey text-xs text-brand-mid-grey">
                    {stage.stage_number}
                  </span>
                  <span className="text-sm font-semibold text-brand-near-black">{stage.name}</span>
                </div>
                <span className="text-xs text-brand-mid-grey tabular-nums">
                  {completedCount}/{total} · {pct}%
                </span>
              </div>

              {/* Substage list */}
              <ul className="divide-y divide-brand-border-grey">
                {stage.substages
                  .sort((a, b) => a.substage_number - b.substage_number)
                  .map((sub) => (
                    <li key={sub.id} className="flex items-center gap-3 px-4 py-2.5">
                      <DeliverableIcon status={sub.status} />
                      <span className={`text-sm ${sub.status === "complete" ? "line-through text-brand-mid-grey" : "text-brand-near-black"}`}>
                        {sub.substage_number}. {sub.name}
                      </span>
                      {sub.evidence_urls.length > 0 && (
                        <span className="ml-auto text-xs text-brand-mid-grey shrink-0">
                          {sub.evidence_urls.length} file{sub.evidence_urls.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </li>
                  ))}
              </ul>
            </div>
          );
        })}
    </div>
  );
}
