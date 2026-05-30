/**
 * SelfVerifyChecklist — guided pre-approval checklist for self_serve users.
 *
 * Shown as an inline panel ABOVE the "Mark stage completed" button.
 * Self-Verify users don't have a professional reviewing their work —
 * this checklist ensures they have physically verified the stage before
 * releasing payment and unlocking the next stage.
 *
 * Items are sourced from STAGE_GUIDES[stageNumber].beforeApprove.
 * All items must be checked before the "Mark stage completed" button is enabled.
 */
import { useState } from "react";
import { ClipboardCheck, ChevronDown, ChevronUp } from "lucide-react";
import { getStageGuide } from "@/lib/stage-guides";

interface SelfVerifyChecklistProps {
  stageNumber: number;
  onAllChecked: (allChecked: boolean) => void;
}

export function SelfVerifyChecklist({ stageNumber, onAllChecked }: SelfVerifyChecklistProps) {
  const guide = getStageGuide(stageNumber);
  const [checked,   setChecked]   = useState<Set<number>>(new Set());
  const [collapsed, setCollapsed] = useState(false);

  if (!guide || guide.beforeApprove.length === 0) return null;

  const total      = guide.beforeApprove.length;
  const doneCount  = checked.size;
  const allChecked = doneCount === total;

  function toggle(index: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      onAllChecked(next.size === total);
      return next;
    });
  }

  return (
    <div className="mx-4 mb-1 rounded-xl border border-brand-border-grey bg-white overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-brand-light-grey transition-colors"
      >
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 shrink-0 text-brand-near-black" />
          <span className="text-sm font-semibold text-brand-near-black">
            Pre-approval checklist
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            allChecked
              ? "bg-brand-near-black text-white"
              : "border border-brand-border-grey text-brand-mid-grey"
          }`}>
            {doneCount}/{total}
          </span>
        </div>
        {collapsed
          ? <ChevronDown className="h-4 w-4 text-brand-mid-grey" />
          : <ChevronUp className="h-4 w-4 text-brand-mid-grey" />
        }
      </button>

      {/* Checklist items */}
      {!collapsed && (
        <div className="border-t border-brand-border-grey px-4 py-3">
          <p className="text-xs text-brand-mid-grey mb-3">
            As the project owner on Self Verify, you are responsible for confirming
            this stage is complete before releasing payment. Check each item.
          </p>

          <ul className="space-y-2.5">
            {guide.beforeApprove.map((item, i) => (
              <li key={i}>
                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={checked.has(i)}
                    onChange={() => toggle(i)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-brand-border-grey accent-brand-near-black cursor-pointer"
                  />
                  <span className={`text-sm transition-colors ${
                    checked.has(i)
                      ? "line-through text-brand-mid-grey"
                      : "text-brand-near-black group-hover:text-brand-near-black"
                  }`}>
                    {item}
                  </span>
                </label>
              </li>
            ))}
          </ul>

          {allChecked && (
            <p className="mt-3 text-xs text-brand-mid-grey">
              All items confirmed. You can now mark this stage complete.
            </p>
          )}

          {!allChecked && (
            <p className="mt-3 text-xs text-brand-mid-grey">
              Check all {total} items to enable stage completion.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
