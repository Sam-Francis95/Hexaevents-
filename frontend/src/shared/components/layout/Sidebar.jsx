import { NavLink } from 'react-router-dom';
import { ChevronRight, ChevronsLeft, Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';
import { getNavForRole } from '../../../app/navRegistry';
import { useAuth } from '../../hooks/useAuth';

export function Sidebar({ collapsed, onToggle }) {
  const { role } = useAuth();
  const items = getNavForRole(role);

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col shrink-0 bg-sidebar-gradient transition-[width] duration-150',
        collapsed ? 'w-18' : 'w-68'
      )}
    >
      <div className={cn('flex h-16 items-center gap-2.5 px-5', collapsed && 'justify-center px-0')}>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent-500 to-purple-500 text-white shadow-sidebar-active">
          <Sparkles className="size-[18px]" />
        </span>
        {!collapsed && (
          <div className="leading-tight">
            <p className="text-sm font-bold text-white">SmartEvent</p>
            <p className="text-[11px] font-medium tracking-wide text-sidebar-text">AI · Participant</p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin-dark px-3 py-3">
        <ul className="flex flex-col gap-1">
          {items.map(({ label, path, icon: Icon }) => (
            <li key={path}>
              <NavLink
                to={path}
                title={collapsed ? label : undefined}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-accent-500 text-white shadow-sidebar-active'
                      : 'text-sidebar-text hover:bg-white/8 hover:text-white',
                    collapsed && 'justify-center px-0'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className="size-[18px] shrink-0" />
                    {!collapsed && <span className="flex-1">{label}</span>}
                    {!collapsed && isActive && <ChevronRight className="size-3.5 shrink-0" />}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <button
        onClick={onToggle}
        className="flex h-11 items-center justify-center gap-2 border-t border-sidebar-border text-sidebar-text hover:text-white"
      >
        <ChevronsLeft className={cn('size-4 transition-transform', collapsed && 'rotate-180')} />
        {!collapsed && <span className="text-xs">Collapse</span>}
      </button>
    </aside>
  );
}
