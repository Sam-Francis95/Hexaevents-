import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Users, Sparkles } from 'lucide-react';
import { Badge } from '../../../shared/components/common/Badge';
import { formatDate, seatsLabel } from '../../../shared/utils/formatters';
import { ROUTES } from '../../../shared/utils/constants';
import { cn } from '../../../shared/utils/cn';

const MODE_LABEL = { online: 'Online', offline: 'In-person', hybrid: 'Hybrid' };

export function EventCard({ event, compact = false }) {
  const full = event.registeredCount >= event.capacity;

  if (compact) {
    return (
      <Link
        to={ROUTES.PARTICIPANT.EVENT_DETAILS(event.id)}
        className="group flex items-center gap-3.5 rounded-2xl border border-border bg-surface p-3.5 transition-shadow hover:shadow-card-hover"
      >
        <span
          className="flex size-12 shrink-0 items-center justify-center rounded-xl text-white"
          style={{ backgroundColor: event.bannerColor }}
        >
          <Sparkles className="size-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-ink-900 group-hover:text-accent-600">{event.title}</h3>
            <Badge tone="accent" dot={false} className="shrink-0">{event.category}</Badge>
          </div>
          <div className="mt-1 flex items-center gap-3 text-xs text-ink-500">
            <span className="flex items-center gap-1">
              <CalendarDays className="size-3.5" /> {formatDate(event.startDate)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" /> {event.venue}
            </span>
          </div>
        </div>

        <Badge tone={full ? 'warning' : 'info'} dot={false} className="shrink-0">
          {full ? 'Waitlist' : 'Upcoming'}
        </Badge>
      </Link>
    );
  }

  return (
    <Link
      to={ROUTES.PARTICIPANT.EVENT_DETAILS(event.id)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-shadow hover:shadow-card-hover"
    >
      <div className="h-2.5" style={{ backgroundColor: event.bannerColor }} />

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold text-ink-900 line-clamp-2 group-hover:text-accent-600">{event.title}</h3>
          <Badge tone="accent" dot={false} className="shrink-0">{event.category}</Badge>
        </div>

        <div className="flex flex-col gap-1.5 text-sm text-ink-500">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5 shrink-0" /> {formatDate(event.startDate)}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" /> {event.venue}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="size-3.5 shrink-0" /> {seatsLabel(event.capacity, event.registeredCount)}
          </span>
        </div>

        <div className="mt-1 flex items-center justify-between">
          <span className="text-xs text-ink-300">{MODE_LABEL[event.mode]}</span>
          <span className={cn('text-xs font-semibold', full ? 'text-warning-600' : 'text-accent-600')}>
            {full ? 'Join waitlist →' : 'View details →'}
          </span>
        </div>
      </div>
    </Link>
  );
}
