import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Bell, LogOut, UserCircle, Search, Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';
import { getNavForRole } from '../../../app/navRegistry';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';

/**
 * Single horizontal top nav, shared across every module. Nav items still
 * come exclusively from navRegistry.js -> each module's navConfig.js --
 * this file does not hardcode any participant-specific paths, so Organizer
 * and Admin plug in the same way they did with the old Sidebar.
 *
 * Design choice: two of navConfig's items -- whichever one uses the Bell
 * icon and whichever uses the UserCircle icon -- are surfaced through the
 * existing notification-bell / avatar-menu affordances instead of being
 * duplicated as a 6th/7th text tab. That's what "notification-bell" and
 * "user-avatar" already were for in the old Navbar; keeping them as icons
 * (matched generically by icon reference, not a hardcoded label) avoids two
 * links pointing at the same page sitting side by side. Every item is still
 * reachable this way -- and the mobile drawer below lists the complete,
 * unfiltered set as a plain vertical list, so nothing is ever hidden.
 */
export function TopNav({ unreadCount = 0 }) {
  const { user, role, logout } = useAuth();
  const items = getNavForRole(role);

  const notificationsItem = items.find((item) => item.icon === Bell);
  const profileItem = items.find((item) => item.icon === UserCircle);
  const primaryLinks = items.filter((item) => item !== notificationsItem && item !== profileItem);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Close the mobile drawer on any route change (link click) rather than
  // requiring a second tap.
  useEffect(() => {
    setDrawerOpen(false);
  }, [items.length]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface">
      <div className="flex h-16 items-center gap-2 px-4 sm:px-6">
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex size-9 shrink-0 items-center justify-center rounded-lg text-ink-700 hover:bg-ink-900/5 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="size-[18px]" />
        </button>

        <Link to={primaryLinks[0]?.path || '/'} className="flex shrink-0 items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-500 text-white">
            <Sparkles className="size-[18px]" />
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-sm font-bold text-ink-900">SmartEvent AI</span>
          </span>
        </Link>

        <nav className="ml-2 hidden items-center gap-1 lg:flex">
          {primaryLinks.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-accent-50 text-accent-700' : 'text-ink-700 hover:bg-ink-900/5'
                )
              }
            >
              <Icon className="size-[15px]" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="relative ml-auto hidden max-w-xs flex-1 lg:block">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-300" />
          <input
            type="search"
            placeholder="Search events…"
            className="h-9 w-full rounded-full border-0 bg-canvas pl-9 pr-4 text-sm text-ink-900 placeholder:text-ink-300 focus-visible:ring-2 focus-visible:ring-accent-500"
          />
        </div>

        <div className="ml-auto flex items-center gap-1 lg:ml-3">
          {notificationsItem && (
            <Link
              to={notificationsItem.path}
              className="relative flex size-9 items-center justify-center rounded-full text-ink-500 hover:bg-ink-900/5"
              aria-label={notificationsItem.label}
              title={notificationsItem.label}
            >
              <Bell className="size-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex min-w-[16px] items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-bold leading-4 text-white ring-2 ring-surface">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          )}

          <div className="relative ml-1" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2.5 hover:bg-ink-900/5"
            >
              <Avatar name={user?.name} src={user?.avatarUrl} size="sm" />
              <span className="hidden text-left leading-tight md:block">
                <span className="block text-sm font-semibold text-ink-900">{user?.name}</span>
              </span>
              {user?.role && (
                <Badge tone="accent" dot={false} className="hidden md:inline-flex">
                  {user.role}
                </Badge>
              )}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-12 z-20 w-48 rounded-xl border border-border bg-surface py-1 shadow-popover animate-fade-in">
                {profileItem && (
                  <Link
                    to={profileItem.path}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-sm text-ink-700 hover:bg-canvas"
                  >
                    <UserCircle className="size-4" /> {profileItem.label}
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm text-danger-500 hover:bg-danger-50"
                >
                  <LogOut className="size-4" /> Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile / narrow-viewport drawer -- the complete, unfiltered item
          list, so every route stays reachable even below the lg breakpoint
          where the inline links row is hidden. */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-900/40 animate-fade-in"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[80vw] flex-col bg-surface shadow-popover animate-fade-in">
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-lg bg-accent-500 text-white">
                  <Sparkles className="size-4" />
                </span>
                <span className="text-sm font-bold text-ink-900">SmartEvent AI</span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="flex size-9 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-900/5"
                aria-label="Close menu"
              >
                <X className="size-[18px]" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-3">
              <ul className="flex flex-col gap-1">
                {items.map(({ label, path, icon: Icon }) => (
                  <li key={path}>
                    <NavLink
                      to={path}
                      onClick={() => setDrawerOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors',
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
            </nav>

            <button
              onClick={logout}
              className="flex items-center gap-3 border-t border-border px-6 py-3.5 text-left text-sm font-medium text-danger-500 hover:bg-danger-50"
            >
              <LogOut className="size-4" /> Log out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
