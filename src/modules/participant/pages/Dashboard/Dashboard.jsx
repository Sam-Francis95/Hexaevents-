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
} from 'lucide-react';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { StatCard } from '../../../../shared/components/common/StatCard';
import { GradientBanner } from '../../../../shared/components/common/GradientBanner';
import { ActionTile } from '../../../../shared/components/common/ActionTile';
import { Loader } from '../../../../shared/components/common/Loader';
import { EmptyState } from '../../../../shared/components/common/EmptyState';
import { buttonVariants } from '../../../../shared/components/common/buttonStyles';
import { EventCard } from '../../components/EventCard';
import { NotificationCard } from '../../components/NotificationCard';
import { getMyRegistrations } from '../../services/registrationService';
import { getNotifications } from '../../services/notificationService';
import { getCertificates } from '../../services/certificateService';
import { REGISTRATION_STATUS, ROUTES } from '../../../../shared/utils/constants';
import { formatDate } from '../../../../shared/utils/formatters';

export default function Dashboard() {
  const { user } = useAuth();
  const [state, setState] = useState({ isLoading: true, registrations: [], notifications: [], certificates: [] });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [regsRes, notifRes, certRes] = await Promise.all([
        getMyRegistrations(user.id),
        getNotifications(user.id),
        getCertificates(user.id),
      ]);
      if (cancelled) return;
      setState({
        isLoading: false,
        registrations: regsRes.data || [],
        notifications: notifRes.data || [],
        certificates: certRes.data || [],
      });
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  if (state.isLoading) return <Loader fullHeight label="Loading your dashboard…" />;

  const { registrations, notifications, certificates } = state;
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
                <p className="mt-0.5 text-xs text-ink-300 font-mono">
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
