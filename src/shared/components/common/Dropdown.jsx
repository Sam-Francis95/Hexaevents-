import { forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Dropdown = forwardRef(function Dropdown(
  { label, error, options = [], placeholder = 'Select…', className, containerClassName, required, id, ...props },
  ref
) {
  const autoId = useId();
  const selectId = id || autoId;

  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-ink-700">
          {label}
          {required && <span className="text-danger-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          aria-invalid={Boolean(error)}
          className={cn(
            'h-10 w-full appearance-none rounded-lg border bg-surface pl-3.5 pr-9 text-sm text-ink-900',
            'border-border-strong hover:border-ink-300 transition-colors duration-100',
            'focus-visible:ring-2 focus-visible:ring-accent-500',
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
