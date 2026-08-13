import { useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { TopNav } from './TopNav';
import { Footer } from './Footer';
import { BottomNav } from './BottomNav';

export function AppShell({ unreadCount = 0, title }) {
  const location = useLocation();

  useEffect(() => {
    document.title = title ? `${title} · SmartEvent AI` : 'SmartEvent AI';
  }, [title]);

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <TopNav unreadCount={unreadCount} />
      {/* pb-16 clears the fixed BottomNav on mobile; route-fade (key'd on
          pathname so it re-triggers every navigation) gives each route
          change a subtle 150ms fade+rise per Phase 1's motion system. */}
      <main className="flex-1 px-4 py-6 pb-16 sm:px-6 lg:px-8 lg:pb-6">
        <div key={location.pathname} className="animate-fade-in">
          <Outlet />
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
