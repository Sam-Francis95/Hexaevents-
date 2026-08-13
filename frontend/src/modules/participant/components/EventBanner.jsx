import { useId } from 'react';
import { cn } from '../../../shared/utils/cn';
import { getCategoryTheme } from '../utils/categoryTheme';

// Static class-string maps (not template literals) so Tailwind's content
// scanner can find every class at build time — see Part C of the redesign
// brief: every color must come from the existing token table.
const TONE_BG = {
  accent: 'bg-accent-500',
  purple: 'bg-purple-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  info: 'bg-info-500',
};

/**
 * Lightweight, category-tinted abstract banner. Replaces the old flat
 * `style={{ backgroundColor: event.bannerColor }}` strip with a single
 * reusable inline SVG dot pattern (no external assets) whose only variable
 * is the tone color — cheap to render across many cards.
 */
export function EventBanner({ category, className, showIcon = false }) {
  const { icon: Icon, tone } = getCategoryTheme(category);
  const patternId = useId();

  return (
    <div className={cn('relative overflow-hidden', TONE_BG[tone], className)}>
      <svg className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <pattern id={patternId} width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="1.6" fill="white" fillOpacity="0.22" />
            <circle cx="14" cy="14" r="1.6" fill="white" fillOpacity="0.14" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
      {showIcon && Icon && (
        <Icon className="absolute right-3 top-1/2 size-8 -translate-y-1/2 text-white/25" />
      )}
    </div>
  );
}
