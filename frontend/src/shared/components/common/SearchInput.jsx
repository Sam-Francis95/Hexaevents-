import { Search, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export function SearchInput({ value, onChange, placeholder = 'Search…', className }) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-300" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-border-strong bg-surface pl-10 pr-9 text-sm text-ink-900 placeholder:text-ink-300 transition-colors focus-visible:ring-2 focus-visible:ring-accent-500 hover:border-ink-300"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-700"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
