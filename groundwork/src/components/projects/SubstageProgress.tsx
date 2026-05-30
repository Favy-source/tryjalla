/**
 * SubstageProgress — compact "X / Y substages complete" bar + label.
 * Used inside StageAccordion header.
 */
interface SubstageProgressProps {
  total:     number;
  completed: number;
  className?: string;
}

export function SubstageProgress({ total, completed, className = "" }: SubstageProgressProps) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-brand-light-grey">
        <div
          className="h-full rounded-full bg-brand-near-black transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-brand-mid-grey tabular-nums">
        {completed}/{total}
      </span>
    </div>
  );
}
