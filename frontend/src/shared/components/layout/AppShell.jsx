import { useEffect, useState } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { TopNav } from './TopNav';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';

export function AppShell({ unreadCount = 0, title }) {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    document.title = title ? `${title} · HexaEvents` : 'HexaEvents — Discover • Participate • Excel';
  }, [title]);

  return (
    <div className="min-h-screen bg-canvas text-ink-900">
      <div className="flex min-h-screen">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <div className="flex min-w-0 flex-1 flex-col">
          <TopNav unreadCount={unreadCount} />

          <main className="flex-1 px-4 pb-20 pt-5 sm:px-6 lg:px-7 lg:pb-5">
            <div key={location.pathname} className="mx-auto max-w-[1520px] animate-fade-in">
              <Outlet />
            </div>
          </main>

          <BottomNav />
        </div>
      </div>
    </div>
  );
}
