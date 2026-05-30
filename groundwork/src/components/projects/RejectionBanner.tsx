/**
 * RejectionBanner — shown at the top of a stage when one or more substages
 * have been rejected by a Jalla Professional.
 *
 * Summarises what needs fixing and prompts the owner to re-upload evidence.
 * Greyscale only — severity communicated through font weight and border, not color.
 */
import { AlertCircle } from "lucide-react";
import type { SubstageData } from "./SubstageRow";

interface RejectionBannerProps {
  substages: SubstageData[];
}

export function RejectionBanner({ substages }: RejectionBannerProps) {
  const rejected = substages.filter((s) => s.status === "rejected");
  if (rejected.length === 0) return null;

  return (
    <div className="mx-4 mt-3 mb-1 rounded-lg border border-brand-near-black bg-white px-4 py-3">
      <div className="flex items-start gap-2">
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-brand-near-black" />
        <div>
          <p className="text-sm font-semibold text-brand-near-black">
            {rejected.length} substage{rejected.length !== 1 ? "s" : ""} require{rejected.length === 1 ? "s" : ""} attention
          </p>
          <p className="text-xs text-brand-mid-grey mt-0.5">
            Your Jalla Professional has flagged the following items. Upload new evidence and resubmit.
          </p>
          <ul className="mt-2 space-y-1">
            {rejected.map((s) => (
              <li key={s.id} className="text-xs text-brand-near-black">
                <span className="font-medium">{s.substage_number}. {s.name}</span>
                {s.rejection_note && (
                  <span className="text-brand-mid-grey"> — {s.rejection_note}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
