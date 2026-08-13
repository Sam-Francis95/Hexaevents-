import { cn } from '../../utils/cn';

const TONES = {
  neutral: 'bg-ink-900/5 text-ink-700',
  accent: 'bg-accent-50 text-accent-700',
  success: 'bg-success-50 text-success-700',
  warning: 'bg-warning-50 text-warning-700',
  danger: 'bg-danger-50 text-danger-700',
  info: 'bg-info-50 text-info-700',
};

const DOT_TONES = {
  neutral: 'bg-ink-500',
  accent: 'bg-accent-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
  info: 'bg-info-500',
};

export function Badge({ tone = 'neutral', dot = true, className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium font-mono tracking-tight',
        TONES[tone],
        className
      )}
    >
      {dot && <span className={cn('size-1.5 rounded-full', DOT_TONES[tone])} />}
      {children}
    </span>
  );
}
