import { useEffect, useRef, useState } from 'react';
import { Compass, CalendarCheck, Star, Trophy } from 'lucide-react';
import { computeParticipationLevel } from '../../../shared/utils/gamification';
import { cn } from '../../../shared/utils/cn';

const TIER_ICONS = { Compass, CalendarCheck, Star, Trophy };

/**
 * Shows the participant's current Participation Level with a progress bar
 * toward the next tier. Plays the badge-unlock animation once, the first
 * time a *new* tier is reached in this component's lifetime — not on every
 * render/navigation (Part I.1).
 */
export function ParticipationLevelCard({ stats, size = 'md', className }) {
  const { tier, next, progress, score } = computeParticipationLevel(stats);
  const TierIcon = TIER_ICONS[tier.icon];

  const prevTierKeyRef = useRef(null);
  const [justUnlocked, setJustUnlocked] = useState(false);

  useEffect(() => {
    if (prevTierKeyRef.current !== null && prevTierKeyRef.current !== tier.key) {
      setJustUnlocked(true);
      const t = setTimeout(() => setJustUnlocked(false), 900);
      return () => clearTimeout(t);
    }
    prevTierKeyRef.current = tier.key;
  }, [tier.key]);

  // progress-fill primitive (Part G.1): start at 0, animate to the real
  // value one tick after mount via the width transition already on the bar.
  const [displayProgress, setDisplayProgress] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setDisplayProgress(progress * 100), 50);
    return () => clearTimeout(t);
  }, [progress]);

  const isLarge = size === 'lg';

  return (
    <div className={cn('rounded-2xl border border-border bg-surface p-4', isLarge && 'p-5', className)}>
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'flex shrink-0 items-center justify-center rounded-full bg-purple-50 text-purple-600',
            isLarge ? 'size-14' : 'size-11',
            justUnlocked && 'animate-badge-unlock'
          )}
        >
          <TierIcon className={isLarge ? 'size-6' : 'size-5'} />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Participation level</p>
          <p className={cn('font-bold text-ink-900', isLarge ? 'text-lg' : 'text-base')}>{tier.label}</p>
        </div>
      </div>

      <div className="mt-3">
        <div className="h-2 w-full overflow-hidden rounded-full bg-ink-900/[0.06]">
          <div
            className="h-full rounded-full bg-purple-500 transition-[width] duration-700 ease-out"
            style={{ width: `${displayProgress}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-ink-500">
          {next ? `${score} / ${next.min} points to ${next.label}` : `${score} points · Highest tier reached`}
        </p>
      </div>
    </div>
  );
}
