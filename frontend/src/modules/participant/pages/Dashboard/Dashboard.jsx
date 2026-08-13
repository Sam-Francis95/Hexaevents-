import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  ClipboardList,
  MessageSquareText,
  Award,
  CalendarSearch,
  UserCircle,
  ArrowRight,
  PartyPopper,
  Flame,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { StatCard } from '../../../../shared/components/common/StatCard';
import { GradientBanner } from '../../../../shared/components/common/GradientBanner';
import { ActionTile } from '../../../../shared/components/common/ActionTile';
import { EmptyState } from '../../../../shared/components/common/EmptyState';
import { Skeleton, SkeletonText } from '../../../../shared/components/common/Skeleton';
import { buttonVariants } from '../../../../shared/components/common/buttonStyles';
import { EventCard } from '../../components/EventCard';
import { NotificationCard } from '../../components/NotificationCard';
import { EventBanner } from '../../components/EventBanner';
import { ParticipationLevelCard } from '../../components/ParticipationLevelCard';
import { getMyRegistrations } from '../../services/registrationService';
import { getNotifications } from '../../services/notificationService';
import { getCertificates } from '../../services/certificateService';
import { getMyFeedback } from '../../services/feedbackService';
import { getEvents } from '../../services/eventService';
import { REGISTRATION_STATUS, EVENT_STATUS, ROUTES } from '../../../../shared/utils/constants';
import { formatDate, seatsLabel } from '../../../../shared/utils/formatters';
import { cn } from '../../../../shared/utils/cn';

export default function Dashboard() {
  const { user } = useAuth();
  const [state, setState] = useState({
    isLoading: true,
    registrations: [],
    notifications: [],
    certificates: [],
    feedbackGivenCount: 0,
    events: [],
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [regsRes, notifRes, certRes, feedbackRes, eventsRes] = await Promise.all([
        getMyRegistrations(user.id),
        getNotifications(user.id),
        getCertificates(user.id),
        getMyFeedback(user.id),
        getEvents({ status: EVENT_STATUS.PUBLISHED }),
      ]);
      if (cancelled) return;
      setState({
        isLoading: false,
        registrations: regsRes.data || [],
        notifications: notifRes.data || [],
        certificates: certRes.data || [],
        feedbackGivenCount: (feedbackRes.data || []).length,
        events: eventsRes.data || [],
      });
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  if (state.isLoading) return <DashboardSkeleton />;

  const { registrations, notifications, certificates, feedbackGivenCount, events } = state;
  const now = Date.now();

  const upcoming = registrations
    .filter((r) => r.event && new Date(r.event.startDate).getTime() > now)
    .sort((a, b) => new Date(a.event.startDate) - new Date(b.event.startDate));

  const pendingFeedback = registrations.filter(
    (r) => r.status === REGISTRATION_STATUS.COMPLETED && r.attended
  );

  const stats = [
    { label: 'Upcoming events', value: upcoming.length, icon: CalendarCheck, tone: 'accent' },
    { label: 'My registrations', value: registrations.length, icon: ClipboardList, tone: 'purple' },
    { label: 'Pending feedback', value: pendingFeedback.length, icon: MessageSquareText, tone: 'warning' },
    { label: 'Certificates earned', value: certificates.length, icon: Award, tone: 'success' },
  ];

  const quickActions = [
    { label: 'Browse Events', icon: CalendarSearch, to: ROUTES.PARTICIPANT.EVENTS, tone: 'accent' },
    { label: 'My Registrations', icon: ClipboardList, to: ROUTES.PARTICIPANT.MY_REGISTRATIONS, tone: 'purple' },
    { label: 'Certificates', icon: Award, to: ROUTES.PARTICIPANT.CERTIFICATES, tone: 'success' },
    { label: 'My Profile', icon: UserCircle, to: ROUTES.PARTICIPANT.PROFILE, tone: 'warning' },
  ];

  const firstName = user.name.split(' ')[0];
  const unreadNotifications = notifications.filter((n) => !n.read).slice(0, 5);
  const nextDeadline = upcoming[0];

  const participationStats = {
    registrationsCount: registrations.length,
    attendedCount: registrations.filter((r) => r.attended).length,
    certificatesCount: certificates.length,
    feedbackGivenCount,
  };

  // Spotlight event (Part F Drive 7 / I.6): the upcoming published event
  // with the highest registeredCount/capacity fill ratio — "what's hot
  // right now", never random or fabricated. Ties broken by earliest start.
  const spotlightEvent = [...events]
    .filter((e) => new Date(e.startDate).getTime() > now && e.capacity > 0)
    .sort((a, b) => {
      const ratioB = b.registeredCount / b.capacity;
      const ratioA = a.registeredCount / a.capacity;
      if (ratioB !== ratioA) return ratioB - ratioA;
      return new Date(a.startDate) - new Date(b.startDate);
    })[0];

  // Deadline urgency escalation (Part F Drive 8 / I.7) — same rule as
  // EventDetails, applied to the real registrationDeadline on this card.
  const deadlineDaysLeft = nextDeadline
    ? Math.ceil((new Date(nextDeadline.event.registrationDeadline).getTime() - now) / 86400000)
    : null;
  const deadlineTone = deadlineDaysLeft === null ? 'neutral' : deadlineDaysLeft <= 2 ? 'danger' : deadlineDaysLeft <= 7 ? 'warning' : 'neutral';

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <GradientBanner
        icon={<PartyPopper className="size-6" />}
        title={`Welcome back, ${firstName}!`}
        subtitle="Here's what's happening with your events today."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {spotlightEvent && (
            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
              <EventBanner category={spotlightEvent.category} className="h-14" showIcon />
              <div className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-700">
                    <Flame className="size-3" /> Spotlight
                  </span>
                  <p className="truncate text-sm font-semibold text-ink-900">{spotlightEvent.title}</p>
                  <p className="text-xs text-ink-500">
                    {seatsLabel(spotlightEvent.capacity, spotlightEvent.registeredCount)} · {formatDate(spotlightEvent.startDate)}
                  </p>
                </div>
                <Link
                  to={ROUTES.PARTICIPANT.EVENT_DETAILS(spotlightEvent.id)}
                  className={buttonVariants({ variant: 'secondary', size: 'sm' })}
                >
                  View
                </Link>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-ink-900">Upcoming events</h2>
              <Link
                to={ROUTES.PARTICIPANT.MY_REGISTRATIONS}
                className={buttonVariants({ variant: 'secondary', size: 'sm' })}
              >
                View all
              </Link>
            </div>

            {upcoming.length === 0 ? (
              <EmptyState
                icon={CalendarCheck}
                title="No upcoming events"
                description="You're not registered for any upcoming events yet."
                action={
                  <Link to={ROUTES.PARTICIPANT.EVENTS} className={buttonVariants({ size: 'sm' })}>
                    Browse events
                  </Link>
                }
              />
            ) : (
              <div className="mt-3 flex flex-col gap-2.5">
                {upcoming.map((r) => (
                  <EventCard key={r.id} event={r.event} compact />
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-surface p-4">
            <h2 className="text-base font-bold text-ink-900">Recent activity</h2>
            {notifications.length === 0 ? (
              <p className="mt-3 text-sm text-ink-500">No recent activity.</p>
            ) : (
              <div className="mt-1 flex flex-col divide-y divide-border">
                {notifications.slice(0, 4).map((n) => (
                  <NotificationCard key={n.id} notification={n} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <ParticipationLevelCard stats={participationStats} />

          <div className="rounded-2xl border border-border bg-surface p-4">
            <h2 className="flex items-center gap-2 text-base font-bold text-ink-900">
              <span className="text-lg">⚡</span> Quick actions
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {quickActions.map((a) => (
                <ActionTile key={a.label} {...a} />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-ink-900">Notifications</h2>
              <Link to={ROUTES.PARTICIPANT.NOTIFICATIONS} className="flex items-center gap-1 text-xs font-semibold text-accent-600 hover:text-accent-700">
                See all <ArrowRight className="size-3" />
              </Link>
            </div>
            {unreadNotifications.length === 0 ? (
              <p className="mt-3 text-sm text-ink-500">You're all caught up.</p>
            ) : (
              <div className="mt-1 flex flex-col divide-y divide-border">
                {unreadNotifications.map((n) => (
                  <NotificationCard key={n.id} notification={n} />
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-surface p-4">
            <h2 className="text-base font-bold text-ink-900">Upcoming deadline</h2>
            {nextDeadline ? (
              <div className="mt-3">
                <p className="text-sm font-medium text-ink-900 line-clamp-2">{nextDeadline.event.title}</p>
                <p className="mt-1 text-sm text-ink-500">Starts {formatDate(nextDeadline.event.startDate)}</p>
                <p
                  className={cn(
                    'mt-0.5 flex items-center gap-1 text-xs font-mono',
                    deadlineTone === 'danger' ? 'text-danger-600 font-semibold' : deadlineTone === 'warning' ? 'text-warning-600' : 'text-ink-300'
                  )}
                >
                  {deadlineTone !== 'neutral' && <AlertTriangle className="size-3 shrink-0" />}
                  Register by {formatDate(nextDeadline.event.registrationDeadline)}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-ink-500">Nothing on the horizon.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Mirrors Dashboard's real layout: banner block, 2x4 stat grid, and two
 * content cards (Phase 1 G.2).
 */
function DashboardSkeleton() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <Skeleton className="h-[104px] w-full rounded-2xl sm:h-[92px]" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-center gap-3">
              <Skeleton className="size-12 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="mt-2 h-5 w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <Skeleton className="h-14 w-full rounded-none" />
            <div className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0 flex-1">
                <Skeleton className="h-3 w-16 rounded-full" />
                <Skeleton className="mt-1.5 h-3.5 w-2/3" />
              </div>
              <Skeleton className="h-8 w-16 rounded-lg" />
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4">
            <Skeleton className="h-4 w-32" />
            <div className="mt-3 flex flex-col gap-2.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3.5 rounded-2xl border border-border p-3.5">
                  <Skeleton className="size-12 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <Skeleton className="h-3.5 w-1/2" />
                    <Skeleton className="mt-2 h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4">
            <Skeleton className="h-4 w-28" />
            <SkeletonText lines={3} className="mt-3" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-11 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-2.5 w-24" />
                <Skeleton className="mt-1.5 h-4 w-16" />
              </div>
            </div>
            <Skeleton className="mt-4 h-2 w-full rounded-full" />
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4">
            <Skeleton className="h-4 w-28" />
            <div className="mt-3 grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-2xl" />
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4">
            <Skeleton className="h-4 w-24" />
            <SkeletonText lines={2} className="mt-3" />
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4">
            <Skeleton className="h-4 w-32" />
            <SkeletonText lines={2} className="mt-3" />
          </div>
        </div>
      </div>
    </div>
  );
}
