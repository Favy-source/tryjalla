/**
 * StageAccordion — collapsible stage card with substage list inside.
 *
 * - Stage 1 starts expanded by default (in_progress on project creation)
 * - Locked stages show a lock icon and cannot be expanded
 * - Completed stages are collapsed by default with a filled checkmark
 */
import { useState } from "react";
import {
  ChevronDown, ChevronRight, CheckCircle2, Lock,
  Clock, Circle,
} from "lucide-react";
import { SubstageProgress } from "./SubstageProgress";
import { SubstageRow, type SubstageData } from "./SubstageRow";
import { RejectionBanner } from "./RejectionBanner";
import { StageApprovalControls } from "./StageApprovalControls";
import { SelfVerifyChecklist } from "./SelfVerifyChecklist";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface StageData {
  id:                 string;
  stage_number:       number;
  name:               string;
  status:             string;
  is_locked:          boolean;
  payment_percentage: number;
  payment_amount:     number | null;
  payment_status:     string;
  substages:          SubstageData[];
}

interface StageAccordionProps {
  stage:            StageData;
  canEdit:          boolean;
  isOwner:          boolean;
  isProfessional:   boolean;
  ownerTier:        string;
  onSubstageUpdated: (stageId: string, updated: SubstageData) => void;
  onStageUpdated:   (updated: StageData) => void;
}

// ── Stage status badge ────────────────────────────────────────────────────────

function StageBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; cls: string }> = {
    not_started:       { label: "Not started",        cls: "border-brand-border-grey text-brand-mid-grey" },
    in_progress:       { label: "In progress",        cls: "border-brand-near-black text-brand-near-black font-medium" },
    awaiting_approval: { label: "Awaiting approval",  cls: "border-brand-near-black text-brand-near-black" },
    completed:         { label: "Completed",           cls: "border-brand-near-black bg-brand-near-black text-white" },
  };
  const { label, cls } = config[status] ?? config.not_started;
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs ${cls}`}>
      {label}
    </span>
  );
}

// ── Stage icon ────────────────────────────────────────────────────────────────

function StageIcon({ status, isLocked }: { status: string; isLocked: boolean }) {
  if (isLocked)           return <Lock className="h-4 w-4 text-brand-border-grey" />;
  if (status === "completed") return <CheckCircle2 className="h-4 w-4 text-brand-near-black" />;
  if (status === "in_progress" || status === "awaiting_approval")
                          return <Clock className="h-4 w-4 text-brand-mid-grey" />;
  return <Circle className="h-4 w-4 text-brand-border-grey" />;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function StageAccordion({
  stage, canEdit, isOwner, isProfessional, ownerTier,
  onSubstageUpdated, onStageUpdated,
}: StageAccordionProps) {
  const defaultOpen  = stage.status === "in_progress" || stage.status === "awaiting_approval";
  const [open, setOpen] = useState(defaultOpen);

  const completedSubstages    = stage.substages.filter((s) => s.status === "complete").length;
  const allSubstagesComplete  = stage.substages.length > 0 && completedSubstages === stage.substages.length;
  const isSelfVerify          = ownerTier === "self_serve";
  const [checklistAllDone, setChecklistAllDone] = useState(false);

  function handleSubstageUpdated(updated: SubstageData) {
    onSubstageUpdated(stage.id, updated);
  }

  return (
    <div className={`border border-brand-border-grey rounded-lg overflow-hidden mb-3 ${stage.is_locked ? "opacity-60" : ""}`}>
      {/* Accordion header */}
      <button
        onClick={() => { if (!stage.is_locked) setOpen((o) => !o); }}
        disabled={stage.is_locked}
        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
          ${stage.is_locked
            ? "cursor-default bg-white"
            : "cursor-pointer hover:bg-brand-light-grey bg-white"
          }`}
      >
        {/* Stage number */}
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-brand-border-grey text-xs font-medium text-brand-mid-grey">
          {stage.stage_number}
        </span>

        {/* Stage name + substage progress */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-medium ${stage.is_locked ? "text-brand-mid-grey" : "text-brand-near-black"}`}>
              {stage.name}
            </span>
            <StageBadge status={stage.status} />
          </div>
          {!stage.is_locked && stage.substages.length > 0 && (
            <SubstageProgress
              total={stage.substages.length}
              completed={completedSubstages}
              className="mt-1"
            />
          )}
        </div>

        {/* Right side: payment % + expand chevron */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden sm:block text-xs text-brand-mid-grey">
            {stage.payment_percentage}%
          </span>
          <StageIcon status={stage.status} isLocked={stage.is_locked} />
          {!stage.is_locked && (
            open
              ? <ChevronDown className="h-4 w-4 text-brand-mid-grey" />
              : <ChevronRight className="h-4 w-4 text-brand-mid-grey" />
          )}
        </div>
      </button>

      {/* Substage list + controls */}
      {!stage.is_locked && open && (
        <div className="border-t border-brand-border-grey">
          {/* Rejection banner (shown when any substage is rejected) */}
          <RejectionBanner substages={stage.substages} />

          {stage.substages.length === 0 ? (
            <p className="px-4 py-4 text-xs text-brand-mid-grey">
              No substages loaded.
            </p>
          ) : (
            stage.substages
              .sort((a, b) => a.substage_number - b.substage_number)
              .map((sub) => (
                <SubstageRow
                  key={sub.id}
                  substage={sub}
                  canEdit={canEdit}
                  stageLocked={stage.is_locked}
                  stageNumber={stage.stage_number}
                  showGuide={isSelfVerify}
                  onUpdated={handleSubstageUpdated}
                />
              ))
          )}

          {/* Self-Verify pre-approval checklist (self_serve only, active stages) */}
          {isSelfVerify && isOwner && allSubstagesComplete && stage.status === "in_progress" && (
            <SelfVerifyChecklist
              stageNumber={stage.stage_number}
              onAllChecked={setChecklistAllDone}
            />
          )}

          {/* Approval / submission controls */}
          <StageApprovalControls
            stage={stage}
            tier={ownerTier}
            isOwner={isOwner}
            isProfessional={isProfessional}
            allSubstagesComplete={allSubstagesComplete && (isSelfVerify ? checklistAllDone : true)}
            onApproved={onStageUpdated}
          />
        </div>
      )}
    </div>
  );
}
