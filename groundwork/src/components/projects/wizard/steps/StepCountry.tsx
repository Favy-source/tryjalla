import type { WizardState } from "../wizardTypes";
import { SUPPORTED_COUNTRIES } from "@/lib/constants";

interface Props {
  state: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
}

export function StepCountry({ state, onChange }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-brand-mid-grey">
        Select the country where construction will take place. This determines
        the currency, cost estimates, and contractor directory.
      </p>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {SUPPORTED_COUNTRIES.map((c) => (
          <button
            key={c.code}
            type="button"
            onClick={() => onChange({ country: c.code })}
            className={[
              "flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-colors",
              state.country === c.code
                ? "border-brand-near-black bg-brand-near-black text-white"
                : "border-brand-border-grey bg-white text-brand-near-black hover:border-brand-mid-grey",
            ].join(" ")}
          >
            <span className="text-xl leading-none" aria-hidden="true">{c.flag}</span>
            <div>
              <p className={["text-sm font-medium", state.country === c.code ? "text-white" : "text-brand-near-black"].join(" ")}>
                {c.name}
              </p>
              <p className={["text-xs", state.country === c.code ? "text-white/70" : "text-brand-mid-grey"].join(" ")}>
                {c.currency}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
