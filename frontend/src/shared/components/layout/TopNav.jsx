import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  LogOut,
  UserCircle,
  Search,
  Sun,
  Moon,
  ChevronDown,
  Calendar,
  HelpCircle,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { useReputation } from '../../../modules/participant/contexts/ReputationContext';
import { ROUTES } from '../../utils/constants';

export function TopNav({ unreadCount = 3 }) {
  const { user, logout, hasRole } = useAuth();
  const { reputation } = useReputation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const menuRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Priya';
  const roleName = hasRole?.('event_manager') && !hasRole?.('participant') ? 'Event Organizer' : (reputation ? `${reputation.levelBadge} ${reputation.levelName} · Level ${reputation.currentLevel}` : 'Participant');

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      navigate(`${ROUTES.PARTICIPANT.EVENTS}?q=${encodeURIComponent(searchValue)}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-[68px] items-center justify-between border-b border-border bg-surface px-5 shadow-sm sm:px-7 backdrop-blur-none">
      {/* Search Input Bar */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-300 pointer-events-none" />
        <input
          type="search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder="Search events, hackathons, ideathons..."
          className="h-10 w-full rounded-xl border border-border bg-canvas pl-10 pr-10 text-xs text-ink-900 placeholder:text-ink-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0056D2]"
        />
        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] font-bold text-ink-500">
          /
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3.5">
        {/* Calendar shortcut */}
        <Link
          to={ROUTES.PARTICIPANT.CALENDAR}
          className="flex size-9 items-center justify-center rounded-xl text-ink-500 transition-colors hover:bg-ink-900/5 hover:text-ink-900"
          title="Calendar"
        >
          <Calendar className="size-4.5" />
        </Link>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex size-9 items-center justify-center rounded-xl text-ink-500 transition-colors hover:bg-ink-900/5 hover:text-ink-900"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="size-4.5" />
          ) : (
            <Moon className="size-4.5" />
          )}
        </button>

        {/* Notifications Icon with Badge */}
        <Link
          to={ROUTES.PARTICIPANT.NOTIFICATIONS}
          className="relative flex size-9 items-center justify-center rounded-xl text-ink-500 transition-colors hover:bg-ink-900/5 hover:text-ink-900"
          title="Notifications"
        >
          <Bell className="size-4.5" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-[#0056D2] text-[9px] font-bold text-white shadow-sm">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* User Profile dropdown */}
        <div className="relative ml-1" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2.5 rounded-xl py-1 pl-1 pr-1.5 transition-colors hover:bg-ink-900/5"
          >
            {/* Portrait avatar */}
            <div className="relative size-8 shrink-0 overflow-hidden rounded-full border border-border shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"
                alt="Priya"
                className="size-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=Priya`;
                }}
              />
            </div>

            <div className="hidden text-left leading-tight md:block">
              <p className="text-xs font-bold text-ink-900">
                {firstName} {reputation?.levelBadge}
              </p>
              <p className="text-[10px] font-medium text-ink-500">{roleName}</p>
            </div>

            <ChevronDown className={cn('size-3 text-ink-400 transition-transform', menuOpen && 'rotate-180')} />
          </button>

          {/* User Dropdown */}
          {menuOpen && (
            <div className="absolute right-0 top-12 z-50 w-52 rounded-xl border border-border bg-surface py-1.5 shadow-lg animate-fade-in">
              <div className="border-b border-border px-4 py-2.5">
                <p className="truncate text-xs font-bold text-ink-900">{user?.name || firstName}</p>
                <p className="truncate text-[10px] text-ink-500">{user?.email || 'priya@hexaevents.com'}</p>
              </div>
              <div className="py-1">
                <Link
                  to={ROUTES.PARTICIPANT.PROFILE}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-ink-700 hover:bg-canvas hover:text-ink-900"
                >
                  <UserCircle className="size-4" /> My Profile
                </Link>
                
                {hasRole?.('participant') && (
                  <>
                    <Link
                      to="/participant/help"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-ink-700 hover:bg-canvas hover:text-ink-900"
                    >
                      <HelpCircle className="size-4" /> Help & Support
                    </Link>
                  </>
                )}

                {hasRole?.('event_manager') && hasRole?.('participant') && (
                  <>
                    <div className="border-b border-border my-1" />
                    <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-ink-400">Workspaces</div>
                    <Link
                      to={ROUTES.PARTICIPANT.DASHBOARD}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-ink-700 hover:bg-canvas hover:text-ink-900"
                    >
                      Participant Workspace
                    </Link>
                    <Link
                      to="/organizer/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-ink-700 hover:bg-canvas hover:text-ink-900"
                    >
                      Event Manager Workspace
                    </Link>
                    <div className="border-b border-border my-1" />
                  </>
                )}

                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <LogOut className="size-4" /> Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
