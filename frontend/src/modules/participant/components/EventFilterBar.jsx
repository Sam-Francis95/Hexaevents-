import { SlidersHorizontal } from 'lucide-react';
import { SearchInput } from '../../../shared/components/common/SearchInput';
import { Dropdown } from '../../../shared/components/common/Dropdown';
import { getCategoryTheme } from '../utils/categoryTheme';
import { cn } from '../../../shared/utils/cn';

const MODE_OPTIONS = [
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'In-person' },
  { value: 'hybrid', label: 'Hybrid' },
];

// Static class-string maps so Tailwind's content scanner can find every
// class at build time (matches the pattern used in EventCard/EventBanner).
const CHIP_ACTIVE = {
  accent: 'border-accent-500 bg-accent-50 text-accent-700',
  purple: 'border-purple-500 bg-purple-50 text-purple-700',
  success: 'border-success-500 bg-success-50 text-success-700',
  warning: 'border-warning-500 bg-warning-50 text-warning-700',
  info: 'border-info-500 bg-info-50 text-info-700',
};

export function EventFilterBar({ search, onSearchChange, category, onCategoryChange, mode, onModeChange, categories = [] }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput value={search} onChange={onSearchChange} placeholder="Search events by title or description…" className="sm:flex-1" />
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="hidden size-4 text-ink-300 sm:block" />
          <Dropdown
            value={mode}
            onChange={(e) => onModeChange(e.target.value)}
            options={MODE_OPTIONS}
            placeholder="All formats"
            containerClassName="w-36"
          />
        </div>
      </div>

      {/* Category chip/pill selector — replaces the old plain Dropdown so
          scanning categories is visual (icon + tone per category). */}
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => onCategoryChange('')}
          className={cn(
            'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors active:scale-[0.97]',
            category === '' ? 'border-ink-900 bg-ink-900 text-white' : 'border-border-strong text-ink-700 hover:border-ink-300'
          )}
        >
          All categories
        </button>
        {categories.map((c) => {
          const { icon: Icon, tone } = getCategoryTheme(c);
          const isActive = category === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => onCategoryChange(isActive ? '' : c)}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors active:scale-[0.97]',
                isActive ? CHIP_ACTIVE[tone] : 'border-border-strong text-ink-700 hover:border-ink-300'
              )}
            >
              <Icon className="size-3.5" /> {c}
            </button>
          );
        })}
      </div>

      {/* Popular-category search suggestions, shown only while the search
          box is empty (Part H.4). No persistence/localStorage needed — just
          surfaces the existing categories list. */}
      {!search && categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-ink-500">
          <span>Popular:</span>
          {categories.slice(0, 5).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onCategoryChange(c)}
              className="rounded-full bg-canvas px-2.5 py-1 font-medium text-ink-700 transition-colors hover:bg-ink-900/[0.06] active:scale-[0.97]"
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
