import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function AppShell({ unreadCount = 0, title }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-canvas">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onMenuClick={() => setCollapsed((c) => !c)} unreadCount={unreadCount} title={title} />
        <main className="flex-1 overflow-y-auto scrollbar-thin px-6 py-6">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
