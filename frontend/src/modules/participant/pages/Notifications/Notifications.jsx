import { useEffect, useState } from 'react';
import { BellOff, CheckCheck } from 'lucide-react';
import { NotificationCard } from '../../components/NotificationCard';
import { Loader } from '../../../../shared/components/common/Loader';
import { EmptyState } from '../../../../shared/components/common/EmptyState';
import { Button } from '../../../../shared/components/common/Button';
import { cn } from '../../../../shared/utils/cn';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { getNotifications, markNotificationRead, markAllRead } from '../../services/notificationService';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
];

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  async function load() {
    setIsLoading(true);
    const res = await getNotifications(user.id);
    setNotifications(res.data || []);
    setIsLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  async function handleClick(notification) {
    if (notification.read) return;
    setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)));
    await markNotificationRead(notification.id);
  }

  async function handleMarkAllRead() {
    setIsMarkingAll(true);
    await markAllRead(user.id);
    await load();
    setIsMarkingAll(false);
  }

  if (isLoading) return <Loader fullHeight label="Loading notifications…" />;

  const unreadCount = notifications.filter((n) => !n.read).length;
  const visible = tab === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Notifications</h1>
          <p className="mt-1 text-sm text-ink-500">Updates on your registrations, reminders, and certificates.</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" leftIcon={<CheckCheck className="size-3.5" />} isLoading={isMarkingAll} onClick={handleMarkAllRead}>
            Mark all as read
          </Button>
        )}
      </div>

      <div className="flex gap-1 rounded-lg border border-border bg-canvas p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'rounded px-3 py-1.5 text-sm font-medium transition-colors',
              tab === t.key ? 'bg-surface text-ink-900 shadow-xs' : 'text-ink-500 hover:text-ink-900'
            )}
          >
            {t.label}
            {t.key === 'unread' && unreadCount > 0 && (
              <span className="ml-1.5 rounded-full bg-accent-500 px-1.5 py-0.5 text-[10px] font-mono text-white">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title={tab === 'unread' ? "You're all caught up" : 'No notifications'}
          description={tab === 'unread' ? 'No unread notifications right now.' : "You'll see updates here as they happen."}
          className="rounded-2xl border border-border bg-surface"
        />
      ) : (
        <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-surface px-2">
          {visible.map((n) => (
            <NotificationCard key={n.id} notification={n} onClick={handleClick} />
          ))}
        </div>
      )}
    </div>
  );
}
