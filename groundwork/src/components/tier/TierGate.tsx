/**
 * TierGate — wraps gated UI and renders it in one of three modes
 * depending on whether the current user's tier meets the minimum.
 *
 * Modes:
 *   "lock"  — show content with a lock icon overlay + upgrade CTA
 *             (user sees the feature exists but is prompted to upgrade)
 *   "blur"  — show content blurred with a semi-transparent overlay
 *             (pointer-events: none on the content so they can't interact)
 *   "hide"  — don't render children at all
 *
 * Default mode: "lock" — hiding features makes users unaware they exist.
 *
 * Usage:
 *   <TierGate minTier="hybrid" mode="lock">
 *     <ContactButton />
 *   </TierGate>
 *
 *   <TierGate minTier="hybrid" mode="blur" upgradeCta="Upgrade to contact professionals">
 *     <PhoneNumber />
 *   </TierGate>
 */
import { type ReactNode } from "react";
import { Link } from "react-router";
import { Lock } from "lucide-react";
import { useTier } from "@/hooks/useTier";
import { type Tier } from "@/lib/tier-features";

interface TierGateProps {
  /** Minimum tier required to access the content */
  minTier: Tier;

  /**
   * How to handle gated content:
   * - "lock"  → visible but locked (lock icon + upgrade CTA)
   * - "blur"  → visible but blurred (pointer-events:none)
   * - "hide"  → not rendered at all
   * @default "lock"
   */
  mode?: "lock" | "blur" | "hide";

  /** Custom upgrade CTA text shown in lock/blur modes */
  upgradeCta?: string;

  children: ReactNode;
}

export function TierGate({
  minTier,
  mode = "lock",
  upgradeCta,
  children,
}: TierGateProps) {
  const { meetsMin } = useTier();

  // User has access — render children normally
  if (meetsMin(minTier)) {
    return <>{children}</>;
  }

  // ── hide ──────────────────────────────────────────────────────────────────
  if (mode === "hide") {
    return null;
  }

  const ctaText = upgradeCta ?? "Upgrade your plan to access this feature";

  // ── blur ──────────────────────────────────────────────────────────────────
  if (mode === "blur") {
    return (
      <div className="relative" aria-label={ctaText}>
        {/* Content — blurred and non-interactive */}
        <div
          className="select-none blur-sm"
          style={{ pointerEvents: "none" }}
          aria-hidden="true"
        >
          {children}
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 rounded-lg">
          <Lock className="w-4 h-4 text-brand-mid-grey mb-1.5" aria-hidden="true" />
          <p className="text-xs text-brand-mid-grey text-center px-3 leading-snug">
            {ctaText}
          </p>
          <Link
            to="/settings/billing"
            className="mt-2 text-xs font-semibold text-brand-near-black underline underline-offset-2 hover:no-underline"
          >
            Upgrade plan →
          </Link>
        </div>
      </div>
    );
  }

  // ── lock (default) ────────────────────────────────────────────────────────
  return (
    <div
      className="relative rounded-lg border border-dashed border-brand-border-grey bg-brand-light-grey p-4"
      aria-label={ctaText}
    >
      {/* Content shown but visually dim — user can see what they'd get */}
      <div
        className="pointer-events-none select-none opacity-40"
        aria-hidden="true"
      >
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg p-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-border-grey bg-white">
          <Lock className="h-3.5 w-3.5 text-brand-mid-grey" aria-hidden="true" />
        </div>
        <p className="text-center text-xs text-brand-mid-grey leading-snug max-w-[180px]">
          {ctaText}
        </p>
        <Link
          to="/settings/billing"
          className="inline-flex items-center rounded-md bg-brand-near-black px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-rich-black transition-colors"
        >
          Upgrade plan
        </Link>
      </div>
    </div>
  );
}
