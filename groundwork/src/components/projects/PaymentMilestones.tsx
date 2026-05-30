/**
 * PaymentMilestones — table of all 10 stages showing payment status.
 *
 * Status differentiation: bold font + solid border (Paid), medium + dashed (Partial),
 * light + no border (Unpaid) — greyscale only, no color.
 *
 * "Record payment" button appears on active (in_progress / awaiting_approval /
 * completed) stages that are not yet fully paid.
 */
import { DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/budget-engine";
import type { StageData } from "./StageAccordion";

interface PaymentMilestonesProps {
  stages:           StageData[];
  currency?:        string;
  onRecordPayment:  (stageId: string) => void;
  canRecordPayment: boolean;
}

// ── Payment status badge ──────────────────────────────────────────────────────

function PaymentBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    paid:    "border border-brand-near-black font-semibold text-brand-near-black",
    partial: "border border-dashed border-brand-mid-grey text-brand-near-black",
    pending: "text-brand-mid-grey",
    unpaid:  "text-brand-mid-grey",
  };
  const label: Record<string, string> = {
    paid:    "Paid",
    partial: "Partial",
    pending: "Unpaid",
    unpaid:  "Unpaid",
  };
  const cls = config[status] ?? config.unpaid;
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs ${cls}`}>
      {label[status] ?? "Unpaid"}
    </span>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PaymentMilestones({
  stages, currency = "NGN", onRecordPayment, canRecordPayment,
}: PaymentMilestonesProps) {
  const sorted = [...stages].sort((a, b) => a.stage_number - b.stage_number);

  const totalBudget = sorted.reduce((s, st) => s + (st.payment_amount ?? 0), 0);
  const totalPaid   = sorted
    .filter((s) => s.payment_status === "paid")
    .reduce((s, st) => s + (st.payment_amount ?? 0), 0);
  const paidPct = totalBudget > 0 ? Math.round((totalPaid / totalBudget) * 100) : 0;

  const activeStatuses = new Set(["in_progress", "awaiting_approval", "completed"]);

  return (
    <div className="rounded-xl border border-brand-border-grey bg-white overflow-hidden">
      {/* Summary bar */}
      <div className="border-b border-brand-border-grey px-4 py-3 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs text-brand-mid-grey mb-1">
            {formatCurrency(totalPaid, currency)} paid of {formatCurrency(totalBudget, currency)}
          </p>
          <div className="h-1.5 w-40 overflow-hidden rounded-full bg-brand-light-grey">
            <div
              className="h-full rounded-full bg-brand-near-black transition-all"
              style={{ width: `${paidPct}%` }}
            />
          </div>
        </div>
        <span className="shrink-0 text-sm font-semibold text-brand-near-black tabular-nums">
          {paidPct}%
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border-grey bg-brand-light-grey">
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-brand-mid-grey">Stage</th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold text-brand-mid-grey">Amount</th>
              <th className="px-4 py-2.5 text-center text-xs font-semibold text-brand-mid-grey">%</th>
              <th className="px-4 py-2.5 text-center text-xs font-semibold text-brand-mid-grey">Status</th>
              <th className="px-4 py-2.5 text-center text-xs font-semibold text-brand-mid-grey"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border-grey">
            {sorted.map((stage) => {
              const canRecord = canRecordPayment
                && activeStatuses.has(stage.status)
                && stage.payment_status !== "paid";

              return (
                <tr key={stage.id} className={stage.is_locked ? "opacity-50" : ""}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-brand-border-grey text-xs text-brand-mid-grey">
                        {stage.stage_number}
                      </span>
                      <span className="text-sm text-brand-near-black">{stage.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm tabular-nums text-brand-near-black">
                    {stage.payment_amount
                      ? formatCurrency(stage.payment_amount, currency)
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-brand-mid-grey tabular-nums">
                    {stage.payment_percentage}%
                  </td>
                  <td className="px-4 py-3 text-center">
                    <PaymentBadge status={stage.payment_status ?? "unpaid"} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    {canRecord && (
                      <button
                        onClick={() => onRecordPayment(stage.id)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-brand-border-grey px-2.5 py-1 text-xs text-brand-near-black hover:border-brand-near-black transition-colors"
                      >
                        <DollarSign className="h-3 w-3" />
                        Record
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
