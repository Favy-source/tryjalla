/**
 * SubstageRow — a single substage with status toggle, notes, and evidence count.
 *
 * Status cycle on click (for owner/professional):
 *   not_started → in_progress → complete → in_progress (undo)
 *
 * Calls update-substage edge function on status change.
 */
import { useState } from "react";
import { Circle, Clock, CheckCircle2, AlertCircle, ImageIcon, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { SubstageGuide } from "./SubstageGuide";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SubstageData {
  id:             string;
  substage_number: number;
  name:           string;
  description:    string | null;
  status:         string;
  notes:          string | null;
  evidence_urls:  string[];
  rejection_note: string | null;
  completed_at:   string | null;
}

interface SubstageRowProps {
  substage:       SubstageData;
  canEdit:        boolean;
  stageLocked:    boolean;
  stageNumber:    number;            // for guide lookup
  showGuide:      boolean;           // true for self_serve tier
  onUpdated:      (updated: SubstageData) => void;
}

// ── Status icon ───────────────────────────────────────────────────────────────

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "complete":
      return <CheckCircle2 className="h-5 w-5 text-brand-near-black shrink-0" />;
    case "in_progress":
      return <Clock className="h-5 w-5 text-brand-mid-grey shrink-0" />;
    case "rejected":
      return <AlertCircle className="h-5 w-5 text-brand-mid-grey shrink-0" />;
    default:
      return <Circle className="h-5 w-5 text-brand-border-grey shrink-0" />;
  }
}

// ── Next status cycle ─────────────────────────────────────────────────────────

function nextStatus(current: string): "not_started" | "in_progress" | "complete" {
  switch (current) {
    case "not_started": return "in_progress";
    case "in_progress": return "complete";
    case "complete":    return "in_progress";   // undo
    case "rejected":    return "in_progress";   // retry after rejection
    default:            return "in_progress";
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SubstageRow({ substage, canEdit, stageLocked, stageNumber, showGuide, onUpdated }: SubstageRowProps) {
  const [loading,    setLoading]    = useState(false);
  const [expanded,   setExpanded]   = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  async function handleStatusToggle() {
    if (!canEdit || stageLocked || loading) return;
    const next = nextStatus(substage.status);
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("update-substage", {
        body: { substage_id: substage.id, status: next },
      });
      if (fnErr) throw fnErr;
      onUpdated((data as { substage: SubstageData }).substage);
    } catch (e) {
      setError((e as Error).message ?? "Update failed");
    } finally {
      setLoading(false);
    }
  }

  const isInteractive = canEdit && !stageLocked;

  return (
    <div className={`border-b border-brand-border-grey last:border-0 ${substage.status === "rejected" ? "bg-brand-light-grey" : ""}`}>
      {/* Main row */}
      <div className="flex items-start gap-3 px-4 pt-3 pb-2">
        {/* Status toggle */}
        <button
          onClick={handleStatusToggle}
          disabled={!isInteractive || loading}
          className={`mt-0.5 transition-opacity ${isInteractive ? "cursor-pointer hover:opacity-70" : "cursor-default"} ${loading ? "opacity-40" : ""}`}
          aria-label={`Mark substage ${substage.status === "complete" ? "incomplete" : "complete"}`}
        >
          <StatusIcon status={loading ? "in_progress" : substage.status} />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-x-1">
              <span className="text-xs text-brand-mid-grey tabular-nums">
                {substage.substage_number}.
              </span>
              <span className={`text-sm ${substage.status === "complete" ? "line-through text-brand-mid-grey" : "text-brand-near-black"}`}>
                {substage.name}
              </span>
              {showGuide && (
                <SubstageGuide
                  stageNumber={stageNumber}
                  substageNumber={substage.substage_number}
                />
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Evidence count */}
              {substage.evidence_urls.length > 0 && (
                <span className="inline-flex items-center gap-1 text-xs text-brand-mid-grey">
                  <ImageIcon className="h-3.5 w-3.5" />
                  {substage.evidence_urls.length}
                </span>
              )}

              {/* Expand toggle (if has description, notes, or rejection) */}
              {(substage.description || substage.notes || substage.rejection_note) && (
                <button
                  onClick={() => setExpanded((e) => !e)}
                  className="text-brand-mid-grey hover:text-brand-near-black"
                >
                  {expanded
                    ? <ChevronUp className="h-4 w-4" />
                    : <ChevronDown className="h-4 w-4" />
                  }
                </button>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="mt-1 text-xs text-brand-mid-grey">{error}</p>
          )}

          {/* Rejection note (always visible when rejected) */}
          {substage.status === "rejected" && substage.rejection_note && (
            <div className="mt-1.5 rounded border border-brand-border-grey bg-white px-3 py-2">
              <p className="text-xs font-medium text-brand-near-black mb-0.5">Requires attention</p>
              <p className="text-xs text-brand-mid-grey">{substage.rejection_note}</p>
              {substage.evidence_urls.length === 0 && (
                <p className="text-xs text-brand-mid-grey mt-1 italic">Upload evidence to resubmit.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (substage.description || substage.notes || substage.evidence_urls.length > 0) && (
        <div className="px-12 pb-3 space-y-2">
          {substage.description && (
            <p className="text-xs text-brand-mid-grey">{substage.description}</p>
          )}
          {substage.notes && (
            <div>
              <p className="text-xs font-medium text-brand-near-black mb-0.5">Notes</p>
              <p className="text-xs text-brand-mid-grey whitespace-pre-wrap">{substage.notes}</p>
            </div>
          )}
          {substage.evidence_urls.length > 0 && (
            <div>
              <p className="text-xs font-medium text-brand-near-black mb-1">Evidence</p>
              <div className="flex flex-wrap gap-2">
                {substage.evidence_urls.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded border border-brand-border-grey px-2 py-1 text-xs text-brand-near-black hover:border-brand-near-black transition-colors"
                  >
                    <ImageIcon className="h-3 w-3" />
                    Photo {i + 1}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
