import { cn } from '../../utils/cn';

export const BUTTON_VARIANTS = {
  primary: 'bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700 shadow-xs',
  secondary: 'bg-surface text-ink-900 border border-border-strong hover:bg-canvas active:bg-border/40',
  ghost: 'bg-transparent text-ink-700 hover:bg-ink-900/5 active:bg-ink-900/10',
  danger: 'bg-danger-500 text-white hover:bg-danger-700 shadow-xs',
  purple: 'bg-purple-500 text-white hover:bg-purple-600 active:bg-purple-700 shadow-xs',
};

export const BUTTON_SIZES = {
  sm: 'h-9 px-3.5 text-sm gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-base gap-2',
};

/**
 * Returns the same class string the Button component renders, for cases where a
 * link (e.g. react-router's <Link>) needs to look like a button. Avoids nesting
 * a <button> inside an <a>, which is invalid HTML.
 */
export function buttonVariants({ variant = 'primary', size = 'md', className } = {}) {
  return cn(
    'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-100',
    'active:scale-[0.97]',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    BUTTON_VARIANTS[variant],
    BUTTON_SIZES[size],
    className
  );
}
