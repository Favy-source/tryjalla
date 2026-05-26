import { useAuth } from "@/hooks/useAuth";
import { TIER_LABELS } from "@/lib/constants";

export function meta() {
  return [
    { title: "Dashboard — Groundwork by Jalla" },
    { name: "description", content: "Your construction project overview." },
  ];
}

export default function DashboardPage() {
  const { profile } = useAuth();

  const tierLabel =
    TIER_LABELS[profile?.subscription_tier ?? "self_serve"] ?? "Self Verify";

  return (
    <div className="p-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-near-black">Dashboard</h1>
        <p className="text-brand-mid-grey mt-1 text-sm">
          Welcome back
          {profile?.display_name ? `, ${profile.display_name}` : ""}. Here's
          your project overview.
        </p>
      </div>

      {/* Tier badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-brand-border-grey rounded-full mb-8">
        <span className="text-xs font-medium text-brand-near-black">
          {tierLabel} tier
        </span>
      </div>

      {/* Empty state — projects will be added in Day 7 */}
      <div className="flex flex-col items-center justify-center py-24 border border-dashed border-brand-border-grey rounded-xl bg-white">
        <div className="w-12 h-12 rounded-full border border-brand-border-grey flex items-center justify-center mb-4">
          <svg
            className="w-5 h-5 text-brand-mid-grey"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z"
            />
          </svg>
        </div>
        <h2 className="text-base font-semibold text-brand-near-black mb-1">
          No projects yet
        </h2>
        <p className="text-sm text-brand-mid-grey text-center max-w-xs">
          Create your first project to start tracking your construction build
          stage by stage.
        </p>
        <button
          type="button"
          className="mt-6 px-5 py-2.5 bg-brand-black text-white text-sm font-medium rounded-lg hover:bg-brand-near-black transition-colors"
          onClick={() => {
            /* project wizard — Day 4 */
          }}
        >
          + New Project
        </button>
      </div>
    </div>
  );
}
