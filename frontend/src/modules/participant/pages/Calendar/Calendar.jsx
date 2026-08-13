import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Loader } from '../../../../shared/components/common/Loader';
import { Modal } from '../../../../shared/components/common/Modal';
import { EmptyState } from '../../../../shared/components/common/EmptyState';
import { Badge } from '../../../../shared/components/common/Badge';
import { StatusBadge } from '../../components/StatusBadge';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { getMyRegistrations } from '../../services/registrationService';
import { formatTimeRange } from '../../../../shared/utils/formatters';
import { ROUTES, REGISTRATION_STATUS_TONE } from '../../../../shared/utils/constants';
import { cn } from '../../../../shared/utils/cn';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

// Always 6 full weeks (42 cells) so the grid height doesn't jump between months.
function buildMonthGrid(monthDate) {
  const first = startOfMonth(monthDate);
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - first.getDay());
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
}

export default function CalendarView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getMyRegistrations(user.id).then((res) => {
      if (cancelled) return;
      setRegistrations(res.data || []);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  // Keyed by calendar day (event.startDate's date) -- includes past AND
  // upcoming registrations alike, same underlying data as My Registrations.
  // Deliberately unrelated to the separate "Add to calendar" .ics export.
  const eventsByDate = useMemo(() => {
    const map = {};
    for (const reg of registrations) {
      if (!reg.event?.startDate) continue;
      const key = dateKey(new Date(reg.event.startDate));
      (map[key] ||= []).push(reg);
    }
    Object.values(map).forEach((list) => list.sort((a, b) => new Date(a.event.startDate) - new Date(b.event.startDate)));
    return map;
  }, [registrations]);

  if (isLoading) return <Loader fullHeight label="Loading your calendar…" />;

  const cells = buildMonthGrid(monthCursor);
  const todayKey = dateKey(new Date());
  const monthLabel = monthCursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const selectedKey = selectedDate ? dateKey(selectedDate) : null;
  const selectedEvents = selectedKey ? eventsByDate[selectedKey] || [] : [];
  const hasAnyEvents = Object.keys(eventsByDate).length > 0;

  function goToMonth(offset) {
    setMonthCursor((m) => new Date(m.getFullYear(), m.getMonth() + offset, 1));
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Calendar</h1>
          <p className="mt-1 text-sm text-ink-500">Every event you've registered for — past and upcoming.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMonthCursor(startOfMonth(new Date()))}
            className="rounded-full border border-border-strong px-3.5 py-1.5 text-sm font-medium text-ink-700 hover:bg-ink-900/5"
          >
            Today
          </button>
          <div className="flex items-center rounded-full border border-border-strong">
            <button
              onClick={() => goToMonth(-1)}
              aria-label="Previous month"
              className="flex size-8 items-center justify-center rounded-full text-ink-500 hover:bg-ink-900/5"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="min-w-[136px] px-1 text-center text-sm font-semibold text-ink-900">{monthLabel}</span>
            <button
              onClick={() => goToMonth(1)}
              aria-label="Next month"
              className="flex size-8 items-center justify-center rounded-full text-ink-500 hover:bg-ink-900/5"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {!hasAnyEvents && (
        <div className="rounded-2xl border border-border bg-surface">
          <EmptyState
            icon={CalendarIcon}
            title="No registered events yet"
            description="Events you register for — past or upcoming — will show up here automatically."
          />
        </div>
      )}

      <div className={cn('overflow-hidden rounded-2xl border border-border bg-surface', !hasAnyEvents && 'hidden')}>
        <div className="grid grid-cols-7 border-b border-border bg-canvas">
          {WEEKDAY_LABELS.map((d) => (
            <div key={d} className="px-2 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-ink-500">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((cellDate) => {
            const key = dateKey(cellDate);
            const inMonth = cellDate.getMonth() === monthCursor.getMonth();
            const isToday = key === todayKey;
            const dayEvents = eventsByDate[key] || [];
            const visible = dayEvents.slice(0, 2);
            const overflow = dayEvents.length - visible.length;

            return (
              <button
                key={key}
                type="button"
                onClick={() => dayEvents.length > 0 && setSelectedDate(cellDate)}
                disabled={dayEvents.length === 0}
                className={cn(
                  'flex min-h-[92px] flex-col items-stretch gap-1 border-b border-r border-border p-1.5 text-left last:border-r-0 sm:min-h-[108px]',
                  !inMonth && 'bg-canvas/60',
                  dayEvents.length > 0 ? 'hover:bg-canvas' : 'cursor-default'
                )}
              >
                <span
                  className={cn(
                    'flex size-6 items-center justify-center rounded-full text-xs font-semibold',
                    isToday ? 'bg-accent-500 text-white' : inMonth ? 'text-ink-700' : 'text-ink-300'
                  )}
                >
                  {cellDate.getDate()}
                </span>
                <div className="flex min-w-0 flex-col gap-1">
                  {visible.map((reg) => (
                    <Badge key={reg.id} tone={REGISTRATION_STATUS_TONE[reg.status] || 'neutral'} className="w-full truncate">
                      {reg.event.title}
                    </Badge>
                  ))}
                  {overflow > 0 && <span className="px-1 text-[11px] font-medium text-ink-500">+{overflow} more</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <Modal
        isOpen={Boolean(selectedDate)}
        onClose={() => setSelectedDate(null)}
        title={selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        size="md"
      >
        <div className="flex flex-col gap-3">
          {selectedEvents.map((reg) => (
            <button
              key={reg.id}
              type="button"
              onClick={() => navigate(ROUTES.PARTICIPANT.EVENT_DETAILS(reg.eventId))}
              className="flex flex-col gap-1.5 rounded-xl border border-border p-3.5 text-left hover:border-accent-500 hover:bg-canvas"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-ink-900">{reg.event?.title}</p>
                <StatusBadge status={reg.status} />
              </div>
              <p className="text-xs text-ink-500">{formatTimeRange(reg.event?.startDate, reg.event?.endDate)}</p>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
