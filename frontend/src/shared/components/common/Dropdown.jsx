import { forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Dropdown = forwardRef(function Dropdown(
  { label, error, options = [], placeholder = 'Select…', className, containerClassName, required, id, getOptionIcon, value, ...props },
  ref
) {
  const autoId = useId();
  const selectId = id || autoId;

  // Native <select> can't render arbitrary icon markup per-option across
  // browsers, so when getOptionIcon is supplied we show the *currently
  // selected* option's icon as a leading glyph on the closed control — the
  // list itself still opens as a plain native dropdown. (Part G.3 calls
  // this out as a minimal extension; a full icon-per-row picker is the
  // chip/pill selector built in Phase 2.)
  const SelectedIcon = getOptionIcon ? getOptionIcon(value) : null;

  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-ink-700">
          {label}
          {required && <span className="text-danger-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {SelectedIcon && (
          <SelectedIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-500" />
        )}
        <select
          ref={ref}
          id={selectId}
          value={value}
          aria-invalid={Boolean(error)}
          className={cn(
            'h-10 w-full appearance-none rounded-lg border bg-surface pl-3.5 pr-9 text-sm text-ink-900',
            'border-border-strong hover:border-ink-300 transition-colors duration-100',
            'focus-visible:ring-2 focus-visible:ring-accent-500',
            SelectedIcon && 'pl-9',
            error && 'border-danger-500',
            className
          )}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-300" />
      </div>
      {error && <p className="text-xs text-danger-500">{error}</p>}
    </div>
  );
});
