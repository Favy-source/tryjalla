import type { WizardState } from "../wizardTypes";
import { getCountryCost } from "@/lib/floor-costs";

interface Props {
  state: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
}

export function StepDetails({ state, onChange }: Props) {
  const costConfig = getCountryCost(state.country);

  return (
    <div className="space-y-5">
      <p className="text-sm text-brand-mid-grey">
        Name your project and set the total budget. You can update these later.
      </p>

      {/* Project name */}
      <div>
        <label
          htmlFor="project-name"
          className="block text-sm font-medium text-brand-near-black mb-1.5"
        >
          Project name <span className="text-brand-mid-grey font-normal">(required)</span>
        </label>
        <input
          id="project-name"
          type="text"
          value={state.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="e.g. Abuja family home — Phase 1"
          maxLength={100}
          className="w-full rounded-lg border border-brand-border-grey bg-white px-3 py-2.5 text-sm text-brand-near-black placeholder:text-brand-muted-grey focus:outline-none focus:ring-2 focus:ring-brand-near-black/20 focus:border-brand-near-black transition-colors"
        />
      </div>

      {/* Budget */}
      <div>
        <label
          htmlFor="budget"
          className="block text-sm font-medium text-brand-near-black mb-1.5"
        >
          Total budget
          <span className="ml-1 text-xs font-normal text-brand-mid-grey">
            ({costConfig.currency})
          </span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-brand-mid-grey select-none">
            {costConfig.currencySymbol}
          </span>
          <input
            id="budget"
            type="number"
            min={0}
            value={state.budget}
            onChange={(e) => onChange({ budget: e.target.value })}
            placeholder="0"
            className="w-full rounded-lg border border-brand-border-grey bg-white pl-8 pr-3 py-2.5 text-sm text-brand-near-black placeholder:text-brand-muted-grey focus:outline-none focus:ring-2 focus:ring-brand-near-black/20 focus:border-brand-near-black transition-colors"
          />
        </div>
        <p className="mt-1 text-xs text-brand-mid-grey">
          Leave blank to set later. The budget drives stage payment calculations.
        </p>
      </div>

      {/* Target completion */}
      <div>
        <label
          htmlFor="target-date"
          className="block text-sm font-medium text-brand-near-black mb-1.5"
        >
          Target completion date
          <span className="ml-1 text-xs font-normal text-brand-mid-grey">(optional)</span>
        </label>
        <input
          id="target-date"
          type="date"
          value={state.targetCompletionDate}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => onChange({ targetCompletionDate: e.target.value })}
          className="w-full rounded-lg border border-brand-border-grey bg-white px-3 py-2.5 text-sm text-brand-near-black focus:outline-none focus:ring-2 focus:ring-brand-near-black/20 focus:border-brand-near-black transition-colors"
        />
      </div>
    </div>
  );
}
