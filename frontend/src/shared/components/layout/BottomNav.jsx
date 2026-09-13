import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { MoreHorizontal, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { getNavForRole } from '../../../app/navRegistry';
import { useAuth } from '../../hooks/useAuth';

const MAX_PRIMARY_TABS = 5;

/**
 * Fixed bottom tab bar for mobile viewports (< lg breakpoint). This is the
 * primary mobile nav surface (Part G.4 of the redesign brief) — the
 * hamburger drawer in TopNav remains as an overflow-only mechanism.
 *
 * Like TopNav, this component is role-agnostic: it reads whichever items
 * getNavForRole(role) returns and never hardcodes a participant-specific
 * path, so Organizer/Admin get the same bottom bar automatically once they
 * have a navConfig of their own length.
 */
export function BottomNav() {
  const { roles } = useAuth();
  const location = useLocation();
  const activeRole = location.pathname.startsWith('/organizer') ? 'event_manager' : 'participant';
  const items = getNavForRole(activeRole);
  const [moreOpen, setMoreOpen] = useState(false);
  const sheetRef = useRef(null);

  const overflows = items.length > MAX_PRIMARY_TABS;
  // Leave room for the "More" tab itself when there's overflow.
  const primaryItems = overflows ? items.slice(0, MAX_PRIMARY_TABS - 1) : items;
  const overflowItems = overflows ? items.slice(MAX_PRIMARY_TABS - 1) : [];
  const overflowIsActive = overflowItems.some((item) => location.pathname.startsWith(item.path));

  // Close the "More" sheet on any route change.
  useEffect(() => {
    setMoreOpen(false);
  }, [location.pathname]);

  if (items.length === 0) return null;

  return (
    <>
      {moreOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-900/40 animate-fade-in"
            onClick={() => setMoreOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={sheetRef}
            className="absolute inset-x-0 bottom-16 rounded-t-2xl border border-border bg-surface p-3 shadow-popover animate-slide-up"
          >
            <div className="flex items-center justify-between px-1.5 pb-2">
              <span className="text-sm font-semibold text-ink-900">More</span>
              <button
                onClick={() => setMoreOpen(false)}
                aria-label="Close"
                className="flex size-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-900/5"
              >
                <X className="size-4" />
              </button>
            </div>
            <ul className="flex flex-col gap-1">
              {overflowItems.map(({ label, path, icon: Icon }) => (
                <li key={path}>
                  <NavLink
                    to={path}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors active:scale-[0.98]',
                        isActive ? 'bg-accent-50 text-accent-700' : 'text-ink-700 hover:bg-ink-900/5'
                      )
                    }
                  >
                    <Icon className="size-[18px] shrink-0" />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <nav
        className="fixed bottom-0 inset-x-0 z-30 flex items-stretch border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
        aria-label="Primary"
      >
        {primaryItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition-colors active:scale-95',
                isActive ? 'text-accent-600' : 'text-ink-500'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'flex items-center justify-center rounded-full px-3.5 py-1 transition-colors',
                    isActive && 'bg-accent-50'
                  )}
                >
                  <Icon className="size-[18px]" />
                </span>
                <span className="truncate">{label}</span>
              </>
            )}
          </NavLink>
        ))}

        {overflows && (
          <button
            onClick={() => setMoreOpen(true)}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition-colors active:scale-95',
              overflowIsActive ? 'text-accent-600' : 'text-ink-500'
            )}
          >
            <span className={cn('flex items-center justify-center rounded-full px-3.5 py-1', overflowIsActive && 'bg-accent-50')}>
              <MoreHorizontal className="size-[18px]" />
            </span>
            <span className="truncate">More</span>
          </button>
        )}
      </nav>
    </>
  );
}
