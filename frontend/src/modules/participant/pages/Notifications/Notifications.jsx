import { useEffect, useState } from 'react';
import {
  Bell, BellOff, CheckCheck, CheckCircle2, Clock, Award, Megaphone, Zap, Info,
} from 'lucide-react';
import { Button } from '../../../../shared/components/common/Button';
import { cn } from '../../../../shared/utils/cn';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { getNotifications, markNotificationRead, markAllRead } from '../../services/notificationService';
import { MOCK_NOTIFICATIONS } from '../../../../shared/utils/mockData';

const NOTIF_CONFIG = {
  registration: { icon: CheckCircle2, bg: 'bg-green-50 dark:bg-green-500/10', iconColor: 'text-green-600 dark:text-green-400', border: 'border-green-100 dark:border-green-500/20' },
  reminder:     { icon: Clock,        bg: 'bg-amber-50 dark:bg-amber-500/10',  iconColor: 'text-amber-600 dark:text-amber-400',  border: 'border-amber-100 dark:border-amber-500/20' },
  certificate:  { icon: Award,        bg: 'bg-purple-50 dark:bg-purple-500/10', iconColor: 'text-purple-600 dark:text-purple-400', border: 'border-purple-100 dark:border-purple-500/20' },
  event_update: { icon: Megaphone,    bg: 'bg-blue-50 dark:bg-blue-500/10',    iconColor: 'text-[#0056D2] dark:text-blue-400',    border: 'border-blue-100 dark:border-blue-500/20' },
  ai_recommendation: { icon: Zap,    bg: 'bg-indigo-50 dark:bg-indigo-500/10', iconColor: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-100 dark:border-indigo-500/20' },
  default:      { icon: Info,         bg: 'bg-canvas',                          iconColor: 'text-ink-400',                         border: 'border-border' },
};

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  async function load() {
    setIsLoading(true);
    const res = await getNotifications(user.id);
    const data = res.data || [];
    setNotifications(data.length > 0 ? data : MOCK_NOTIFICATIONS);
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
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setIsMarkingAll(false);
  }

  const unreadCount = notifications.filter((n) => !n.read).length;
  const visible = tab === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">Notifications</h1>
          <p className="mt-1 text-sm text-ink-400">Updates on your registrations, reminders, and certificates.</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" leftIcon={<CheckCheck className="size-3.5" />} isLoading={isMarkingAll} onClick={handleMarkAllRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-[14px] border border-border bg-canvas p-1 w-fit">
        {[
          { key: 'all', label: 'All', count: notifications.length },
          { key: 'unread', label: 'Unread', count: unreadCount },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all',
              tab === t.key ? 'bg-[#0056D2] text-white shadow-sm' : 'text-ink-500 hover:bg-surface hover:text-ink-900'
            )}
          >
            {t.label}
            {t.count > 0 && (
              <span className={cn('flex min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-bold', tab === t.key ? 'bg-white/25 text-white' : 'bg-border text-ink-500')}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notification list */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-[18px] border border-border bg-surface" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[18px] border border-dashed border-border bg-surface py-16 text-center">
          <BellOff className="mb-3 size-12 text-ink-200" />
          <h3 className="text-base font-bold text-ink-900">
            {tab === 'unread' ? "You're all caught up!" : 'No notifications'}
          </h3>
          <p className="mt-1 text-sm text-ink-400">
            {tab === 'unread' ? 'No unread notifications right now.' : "You'll see updates here as they happen."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {visible.map((n) => {
            const config = NOTIF_CONFIG[n.type] || NOTIF_CONFIG.default;
            const Icon = config.icon;
            return (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={cn(
                  'group flex w-full items-start gap-4 rounded-[18px] border p-4 text-left transition-all hover:shadow-sm',
                  n.read
                    ? 'border-border bg-surface hover:bg-canvas'
                    : 'border-border-strong bg-surface shadow-sm',
                  config.border
                )}
              >
                {/* Icon */}
                <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', config.bg)}>
                  <Icon className={cn('size-5', config.iconColor)} />
                </div>

                {/* Content */}
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className={cn('text-sm leading-snug', n.read ? 'font-medium text-ink-700' : 'font-bold text-ink-900')}>
                      {n.title}
                    </p>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-[11px] text-ink-300 whitespace-nowrap">{timeAgo(n.createdAt)}</span>
                      {!n.read && <span className="size-2 shrink-0 rounded-full bg-[#0056D2]" />}
                    </div>
                  </div>
                  <p className="text-[13px] leading-relaxed text-ink-500">{n.message}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
