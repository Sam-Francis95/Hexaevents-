import { UserCheck, BellRing, Award, Megaphone, Sparkles } from 'lucide-react';
import { formatRelativeTime } from '../../../shared/utils/formatters';
import { cn } from '../../../shared/utils/cn';

const CONFIG = {
  registration: { icon: UserCheck, tone: 'text-success-500 bg-success-50' },
  reminder: { icon: BellRing, tone: 'text-warning-500 bg-warning-50' },
  certificate: { icon: Award, tone: 'text-accent-500 bg-accent-50' },
  event_update: { icon: Megaphone, tone: 'text-info-500 bg-info-50' },
  ai_recommendation: { icon: Sparkles, tone: 'text-accent-500 bg-accent-50' },
};

export function NotificationCard({ notification, onClick }) {
  const { icon: Icon, tone } = CONFIG[notification.type] || CONFIG.event_update;

  return (
    <button
      onClick={() => onClick?.(notification)}
      className={cn(
        'flex w-full items-start gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-canvas',
        !notification.read && 'bg-accent-50/40'
      )}
    >
      <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-full', tone)}>
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-ink-900 line-clamp-1">{notification.title}</p>
          {!notification.read && <span className="size-1.5 shrink-0 rounded-full bg-accent-500" />}
        </div>
        <p className="mt-0.5 text-sm text-ink-500 line-clamp-2">{notification.message}</p>
        <p className="mt-1 text-xs text-ink-300 font-mono">{formatRelativeTime(notification.createdAt)}</p>
      </div>
    </button>
  );
}
