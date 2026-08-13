import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-1 py-3">
      <span className="text-sm text-ink-500">
        Page <span className="font-medium text-ink-900 tabular">{page}</span> of{' '}
        <span className="font-medium text-ink-900 tabular">{totalPages}</span>
      </span>
      <div className="flex gap-1.5">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className={cn(
            'flex size-8 items-center justify-center rounded-lg border border-border-strong text-ink-700',
            'hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed'
          )}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          className={cn(
            'flex size-8 items-center justify-center rounded-lg border border-border-strong text-ink-700',
            'hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed'
          )}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
