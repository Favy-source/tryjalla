import type { WizardState } from "../wizardTypes";
import { BUILDING_TYPES } from "../wizardTypes";

interface Props {
  state: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
}

export function StepBuildingType({ state, onChange }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-brand-mid-grey">
        Select the type of building you're constructing.
      </p>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {BUILDING_TYPES.map((bt) => {
          const selected = state.buildingType === bt.value;
          return (
            <button
              key={bt.value}
              type="button"
              onClick={() => onChange({ buildingType: bt.value })}
              className={[
                "flex flex-col items-start gap-1 px-4 py-4 rounded-lg border text-left transition-colors",
                selected
                  ? "border-brand-near-black bg-brand-near-black"
                  : "border-brand-border-grey bg-white hover:border-brand-mid-grey",
              ].join(" ")}
            >
              <span className={["text-sm font-semibold", selected ? "text-white" : "text-brand-near-black"].join(" ")}>
                {bt.label}
              </span>
              <span className={["text-xs leading-snug", selected ? "text-white/70" : "text-brand-mid-grey"].join(" ")}>
                {bt.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
