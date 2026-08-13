import {
  GraduationCap,
  Trophy,
  Compass,
  BookOpen,
  ShieldCheck,
  Users,
  CalendarDays,
} from 'lucide-react';

/**
 * Category -> { icon, tone } identity map (Part G.3 of the redesign brief).
 * `tone` must always be one of the existing Badge/design-system tones —
 * never a new color. Categories are fetched dynamically via
 * getEventCategories(), so any category not listed here safely falls back
 * to the `default` entry rather than throwing.
 */
const CATEGORY_THEME = {
  Workshop: { icon: GraduationCap, tone: 'accent' },
  Hackathon: { icon: Trophy, tone: 'purple' },
  Orientation: { icon: Compass, tone: 'info' },
  Training: { icon: BookOpen, tone: 'success' },
  Compliance: { icon: ShieldCheck, tone: 'warning' },
  'Town Hall': { icon: Users, tone: 'accent' },
};

const DEFAULT_THEME = { icon: CalendarDays, tone: 'accent' };

/**
 * @param {string} category
 * @returns {{ icon: import('react').ComponentType, tone: 'accent'|'purple'|'success'|'warning'|'info' }}
 */
export function getCategoryTheme(category) {
  return CATEGORY_THEME[category] || DEFAULT_THEME;
}
