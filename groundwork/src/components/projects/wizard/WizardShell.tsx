/**
 * WizardShell — shared chrome for all 9 wizard steps.
 * Renders the progress bar, step indicator, step title, and Back/Next buttons.
 * Content is rendered via children.
 */
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WizardShellProps {
  currentStep: number;   // 1–9
  totalSteps?: number;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  isSubmitting?: boolean;
  children: React.ReactNode;
}

export function WizardShell({
  currentStep,
  totalSteps = 9,
  title,
  subtitle,
  onBack,
  onNext,
  nextLabel = "Next",
  nextDisabled = false,
  isSubmitting = false,
  children,
}: WizardShellProps) {
  const progress = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="min-h-screen bg-brand-light-grey flex flex-col">
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-brand-border-grey px-4 py-4 flex-shrink-0">
        <div className="max-w-2xl mx-auto">
          {/* Step counter + progress */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-brand-mid-grey">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-xs font-medium text-brand-mid-grey">
              {progress}%
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-brand-border-grey rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-near-black rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          {/* Step dots */}
          <div className="flex gap-1.5 mt-3">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={[
                  "h-1 flex-1 rounded-full transition-colors",
                  i + 1 < currentStep
                    ? "bg-brand-near-black"
                    : i + 1 === currentStep
                      ? "bg-brand-mid-grey"
                      : "bg-brand-border-grey",
                ].join(" ")}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Step heading ────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-brand-border-grey px-4 py-5 flex-shrink-0">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-semibold text-brand-near-black">{title}</h1>
          {subtitle && (
            <p className="text-sm text-brand-mid-grey mt-1">{subtitle}</p>
          )}
        </div>
      </div>

      {/* ── Step content ────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">{children}</div>
      </div>

      {/* ── Navigation ──────────────────────────────────────────────────────── */}
      <div className="bg-white border-t border-brand-border-grey px-4 py-4 flex-shrink-0">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={!onBack}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-brand-border-grey text-sm font-medium text-brand-mid-grey hover:bg-brand-light-grey hover:text-brand-near-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled || isSubmitting}
            className="flex items-center gap-1.5 px-6 py-2 rounded-lg bg-brand-near-black text-sm font-medium text-white hover:bg-brand-rich-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Creating…
              </>
            ) : (
              <>
                {nextLabel}
                {nextLabel === "Next" && <ChevronRight className="w-4 h-4" />}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
