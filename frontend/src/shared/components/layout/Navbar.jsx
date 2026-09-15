import { useState, useRef, useEffect } from 'react';
import { Menu, Bell, LogOut, UserCircle, Search, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from '../common/Avatar';
import { ROUTES } from '../../utils/constants';

export function Navbar({ onMenuClick, title = 'HexaEvents', unreadCount = 0 }) {
  const { user, logout, hasRole } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <header className="flex h-16 items-center gap-4 border-b border-border bg-surface px-6">
      <button
        onClick={onMenuClick}
        className="flex size-9 items-center justify-center rounded-lg text-ink-700 hover:bg-ink-900/5 lg:hidden"
        aria-label="Toggle menu"
      >
        <Menu className="size-[18px]" />
      </button>

      <h1 className="hidden text-lg font-bold text-ink-900 sm:block">{title}</h1>

      <div className="relative ml-2 hidden max-w-md flex-1 md:block">
        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-300" />
        <input
          type="search"
          placeholder="Search events, registrations…"
          className="h-10 w-full rounded-full border-0 bg-canvas pl-10 pr-4 text-sm text-ink-900 placeholder:text-ink-300 focus-visible:ring-2 focus-visible:ring-accent-500"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          className="hidden size-9 items-center justify-center rounded-full text-ink-500 hover:bg-ink-900/5 sm:flex"
          aria-label="Toggle theme"
        >
          <Sun className="size-[18px]" />
        </button>

        <Link
          to={ROUTES.PARTICIPANT.NOTIFICATIONS}
          className="relative flex size-9 items-center justify-center rounded-full text-ink-500 hover:bg-ink-900/5"
          aria-label="Notifications"
        >
          <Bell className="size-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex min-w-[16px] items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-bold leading-4 text-white ring-2 ring-surface">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        <div className="relative ml-1" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2.5 hover:bg-ink-900/5"
          >
            <Avatar name={user?.name} src={user?.avatarUrl} size="sm" />
            <span className="hidden text-left leading-tight md:block">
              <span className="block text-sm font-semibold text-ink-900">{user?.name}</span>
              <span className="block text-xs capitalize text-ink-500">{(user?.roles || []).join(', ')}</span>
            </span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-12 z-20 w-48 rounded-xl border border-border bg-surface py-1 shadow-popover animate-fade-in">
              <Link
                to={ROUTES.PARTICIPANT.PROFILE}
                onClick={() => setMenuOpen(false)}
                className={cn('flex items-center gap-2 px-3.5 py-2 text-sm text-ink-700 hover:bg-canvas')}
              >
                <UserCircle className="size-4" /> My profile
              </Link>

              {hasRole?.('event_manager') && hasRole?.('participant') && (
                  <>
                    <div className="border-b border-border my-1" />
                    <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-ink-400">Workspaces</div>
                    <Link
                      to={ROUTES.PARTICIPANT.DASHBOARD}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-sm text-ink-700 hover:bg-canvas"
                    >
                      Participant Workspace
                    </Link>
                    <Link
                      to="/organizer/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-sm text-ink-700 hover:bg-canvas"
                    >
                      Event Manager Workspace
                    </Link>
                    <div className="border-b border-border my-1" />
                  </>
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
    </header>
  );
}
