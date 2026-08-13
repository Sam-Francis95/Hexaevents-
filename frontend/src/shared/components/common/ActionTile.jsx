import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

const TONES = {
  accent: 'bg-accent-500 hover:bg-accent-600',
  purple: 'bg-purple-500 hover:bg-purple-600',
  success: 'bg-success-500 hover:bg-success-600',
  warning: 'bg-warning-500 hover:bg-warning-600',
};

/**
 * Solid-color square tile used for "Quick actions" grids. Renders as a Link
 * when `to` is provided, otherwise a <button> — never nests interactive elements.
 */
export function ActionTile({ label, icon: Icon, tone = 'accent', to, onClick, className }) {
  const classes = cn(
    'flex flex-col items-center justify-center gap-2.5 rounded-2xl px-4 py-5 text-center text-white shadow-card transition-all duration-100',
    'active:scale-[0.97]',
    TONES[tone],
    className
  );

  const content = (
    <>
      <span className="flex size-10 items-center justify-center rounded-full bg-white/20">
        <Icon className="size-5" />
      </span>
      <span className="text-sm font-semibold leading-tight">{label}</span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {content}
    </button>
  );
}
