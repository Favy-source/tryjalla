import { Minus, Plus } from "lucide-react";
import type { WizardState } from "../wizardTypes";

interface Props {
  state: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
}

export function StepBoysQuarters({ state, onChange }: Props) {
  const count = state.boysQuartersCount;

  function adjust(delta: number) {
    onChange({ boysQuartersCount: Math.max(0, Math.min(5, count + delta)) });
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-brand-mid-grey">
        Boys quarters (BQ) are separate staff accommodation units on the
        property. Enter 0 if not required.
      </p>

      {/* Stepper */}
      <div className="flex items-center justify-center gap-6 py-8">
        <button
          type="button"
          onClick={() => adjust(-1)}
          disabled={count <= 0}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-brand-border-grey bg-white text-brand-near-black hover:bg-brand-light-grey disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Decrease boys quarters"
        >
          <Minus className="w-5 h-5" />
        </button>

        <div className="text-center">
          <span className="block text-6xl font-bold text-brand-near-black leading-none">
            {count}
          </span>
          <span className="mt-2 block text-sm text-brand-mid-grey">
            {count === 1 ? "unit" : "units"}
          </span>
        </div>

        <button
          type="button"
          onClick={() => adjust(1)}
          disabled={count >= 5}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-brand-border-grey bg-white text-brand-near-black hover:bg-brand-light-grey disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Increase boys quarters"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {count === 0 && (
        <p className="text-center text-sm text-brand-mid-grey">
          No boys quarters — skip to next step.
        </p>
      )}
    </div>
  );
}
