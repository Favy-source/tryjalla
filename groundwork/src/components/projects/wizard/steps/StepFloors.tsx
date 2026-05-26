import { Minus, Plus } from "lucide-react";
import type { WizardState } from "../wizardTypes";

interface Props {
  state: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
}

export function StepFloors({ state, onChange }: Props) {
  const floors = state.floors;

  function adjust(delta: number) {
    const next = Math.max(1, Math.min(20, floors + delta));
    onChange({ floors: next });
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-brand-mid-grey">
        How many floors will the building have? Ground floor = 1.
      </p>

      {/* Stepper */}
      <div className="flex items-center justify-center gap-6 py-8">
        <button
          type="button"
          onClick={() => adjust(-1)}
          disabled={floors <= 1}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-brand-border-grey bg-white text-brand-near-black hover:bg-brand-light-grey disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Decrease floors"
        >
          <Minus className="w-5 h-5" />
        </button>

        <div className="text-center">
          <span className="block text-6xl font-bold text-brand-near-black leading-none">
            {floors}
          </span>
          <span className="mt-2 block text-sm text-brand-mid-grey">
            {floors === 1 ? "floor" : "floors"}
          </span>
        </div>

        <button
          type="button"
          onClick={() => adjust(1)}
          disabled={floors >= 20}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-brand-border-grey bg-white text-brand-near-black hover:bg-brand-light-grey disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Increase floors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Quick pick */}
      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange({ floors: n })}
            className={[
              "py-2 rounded-lg border text-sm font-medium transition-colors",
              floors === n
                ? "border-brand-near-black bg-brand-near-black text-white"
                : "border-brand-border-grey bg-white text-brand-mid-grey hover:border-brand-mid-grey hover:text-brand-near-black",
            ].join(" ")}
          >
            {n}
          </button>
        ))}
      </div>

      {floors > 2 && (
        <p className="rounded-md border border-brand-border-grey bg-brand-light-grey px-3 py-2 text-xs text-brand-mid-grey">
          Buildings with 3+ floors require a structural plan and soil test (Stage 2 substage).
        </p>
      )}
    </div>
  );
}
