import { forwardRef, useId } from 'react';
import { cn } from '../../utils/cn';

export const Input = forwardRef(function Input(
  { label, error, hint, icon, className, containerClassName, required, id, ...props },
  ref
) {
  const autoId = useId();
  const inputId = id || autoId;

  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-ink-700">
          {label}
          {required && <span className="text-danger-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300 [&>svg]:size-4">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={cn(
            'h-10 w-full rounded-lg border bg-surface px-3.5 text-sm text-ink-900 placeholder:text-ink-300',
            'transition-colors duration-100 focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-0',
            'border-border-strong hover:border-ink-300',
            error && 'border-danger-500 hover:border-danger-500',
            icon && 'pl-10',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-danger-500">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${inputId}-hint`} className="text-xs text-ink-500">
          {hint}
        </p>
      )}
    </div>
  );
});
