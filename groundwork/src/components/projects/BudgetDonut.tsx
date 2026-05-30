/**
 * BudgetDonut — 9-section budget breakdown as a greyscale PieChart.
 *
 * Uses Recharts PieChart with a custom center label showing total budget.
 * Each section gets a distinct grey shade. Hover tooltip shows name + amount + %.
 * Legend is rendered below the chart for mobile readability.
 */
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { BudgetBreakdown } from "@/lib/budget-engine";
import { formatCurrency } from "@/lib/budget-engine";

// 9 evenly-spaced greyscale shades: near-black → near-white
const GREY_SHADES = [
  "#0A0A0A", "#222222", "#3A3A3A", "#555555",
  "#707070", "#8A8A8A", "#A5A5A5", "#C0C0C0", "#DADADA",
];

interface BudgetDonutProps {
  breakdown: BudgetBreakdown | null;
  currency:  string;
}

interface CustomTooltipProps {
  active?:  boolean;
  payload?: Array<{ name: string; value: number; payload: { name: string; percentage: number; amount: number } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border border-brand-border-grey bg-white px-3 py-2 shadow-sm text-xs">
      <p className="font-semibold text-brand-near-black mb-0.5">{item.name}</p>
      <p className="text-brand-mid-grey">{item.percentage.toFixed(1)}%</p>
      <p className="text-brand-mid-grey">{formatCurrency(item.amount, "NGN")}</p>
    </div>
  );
}

interface LegendItem {
  value: string;
  payload?: { fill: string; name: string };
}

function CustomLegend({ payload }: { payload?: LegendItem[] }) {
  if (!payload) return null;
  return (
    <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3">
      {payload.map((entry, i) => (
        <li key={i} className="flex items-center gap-1.5 text-xs text-brand-mid-grey">
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm shrink-0"
            style={{ backgroundColor: entry.payload?.fill }}
          />
          {entry.value}
        </li>
      ))}
    </ul>
  );
}

export function BudgetDonut({ breakdown, currency }: BudgetDonutProps) {
  if (!breakdown || breakdown.totalBudget === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-brand-border-grey bg-white">
        <p className="text-sm text-brand-mid-grey">No budget set</p>
      </div>
    );
  }

  const data = breakdown.sectionBreakdown
    .filter((s) => s.amount > 0)
    .map((s) => ({
      name:       s.name,
      code:       s.code,
      value:      s.amount,
      amount:     s.amount,
      percentage: s.percentage,
    }));

  const centerLabel = formatCurrency(breakdown.totalBudget, currency, { compact: true });

  return (
    <div className="rounded-xl border border-brand-border-grey bg-white p-4">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={GREY_SHADES[index % GREY_SHADES.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
          {/* Center label via foreignObject */}
          <text
            x="50%"
            y="46%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-brand-near-black"
            style={{ fontSize: 18, fontWeight: 600, fill: "#0A0A0A" }}
          >
            {centerLabel}
          </text>
          <text
            x="50%"
            y="56%"
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ fontSize: 11, fill: "#888888" }}
          >
            total budget
          </text>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
