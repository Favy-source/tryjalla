import type { WizardState } from "../wizardTypes";
import { PROJECT_TYPES } from "../wizardTypes";

interface Props {
  state: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
}

export function StepProjectType({ state, onChange }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-brand-mid-grey">
        Choose the type of project you're building.
      </p>

      <div className="space-y-2">
        {PROJECT_TYPES.map((pt) => (
          <button
            key={pt.value}
            type="button"
            onClick={() => onChange({ projectType: pt.value })}
            className={[
              "w-full flex items-center gap-3 px-4 py-3.5 rounded-lg border text-left transition-colors",
              state.projectType === pt.value
                ? "border-brand-near-black bg-brand-near-black text-white"
                : "border-brand-border-grey bg-white text-brand-near-black hover:border-brand-mid-grey",
            ].join(" ")}
          >
            <span className={[
              "h-4 w-4 rounded-full border-2 flex-shrink-0 transition-colors",
              state.projectType === pt.value
                ? "border-white bg-white"
                : "border-brand-border-grey",
            ].join(" ")} />
            <span className="text-sm font-medium">{pt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
