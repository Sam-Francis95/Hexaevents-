import { cn } from '../../utils/cn';

/**
 * Base pulsing skeleton block. Uses the existing ink-900 tone at low
 * opacity rather than introducing a new gray, per the design system rule
 * (Part C of the redesign brief).
 */
export function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-md bg-ink-900/[0.06]', className)} />;
}

/**
 * A row of skeleton blocks mimicking lines of text.
 */
export function SkeletonText({ lines = 3, className, lastLineWidth = 'w-2/3' }) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-3', i === lines - 1 ? lastLineWidth : 'w-full')} />
      ))}
    </div>
  );
}

/**
 * A card-shaped skeleton matching the `rounded-2xl border border-border
 * bg-surface p-4` shape used everywhere in this app, for reuse in card grids.
 */
export function SkeletonCard({ className }) {
  return (
    <div className={cn('rounded-2xl border border-border bg-surface p-4', className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <Skeleton className="h-3.5 w-3/4" />
          <Skeleton className="mt-2 h-3 w-1/2" />
        </div>
      </div>
      <SkeletonText lines={2} className="mt-4" />
    </div>
  );
}
