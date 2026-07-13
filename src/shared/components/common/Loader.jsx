import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export function Loader({ label = 'Loading…', className, fullHeight = false }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 text-ink-500 py-12',
        fullHeight && 'min-h-[60vh]',
        className
      )}
      role="status"
    >
      <Loader2 className="size-5 animate-spin text-accent-500" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function InlineLoader({ className }) {
  return <Loader2 className={cn('size-4 animate-spin text-accent-500', className)} />;
}
