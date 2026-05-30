/**
 * FloorCostBreakdown — table showing the 9-section budget breakdown.
 *
 * Section 400 (Upper Floor Elevation) is visually dimmed for single-floor builds
 * since it redistributes to sections 300 and 500 in that case.
 */
import type { BudgetBreakdown } from "@/lib/budget-engine";
import { formatCurrency } from "@/lib/budget-engine";

interface FloorCostBreakdownProps {
  breakdown: BudgetBreakdown | null;
  floors:    number;
  currency?: string;
}

export function FloorCostBreakdown({ breakdown, floors, currency = "NGN" }: FloorCostBreakdownProps) {
  if (!breakdown || breakdown.totalBudget === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-brand-border-grey bg-white">
        <p className="text-sm text-brand-mid-grey">No budget set</p>
      </div>
    );
  }

  const isBungalow = floors === 1;

  return (
    <div className="rounded-xl border border-brand-border-grey bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border-grey bg-brand-light-grey">
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-brand-mid-grey">Section</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-brand-mid-grey">Name</th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold text-brand-mid-grey">%</th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold text-brand-mid-grey">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border-grey">
            {breakdown.sectionBreakdown.map((section) => {
              const isUpper = section.code === 400;
              const dimmed  = isUpper && isBungalow;
              return (
                <tr
                  key={section.code}
                  className={dimmed ? "opacity-40" : ""}
                >
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center justify-center rounded bg-brand-light-grey px-1.5 py-0.5 text-xs font-mono text-brand-mid-grey">
                      {section.code}
                    </span>
                  </td>
                  <td className={`px-4 py-2.5 text-sm ${dimmed ? "line-through text-brand-mid-grey" : "text-brand-near-black"}`}>
                    {section.name}
                    {section.isPerFloor && !dimmed && (
                      <span className="ml-1.5 text-xs text-brand-mid-grey">
                        ×{floors} floor{floors !== 1 ? "s" : ""}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs text-brand-mid-grey tabular-nums">
                    {dimmed ? "—" : `${section.percentage.toFixed(1)}%`}
                  </td>
                  <td className="px-4 py-2.5 text-right text-sm font-medium text-brand-near-black tabular-nums">
                    {dimmed ? "—" : formatCurrency(section.amount, currency)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-brand-near-black bg-brand-light-grey">
              <td colSpan={2} className="px-4 py-2.5 text-xs font-semibold text-brand-near-black">
                Total
              </td>
              <td className="px-4 py-2.5 text-right text-xs font-semibold text-brand-near-black tabular-nums">
                100%
              </td>
              <td className="px-4 py-2.5 text-right text-sm font-semibold text-brand-near-black tabular-nums">
                {formatCurrency(breakdown.totalBudget, currency)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
