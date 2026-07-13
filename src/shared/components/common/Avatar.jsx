import { cn } from '../../utils/cn';
import { initials } from '../../utils/formatters';

const SIZES = {
  sm: 'size-7 text-xs',
  md: 'size-9 text-sm',
  lg: 'size-12 text-base',
};

export function Avatar({ name = '', src, size = 'md', className }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('rounded-full object-cover shrink-0', SIZES[size], className)}
      />
    );
  }
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-accent-100 text-accent-700 font-semibold shrink-0',
        SIZES[size],
        className
      )}
      aria-label={name}
    >
      {initials(name) || '?'}
    </div>
  );
}
