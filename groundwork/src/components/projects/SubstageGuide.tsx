/**
 * SubstageGuide — inline expandable guide for Self-Verify users.
 *
 * Shown only for self_serve tier. Appears as a small "?" button next to the
 * substage name. Expands inline to show:
 *   - What to physically check
 *   - What evidence to capture (photos, documents)
 *   - Red flags to watch for
 *   - One practical tip
 *
 * Greyscale throughout. Uses the static guide data from stage-guides.ts.
 */
import { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp, Camera, AlertTriangle, CheckSquare, Lightbulb } from "lucide-react";
import { getSubstageGuide } from "@/lib/stage-guides";

interface SubstageGuideProps {
  stageNumber:    number;
  substageNumber: number;
}

export function SubstageGuide({ stageNumber, substageNumber }: SubstageGuideProps) {
  const [open, setOpen] = useState(false);
  const guide = getSubstageGuide(stageNumber, substageNumber);

  if (!guide) return null;

  return (
    <span className="inline-flex items-center">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        className="inline-flex items-center gap-0.5 rounded-md border border-brand-border-grey px-1.5 py-0.5 text-xs text-brand-mid-grey hover:border-brand-near-black hover:text-brand-near-black transition-colors ml-1.5"
        aria-label="Show verification guide"
      >
        <HelpCircle className="h-3 w-3" />
        Guide
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {open && (
        <span
          className="block w-full mt-3 rounded-xl border border-brand-border-grey bg-white p-4 space-y-3 text-xs"
          onClick={(e) => e.stopPropagation()}
        >
          {/* What to check */}
          <div>
            <div className="flex items-center gap-1.5 font-semibold text-brand-near-black mb-1.5">
              <CheckSquare className="h-3.5 w-3.5 shrink-0" />
              What to verify on site
            </div>
            <ul className="space-y-1 pl-5 list-disc text-brand-mid-grey">
              {guide.whatToCheck.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Evidence to capture */}
          <div>
            <div className="flex items-center gap-1.5 font-semibold text-brand-near-black mb-1.5">
              <Camera className="h-3.5 w-3.5 shrink-0" />
              Evidence to capture
            </div>
            <ul className="space-y-1 pl-5 list-disc text-brand-mid-grey">
              {guide.evidenceToCapture.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Red flags */}
          <div>
            <div className="flex items-center gap-1.5 font-semibold text-brand-near-black mb-1.5">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              Red flags
            </div>
            <ul className="space-y-1 pl-5 list-disc text-brand-mid-grey">
              {guide.redFlags.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Tip */}
          {guide.tip && (
            <div className="rounded-lg border border-brand-border-grey bg-brand-light-grey px-3 py-2.5">
              <div className="flex items-center gap-1.5 font-semibold text-brand-near-black mb-1">
                <Lightbulb className="h-3.5 w-3.5 shrink-0" />
                Pro tip
              </div>
              <p className="text-brand-mid-grey">{guide.tip}</p>
            </div>
          )}
        </span>
      )}
    </span>
  );
}
