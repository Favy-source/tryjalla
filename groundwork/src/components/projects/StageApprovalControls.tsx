/**
 * StageApprovalControls — tier-aware action bar at the bottom of an open stage.
 *
 * self_serve:    "Mark stage completed" — owner only, immediate.
 * hybrid:        Owner sees "Submit for approval" when in_progress.
 *                Professional sees "Approve" + "Reject" when awaiting_approval.
 * full_service:  Professional/admin sees "Approve" + "Reject" when awaiting_approval.
 *
 * Calls approve-stage edge function. On success, calls onComplete(updatedStage).
 */
import { useState } from "react";
import { CheckCircle2, Send, ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import type { StageData } from "./StageAccordion";

interface StageApprovalControlsProps {
  stage:              StageData;
  tier:               string;     // owner's subscription_tier
  isOwner:            boolean;
  isProfessional:     boolean;    // jala_professional | admin | super_admin
  allSubstagesComplete: boolean;  // all substages in this stage are 'complete'
  onApproved:         (updated: StageData) => void;
}

export function StageApprovalControls({
  stage,
  tier,
  isOwner,
  isProfessional,
  allSubstagesComplete,
  onApproved,
}: StageApprovalControlsProps) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);

  const status = stage.status;

  async function callApproveStage(body: Record<string, unknown>) {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("approve-stage", { body });
      if (fnErr) throw fnErr;
      const result = data as { stage: StageData; next_stage_unlocked: boolean };
      onApproved(result.stage);
    } catch (e) {
      setError((e as Error).message ?? "Action failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── self_serve: "Mark stage completed" ───────────────────────────────────────
  if (tier === "self_serve" && isOwner && status === "in_progress") {
    return (
      <ControlsWrapper error={error}>
        {!allSubstagesComplete && (
          <p className="text-xs text-brand-mid-grey mb-3">
            Complete all substages before marking this stage done.
          </p>
        )}
        <button
          onClick={() => callApproveStage({ stage_id: stage.id, action: "mark_completed" })}
          disabled={loading || !allSubstagesComplete}
          className="flex items-center gap-2 rounded-lg bg-brand-near-black px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-rich-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <CheckCircle2 className="h-4 w-4" />
          }
          Mark stage completed
        </button>
      </ControlsWrapper>
    );
  }

  // ── hybrid owner: "Submit for approval" ──────────────────────────────────────
  if (tier === "hybrid" && isOwner && status === "in_progress") {
    return (
      <ControlsWrapper error={error}>
        {!allSubstagesComplete && (
          <p className="text-xs text-brand-mid-grey mb-3">
            Complete all substages before submitting for approval.
          </p>
        )}
        <button
          onClick={() => callApproveStage({ stage_id: stage.id, action: "submit_for_approval" })}
          disabled={loading || !allSubstagesComplete}
          className="flex items-center gap-2 rounded-lg bg-brand-near-black px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-rich-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Send className="h-4 w-4" />
          }
          Submit for approval
        </button>
      </ControlsWrapper>
    );
  }

  // ── hybrid/full_service owner: awaiting approval status pill ─────────────────
  if (isOwner && status === "awaiting_approval") {
    return (
      <ControlsWrapper error={null}>
        <div className="flex items-center gap-2 text-sm text-brand-mid-grey">
          <Loader2 className="h-4 w-4 animate-spin" />
          Awaiting review from your Jalla Professional…
        </div>
      </ControlsWrapper>
    );
  }

  // ── professional / admin: Approve + Reject ────────────────────────────────────
  if (isProfessional && (status === "awaiting_approval" || (tier === "full_service" && status === "in_progress"))) {
    if (showRejectForm) {
      return (
        <RejectForm
          stage={stage}
          onSubmit={(rejectedIds, notes) =>
            callApproveStage({
              stage_id:              stage.id,
              action:                "reject",
              rejected_substage_ids: rejectedIds,
              rejection_notes:       notes,
            })
          }
          onCancel={() => setShowRejectForm(false)}
          loading={loading}
          error={error}
        />
      );
    }

    return (
      <ControlsWrapper error={error}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => callApproveStage({ stage_id: stage.id, action: "approve" })}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-brand-near-black px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-rich-black transition-colors disabled:opacity-40"
          >
            {loading
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <ThumbsUp className="h-4 w-4" />
            }
            Approve stage
          </button>
          <button
            onClick={() => setShowRejectForm(true)}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-brand-border-grey bg-white px-4 py-2.5 text-sm font-medium text-brand-near-black hover:border-brand-near-black transition-colors disabled:opacity-40"
          >
            <ThumbsDown className="h-4 w-4" />
            Reject
          </button>
        </div>
      </ControlsWrapper>
    );
  }

  return null;
}

// ── Reject form ───────────────────────────────────────────────────────────────

function RejectForm({
  stage,
  onSubmit,
  onCancel,
  loading,
  error,
}: {
  stage:    StageData;
  onSubmit: (ids: string[], notes: Record<string, string>) => void;
  onCancel: () => void;
  loading:  boolean;
  error:    string | null;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [notes,       setNotes]       = useState<Record<string, string>>({});

  function toggleSubstage(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <div className="border-t border-brand-border-grey bg-brand-light-grey p-4">
      <p className="text-sm font-semibold text-brand-near-black mb-3">
        Select substages that require correction
      </p>
      <div className="space-y-2 mb-4">
        {stage.substages
          .sort((a, b) => a.substage_number - b.substage_number)
          .map((sub) => (
            <div key={sub.id} className="rounded-lg border border-brand-border-grey bg-white p-3">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.has(sub.id)}
                  onChange={() => toggleSubstage(sub.id)}
                  className="mt-0.5 accent-brand-near-black"
                />
                <span className="text-sm text-brand-near-black">
                  {sub.substage_number}. {sub.name}
                </span>
              </label>
              {selectedIds.has(sub.id) && (
                <textarea
                  placeholder="What needs to be corrected? (optional)"
                  value={notes[sub.id] ?? ""}
                  onChange={(e) => setNotes((prev) => ({ ...prev, [sub.id]: e.target.value }))}
                  rows={2}
                  maxLength={500}
                  className="mt-2 ml-6 w-[calc(100%-1.5rem)] resize-none rounded border border-brand-border-grey px-3 py-2 text-xs text-brand-near-black placeholder:text-brand-mid-grey focus:border-brand-near-black focus:outline-none"
                />
              )}
            </div>
          ))}
      </div>

      {error && (
        <p className="mb-3 text-xs text-brand-mid-grey">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={() => onSubmit([...selectedIds], notes)}
          disabled={loading || selectedIds.size === 0}
          className="flex items-center gap-2 rounded-lg bg-brand-near-black px-4 py-2 text-sm font-medium text-white hover:bg-brand-rich-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Send rejection ({selectedIds.size} selected)
        </button>
        <button
          onClick={onCancel}
          disabled={loading}
          className="text-sm text-brand-mid-grey hover:text-brand-near-black"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Wrapper ───────────────────────────────────────────────────────────────────

function ControlsWrapper({ children, error }: { children: React.ReactNode; error: string | null }) {
  return (
    <div className="border-t border-brand-border-grey px-4 py-4">
      {children}
      {error && (
        <p className="mt-2 text-xs text-brand-mid-grey">{error}</p>
      )}
    </div>
  );
}
