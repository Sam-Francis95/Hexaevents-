import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Modal } from '../../../../shared/components/common/Modal';
import { StatusBadge } from '../../components/StatusBadge';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { getMyRegistrations } from '../../services/registrationService';
import { formatTimeRange } from '../../../../shared/utils/formatters';
import { ROUTES, REGISTRATION_STATUS_TONE } from '../../../../shared/utils/constants';
import { MOCK_REGISTRATIONS } from '../../../../shared/utils/mockData';
import { cn } from '../../../../shared/utils/cn';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const STATUS_DOT = {
  registered: 'bg-blue-500',
  approved:   'bg-green-500',
  waitlisted: 'bg-amber-500',
  completed:  'bg-slate-400',
  rejected:   'bg-red-500',
};

const STATUS_LABEL = {
  registered: { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-700 dark:text-blue-400' },
  approved:   { bg: 'bg-green-50 dark:bg-green-500/10', text: 'text-green-700 dark:text-green-400' },
  waitlisted: { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400' },
  completed:  { bg: 'bg-slate-50 dark:bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400' },
};

function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function startOfMonth(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }
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
      const data = (res.data || []).length > 0 ? res.data : MOCK_REGISTRATIONS;
      setRegistrations(data);
      setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, [user.id]);

  const eventsByDate = useMemo(() => {
    const map = {};
    for (const reg of registrations) {
      if (!reg.event?.startDate) continue;
      const key = dateKey(new Date(reg.event.startDate));
      (map[key] ||= []).push(reg);
    }
    Object.values(map).forEach((list) =>
      list.sort((a, b) => new Date(a.event.startDate) - new Date(b.event.startDate))
    );
    return map;
  }, [registrations]);

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">Calendar</h1>
          <p className="mt-1 text-sm text-ink-400">Every event you're registered for.</p>
        </div>
        <div className="h-96 animate-pulse rounded-[18px] border border-border bg-surface" />
      </div>
    );
  }

  const cells = buildMonthGrid(monthCursor);
  const todayKey = dateKey(new Date());
  const monthLabel = monthCursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const selectedKey = selectedDate ? dateKey(selectedDate) : null;
  const selectedEvents = selectedKey ? eventsByDate[selectedKey] || [] : [];

  // Upcoming events for sidebar
  const now = new Date();
  const upcoming = registrations
    .filter((r) => r.event?.startDate && new Date(r.event.startDate) >= now)
    .sort((a, b) => new Date(a.event.startDate) - new Date(b.event.startDate))
    .slice(0, 5);

  function goToMonth(offset) {
    setMonthCursor((m) => new Date(m.getFullYear(), m.getMonth() + offset, 1));
  }

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">Calendar</h1>
          <p className="mt-1 text-sm text-ink-400">Every event you're registered for — past and upcoming.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMonthCursor(startOfMonth(new Date()))}
            className="rounded-xl border border-border bg-surface px-3.5 py-1.5 text-sm font-semibold text-ink-700 shadow-sm hover:bg-ink-900/5"
          >
            Today
          </button>
          <div className="flex items-center gap-1 rounded-xl border border-border bg-surface p-0.5 shadow-sm">
            <button onClick={() => goToMonth(-1)} aria-label="Previous month" className="flex size-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-900/5">
              <ChevronLeft className="size-4" />
            </button>
            <span className="min-w-[148px] px-2 text-center text-sm font-bold text-ink-900">{monthLabel}</span>
            <button onClick={() => goToMonth(1)} aria-label="Next month" className="flex size-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-900/5">
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Calendar Grid */}
        <div className="flex-1 overflow-hidden rounded-[18px] border border-border bg-surface shadow-sm">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-border bg-canvas">
            {WEEKDAY_LABELS.map((d) => (
              <div key={d} className="py-3 text-center text-[11px] font-bold uppercase tracking-wider text-ink-400">{d}</div>
            ))}
          </div>

          {/* Days grid */}
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
                    'flex min-h-[90px] flex-col items-stretch gap-1 border-b border-r border-border p-2 text-left transition-colors last:border-r-0 sm:min-h-[104px]',
                    !inMonth && 'bg-canvas/50 opacity-60',
                    dayEvents.length > 0 ? 'cursor-pointer hover:bg-blue-50/30 dark:hover:bg-blue-500/5' : 'cursor-default'
                  )}
                >
                  <span className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                    isToday ? 'bg-[#0056D2] text-white' : inMonth ? 'text-ink-700' : 'text-ink-300'
                  )}>
                    {cellDate.getDate()}
                  </span>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    {visible.map((reg) => {
                      const ss = STATUS_LABEL[reg.status] || { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-700 dark:text-blue-400' };
                      return (
                        <span key={reg.id} className={cn('truncate rounded px-1.5 py-0.5 text-[9px] font-bold', ss.bg, ss.text)}>
                          {reg.event?.title}
                        </span>
                      );
                    })}
                    {overflow > 0 && (
                      <span className="px-1 text-[10px] font-semibold text-ink-400">+{overflow} more</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Upcoming sidebar */}
        <div className="hidden w-64 shrink-0 flex-col gap-3 xl:flex">
          <div className="rounded-[18px] border border-border bg-surface p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-ink-900">Upcoming</h3>
              <Link to={ROUTES.PARTICIPANT.MY_REGISTRATIONS} className="text-[11px] font-semibold text-[#0056D2] dark:text-blue-400">View all →</Link>
            </div>
            {upcoming.length === 0 ? (
              <div className="text-center py-6">
                <CalendarIcon className="mx-auto mb-2 size-8 text-ink-200" />
                <p className="text-xs text-ink-400">No upcoming events registered.</p>
                <Link to={ROUTES.PARTICIPANT.EVENTS} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#0056D2] dark:text-blue-400">
                  Browse events <ArrowRight className="size-3" />
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {upcoming.map((reg) => {
                  const d = new Date(reg.event.startDate);
                  const dayNum = d.getDate();
                  const month = d.toLocaleDateString('en-US', { month: 'short' });
                  const dotStyle = STATUS_DOT[reg.status] || 'bg-blue-500';
                  return (
                    <button
                      key={reg.id}
                      onClick={() => navigate(ROUTES.PARTICIPANT.EVENT_DETAILS(reg.eventId))}
                      className="group flex items-center gap-3 rounded-xl border border-border bg-canvas p-2.5 text-left transition-colors hover:border-[#0056D2]/30"
                    >
                      <div className="flex size-10 shrink-0 flex-col items-center justify-center rounded-lg bg-[#0056D2]/10">
                        <span className="text-[10px] font-bold uppercase text-[#0056D2] dark:text-blue-400">{month}</span>
                        <span className="text-[15px] font-black leading-none text-[#0056D2] dark:text-blue-400">{dayNum}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-ink-900 group-hover:text-[#0056D2]">{reg.event.title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={cn('size-1.5 rounded-full', dotStyle)} />
                          <span className="text-[10px] font-medium capitalize text-ink-400">{reg.status}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="rounded-[18px] border border-border bg-surface p-4 shadow-sm">
            <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-ink-400">Legend</h3>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Registered', dot: 'bg-blue-500' },
                { label: 'Confirmed', dot: 'bg-green-500' },
                { label: 'Waitlisted', dot: 'bg-amber-500' },
                { label: 'Completed', dot: 'bg-slate-400' },
              ].map(({ label, dot }) => (
                <div key={label} className="flex items-center gap-2 text-xs text-ink-600">
                  <span className={cn('size-2.5 shrink-0 rounded-full', dot)} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Day Modal */}
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
              className="flex flex-col gap-1.5 rounded-xl border border-border p-3.5 text-left hover:border-[#0056D2] hover:bg-canvas transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-bold text-ink-900">{reg.event?.title}</p>
                <StatusBadge status={reg.status} />
              </div>
              <p className="text-xs text-ink-400">{formatTimeRange(reg.event?.startDate, reg.event?.endDate)}</p>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
