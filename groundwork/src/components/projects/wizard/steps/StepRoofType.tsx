import type { WizardState } from "../wizardTypes";
import { ROOF_TYPES } from "../wizardTypes";

interface Props {
  state: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
}

export function StepRoofType({ state, onChange }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-brand-mid-grey">
        Choose your preferred roof style. This affects Stage 6 (Roofing) costs.
      </p>

      <div className="grid grid-cols-2 gap-2">
        {ROOF_TYPES.map((rt) => {
          const selected = state.roofType === rt.value;
          return (
            <button
              key={rt.value}
              type="button"
              onClick={() => onChange({ roofType: rt.value })}
              className={[
                "flex flex-col items-start gap-1 px-4 py-4 rounded-lg border text-left transition-colors",
                selected
                  ? "border-brand-near-black bg-brand-near-black"
                  : "border-brand-border-grey bg-white hover:border-brand-mid-grey",
              ].join(" ")}
            >
              <span className={["text-sm font-semibold", selected ? "text-white" : "text-brand-near-black"].join(" ")}>
                {rt.label}
              </span>
              <span className={["text-xs leading-snug", selected ? "text-white/70" : "text-brand-mid-grey"].join(" ")}>
                {rt.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
