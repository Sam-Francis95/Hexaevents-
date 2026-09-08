import { NavLink } from 'react-router-dom';
import { ChevronsLeft, ArrowRight, Gift, Zap } from 'lucide-react';
import { cn } from '../../utils/cn';
import { getNavForRole } from '../../../app/navRegistry';
import { useAuth } from '../../hooks/useAuth';

// Nav items are split into main and bottom groups for visual separation
const BOTTOM_NAV_LABELS = ['Settings', 'Help & Support'];

export function Sidebar({ collapsed, onToggle }) {
  const { role } = useAuth();
  const allItems = getNavForRole(role);
  const mainItems = allItems.filter((i) => !BOTTOM_NAV_LABELS.includes(i.label));
  const bottomItems = allItems.filter((i) => BOTTOM_NAV_LABELS.includes(i.label));

  return (
    <aside
      className={cn(
        'hidden shrink-0 flex-col border-r text-white transition-[width] duration-200 lg:flex',
        // Dark navy in both Day & Night modes matching reference images
        'bg-[#0B1E3D] border-[#162D50] dark:bg-[#060D1A] dark:border-[#14233C]',
        collapsed ? 'w-[72px]' : 'w-[250px]'
      )}
    >
      {/* Logo Area */}
      <div className={cn('flex h-[68px] items-center gap-3 px-5', collapsed && 'justify-center px-0')}>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0056D2] via-[#2563EB] to-[#7C3AED] text-white shadow-md">
          <Zap className="size-4.5" strokeWidth={2.5} />
        </span>
        {!collapsed && (
          <div className="leading-tight">
            <p className="text-[14px] font-bold tracking-[0.12em] text-white">HEXAEVENTS</p>
            <p className="text-[10px] font-medium tracking-[0.08em] text-white/50">Discover • Participate • Excel</p>
          </div>
        )}
      </div>

      {/* Main Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin-dark px-3 py-2">
        <ul className="flex flex-col gap-1">
          {mainItems.map(({ label, path, icon: Icon, badge }) => (
            <li key={path}>
              <NavLink
                to={path}
                title={collapsed ? label : undefined}
                className={({ isActive }) =>
                  cn(
                    'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-150',
                    isActive
                      ? 'bg-[#0056D2] text-white shadow-[0_2px_12px_rgba(0,86,210,0.35)]'
                      : 'text-[#94A3B8] hover:bg-white/5 hover:text-white',
                    collapsed && 'justify-center px-0'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={cn('shrink-0', collapsed ? 'size-5' : 'size-[18px]')} />
                    {!collapsed && (
                      <>
                        <span className="flex-1">{label}</span>
                        {badge != null && (
                          <span
                            className={cn(
                              'flex min-w-[20px] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-[#0056D2] text-white'
                            )}
                          >
                            {badge}
                          </span>
                        )}
                      </>
                    )}
                    {collapsed && badge != null && (
                      <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-[#0056D2] text-[9px] font-bold text-white">
                        {badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {bottomItems.length > 0 && (
          <ul className="mt-2 flex flex-col gap-1 border-t border-white/5 pt-2">
            {bottomItems.map(({ label, path, icon: Icon }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  title={collapsed ? label : undefined}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-150',
                      isActive
                        ? 'bg-[#0056D2] text-white shadow-[0_2px_12px_rgba(0,86,210,0.35)]'
                        : 'text-[#94A3B8]/70 hover:bg-white/5 hover:text-white',
                      collapsed && 'justify-center px-0'
                    )
                  }
                >
                  <Icon className={cn('shrink-0', collapsed ? 'size-5' : 'size-[18px]')} />
                  {!collapsed && <span className="flex-1">{label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </nav>

      {/* Refer & Earn Card */}
      {!collapsed && (
        <div className="mx-3 mb-3 rounded-xl border border-white/10 bg-white/5 p-3.5">
          <div className="mb-1.5 flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-lg bg-amber-400/20 text-amber-300">
              <Gift className="size-3.5" />
            </div>
            <h4 className="text-xs font-bold text-white">Refer & Earn</h4>
          </div>
          <p className="mb-2.5 text-[10px] leading-relaxed text-white/60">
            Invite your friends and earn exciting rewards!
          </p>
          <button className="flex w-full items-center justify-center gap-1 rounded-lg bg-[#0056D2] py-1.5 text-[11px] font-semibold text-white transition-all hover:bg-[#0048B0] active:scale-95 shadow-sm">
            Invite Now <ArrowRight className="size-3" />
          </button>
        </div>
      )}

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="flex h-10 items-center justify-center gap-2 border-t border-white/5 text-[#94A3B8] transition-colors hover:text-white"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <ChevronsLeft className={cn('size-4 transition-transform duration-200', collapsed && 'rotate-180')} />
        {!collapsed && <span className="text-[10px] font-medium uppercase tracking-[0.14em]">Collapse</span>}
      </button>
    </aside>
  );
}
