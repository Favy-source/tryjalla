import type { WizardState } from "../wizardTypes";
import { computeBudgetBreakdown, formatCurrency } from "@/lib/budget-engine";
import { estimateProjectCost, getCountryCost } from "@/lib/floor-costs";
import { STAGE_PAYMENT_ALLOCATIONS } from "@/lib/constants";

interface Props {
  state: WizardState;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-brand-border-grey last:border-b-0 gap-3">
      <span className="text-xs text-brand-mid-grey flex-shrink-0">{label}</span>
      <span className="text-xs font-medium text-brand-near-black text-right">{value}</span>
    </div>
  );
}

export function StepSummary({ state }: Props) {
  const budget = parseFloat(state.budget) || 0;
  const costConfig = getCountryCost(state.country);
  const estimate = estimateProjectCost({
    countryCode: state.country,
    buildingType: state.buildingType,
    floors: state.floors,
  });

  const breakdown = budget > 0
    ? computeBudgetBreakdown({ budget, floors: state.floors })
    : null;

  const roomSummary = state.perFloorRooms && state.perFloorData
    ? `${state.perFloorData.map((f, i) => `Floor ${i + 1}: ${f.bedrooms}bd/${f.bathrooms}ba`).join(", ")}`
    : `${state.rooms.bedrooms} bed · ${state.rooms.bathrooms} bath · ${state.rooms.livingRooms} living · ${state.rooms.kitchens} kitchen`;

  return (
    <div className="space-y-5">
      <p className="text-sm text-brand-mid-grey">
        Review your project details. You can go back to change anything before creating.
      </p>

      {/* Project summary */}
      <div className="rounded-lg border border-brand-border-grey bg-white px-4">
        <Row label="Project name" value={state.name || "—"} />
        <Row label="Country" value={state.country} />
        <Row label="Project type" value={state.projectType.replace("_", " ")} />
        <Row label="Building type" value={state.buildingType || "—"} />
        <Row label="Floors" value={`${state.floors} floor${state.floors !== 1 ? "s" : ""}`} />
        <Row label="Rooms" value={roomSummary} />
        {state.boysQuartersCount > 0 && (
          <Row label="Boys quarters" value={`${state.boysQuartersCount} unit${state.boysQuartersCount !== 1 ? "s" : ""}`} />
        )}
        <Row label="Roof type" value={state.roofType || "—"} />
        {state.targetCompletionDate && (
          <Row label="Target completion" value={new Date(state.targetCompletionDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} />
        )}
      </div>

      {/* Budget or estimate */}
      {budget > 0 ? (
        <div>
          <h3 className="text-xs font-semibold text-brand-mid-grey uppercase tracking-wider mb-2">
            Stage payment plan
          </h3>
          <div className="rounded-lg border border-brand-border-grey bg-white px-4">
            {STAGE_PAYMENT_ALLOCATIONS.map(({ stage, name, pct }) => (
              <div
                key={stage}
                className="flex items-center justify-between py-2 border-b border-brand-border-grey last:border-b-0"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-brand-muted-grey w-4">{stage}</span>
                  <span className="text-xs text-brand-near-black">{name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-brand-mid-grey">{pct}%</span>
                  <span className="text-xs font-semibold text-brand-near-black">
                    {formatCurrency(Math.round((pct / 100) * budget), costConfig.currency, { compact: true })}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-brand-mid-grey text-right">
            Total: {formatCurrency(budget, costConfig.currency)}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-brand-border-grey p-4">
          <p className="text-xs font-semibold text-brand-near-black mb-1">
            Estimated budget range
          </p>
          <p className="text-xs text-brand-mid-grey mb-3">
            Based on your specifications and current {state.country} construction rates.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Low", value: estimate.low },
              { label: "Mid", value: estimate.mid },
              { label: "High", value: estimate.high },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-[10px] text-brand-mid-grey">{label}</p>
                <p className="text-sm font-semibold text-brand-near-black mt-0.5">
                  {formatCurrency(value, estimate.currency, { compact: true })}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[10px] text-brand-muted-grey">
            Estimates are indicative. Set your exact budget in Settings after creation.
          </p>
        </div>
      )}
    </div>
  );
}
