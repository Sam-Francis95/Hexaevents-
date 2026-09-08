import { cn } from '../../utils/cn';

export const BUTTON_VARIANTS = {
  primary: 'bg-banner-gradient text-white hover:opacity-90 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:opacity-100',
  secondary: 'bg-surface text-ink-900 border border-border-strong hover:bg-canvas hover:border-accent-500/50 hover:text-accent-600 active:bg-border/40 shadow-xs hover:shadow-sm',
  ghost: 'bg-transparent text-ink-700 hover:bg-ink-900/5 hover:text-ink-900 active:bg-ink-900/10',
  danger: 'bg-danger-500 text-white hover:bg-danger-700 shadow-md hover:shadow-lg',
  purple: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:opacity-90 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:opacity-100',
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
