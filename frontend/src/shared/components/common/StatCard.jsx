import { ArrowUpRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useCountUp } from '../../hooks/useCountUp';

const TONES = {
  accent: 'bg-accent-50 text-accent-600',
  purple: 'bg-purple-50 text-purple-600',
  success: 'bg-success-50 text-success-600',
  warning: 'bg-warning-50 text-warning-600',
  info: 'bg-info-50 text-info-600',
};

export function StatCard({ label, value, icon: Icon, tone = 'accent', trend, className }) {
  // Animate numeric values on mount/change (Phase 1 "count-up" motion
  // primitive). Non-numeric values (rare, but keep this component generic)
  // render as-is.
  const isNumeric = typeof value === 'number' && Number.isFinite(value);
  const animatedValue = useCountUp(isNumeric ? value : 0);

  return (
    <div className={cn('rounded-2xl border border-border bg-surface p-5 shadow-card transition-shadow hover:shadow-card-hover', className)}>
      <div className="flex items-center gap-3">
        {Icon && (
          <span className={cn('flex size-12 shrink-0 items-center justify-center rounded-full', TONES[tone])}>
            <Icon className="size-5" />
          </span>
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink-500">{label}</p>
          <p className="text-2xl font-bold tabular text-ink-900">{isNumeric ? animatedValue : value}</p>
        </div>
      </div>
      {trend && (
        <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-success-600">
          <ArrowUpRight className="size-3.5" /> {trend}
        </p>
      )}
    </div>
  );
}
