import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../utils/cn';

export function StarRating({ value = 0, onChange, readOnly = false, size = 'md' }) {
  const [hovered, setHovered] = useState(0);
  const sizes = { sm: 'size-4', md: 'size-6', lg: 'size-8' };
  const display = hovered || value;

  return (
    <div className={cn('flex items-center gap-1', readOnly && 'pointer-events-none')} role={readOnly ? undefined : 'radiogroup'} aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange?.(star)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={cn(
              sizes[size],
              star <= display ? 'fill-warning-500 text-warning-500' : 'fill-transparent text-ink-300'
            )}
          />
        </button>
      ))}
    </div>
  );
}
