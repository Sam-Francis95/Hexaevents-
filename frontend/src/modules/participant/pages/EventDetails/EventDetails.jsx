import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Share2,
  CalendarPlus,
  Mic,
  ListChecks,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
} from 'lucide-react';
import { Skeleton, SkeletonText } from '../../../../shared/components/common/Skeleton';
import { Button } from '../../../../shared/components/common/Button';
import { Badge } from '../../../../shared/components/common/Badge';
import { Avatar } from '../../../../shared/components/common/Avatar';
import { StatusBadge } from '../../components/StatusBadge';
import { EventBanner } from '../../components/EventBanner';
import { getCategoryTheme } from '../../utils/categoryTheme';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { useToast } from '../../../../shared/hooks/useToast';
import { getEventById, getEventEligibility } from '../../services/eventService';
import { getRegistrationForEvent, cancelRegistration } from '../../services/registrationService';
import { formatDate, formatTimeRange, seatsLabel, seatsUrgencyTone } from '../../../../shared/utils/formatters';
import { downloadEventIcs } from '../../../../shared/utils/calendar';
import { ROUTES } from '../../../../shared/utils/constants';
import { cn } from '../../../../shared/utils/cn';

const MODE_LABEL = { online: 'Online', offline: 'In-person', hybrid: 'Hybrid' };

const SEATS_TONE_TEXT = {
  danger: 'text-danger-600',
  warning: 'text-warning-600',
  info: 'text-ink-700',
};

export default function EventDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    Promise.all([
      getEventById(id),
      getRegistrationForEvent(user.id, id),
      getEventEligibility(id),
    ]).then(([eventRes, regRes, eligibilityRes]) => {
      if (cancelled) return;
      setEvent(eventRes.success ? eventRes.data : null);
      setRegistration(regRes.data || null);
      setEligibility(eligibilityRes.success ? eligibilityRes.data : { eligible: true, reasons: [], rules: [] });
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [id, user.id]);

  if (isLoading) return <EventDetailsSkeleton />;

  if (!event) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <p className="text-lg font-medium text-ink-900">Event not found</p>
        <Link to={ROUTES.PARTICIPANT.EVENTS} className="mt-3 inline-block text-sm font-medium text-accent-600">
          ← Back to Browse Events
        </Link>
      </div>
    );
  }

  const categoryTone = getCategoryTheme(event.category).tone;
  const isFull = event.registeredCount >= event.capacity;
  const deadlinePassed = new Date(event.registrationDeadline).getTime() < Date.now();
  const daysUntilDeadline = Math.ceil((new Date(event.registrationDeadline).getTime() - Date.now()) / 86400000);
  // Deadline urgency escalation (Part F Drive 8) — only ever reflects the
  // real registrationDeadline, never a fabricated countdown.
  const deadlineTone = deadlinePassed ? 'danger' : daysUntilDeadline <= 2 ? 'danger' : daysUntilDeadline <= 7 ? 'warning' : 'neutral';
  // Social proof (Part F Drive 5) — a real registeredCount, shown only once
  // it's meaningfully high.
  const showSocialProof = event.registeredCount > 10;
  const isEligible = eligibility?.eligible !== false; // fail open visually while loading, gate is server-enforced anyway
  const hasRules = (eligibility?.rules || []).length > 0;
  const canRegister = event.status === 'published' && !deadlinePassed && !registration && isEligible;

  async function handleCancel() {
    if (!registration) return;
    setIsCancelling(true);
    const res = await cancelRegistration(registration.id);
    setIsCancelling(false);
    if (res.success) {
      setRegistration(null);
      toast.success('Registration cancelled.');
    } else {
      toast.error(res.message);
    }
  }

  function handleShare() {
    navigator.clipboard?.writeText(window.location.href);
    toast.info('Link copied to clipboard.');
  }

  function registerButtonLabel() {
    if (deadlinePassed) return 'Registration closed';
    if (!isEligible) return 'Not eligible';
    if (event.status !== 'published') return 'Not open for registration';
    return isFull ? 'Join waitlist' : 'Register';
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 pb-10">
      <Link to={ROUTES.PARTICIPANT.EVENTS} className="flex w-fit items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900">
        <ArrowLeft className="size-4" /> Back to Browse Events
      </Link>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <EventBanner category={event.category} className="h-32 sm:h-40" showIcon />
        <div className="flex flex-col gap-4 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge tone={categoryTone} dot={false}>{event.category}</Badge>
                <StatusBadge type="event" status={event.status} />
                {registration && <StatusBadge status={registration.status} />}
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-ink-900">{event.title}</h1>
            </div>
          </div>

          <p className="max-w-2xl text-sm leading-relaxed text-ink-700">{event.description}</p>

          <div className="grid grid-cols-1 gap-3 rounded-lg border border-border bg-canvas p-4 sm:grid-cols-2">
            <div className="flex items-center gap-2.5 text-sm text-ink-700">
              <CalendarDays className="size-4 shrink-0 text-ink-500" /> {formatDate(event.startDate)}
            </div>
            <div className="flex items-center gap-2.5 text-sm text-ink-700">
              <Clock className="size-4 shrink-0 text-ink-500" /> {formatTimeRange(event.startDate, event.endDate)}
            </div>
            <div className="flex items-center gap-2.5 text-sm text-ink-700">
              <MapPin className="size-4 shrink-0 text-ink-500" /> {event.venue}
            </div>
            <div
              className={cn(
                'flex items-center gap-2.5 text-sm',
                SEATS_TONE_TEXT[seatsUrgencyTone(event.capacity, event.registeredCount)]
              )}
            >
              <Users className="size-4 shrink-0" /> {seatsLabel(event.capacity, event.registeredCount)} · {MODE_LABEL[event.mode]}
            </div>
            {!deadlinePassed && (
              <div
                className={cn(
                  'flex items-center gap-2.5 text-sm sm:col-span-2',
                  deadlineTone === 'danger' ? 'text-danger-600 font-medium' : deadlineTone === 'warning' ? 'text-warning-600' : 'text-ink-700'
                )}
              >
                {deadlineTone !== 'neutral' ? (
                  <AlertTriangle className="size-4 shrink-0" />
                ) : (
                  <Clock className="size-4 shrink-0 text-ink-500" />
                )}
                Registration closes {formatDate(event.registrationDeadline)}
                {daysUntilDeadline <= 7 && daysUntilDeadline >= 0 && (
                  <span> · {daysUntilDeadline === 0 ? 'today' : `${daysUntilDeadline} day${daysUntilDeadline === 1 ? '' : 's'} left`}</span>
                )}
              </div>
            )}
            {showSocialProof && (
              <div className="flex items-center gap-2.5 text-sm text-info-600 sm:col-span-2">
                <Users className="size-4 shrink-0" /> {event.registeredCount} people are attending
              </div>
            )}
          </div>

          {hasRules && (
            <div
              className={`flex items-start gap-3 rounded-lg border p-4 ${
                isEligible ? 'border-success-500/30 bg-success-50' : 'border-danger-500/30 bg-danger-50'
              }`}
            >
              {isEligible ? (
                <ShieldCheck className="size-4 shrink-0 mt-0.5 text-success-700" />
              ) : (
                <ShieldAlert className="size-4 shrink-0 mt-0.5 text-danger-700" />
              )}
              <div>
                <p className={`text-sm font-medium ${isEligible ? 'text-success-700' : 'text-danger-700'}`}>
                  {isEligible ? "You're eligible for this event" : "You're not eligible for this event"}
                </p>
                {!isEligible && (
                  <ul className="mt-1 space-y-0.5 text-sm text-danger-700/90">
                    {(eligibility.reasons || []).map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            {registration ? (
              <Button variant="danger" leftIcon={<XCircle className="size-4" />} isLoading={isCancelling} onClick={handleCancel}>
                Cancel registration
              </Button>
            ) : canRegister ? (
              <Button onClick={() => navigate(ROUTES.PARTICIPANT.REGISTER(event.id))}>
                {isFull ? 'Join waitlist' : 'Register'}
              </Button>
            ) : (
              <Button disabled variant="secondary">
                {registerButtonLabel()}
              </Button>
            )}
            <Button variant="secondary" leftIcon={<CalendarPlus className="size-4" />} onClick={() => downloadEventIcs(event)}>
              Add to calendar
            </Button>
            <Button variant="ghost" leftIcon={<Share2 className="size-4" />} onClick={handleShare}>
              Share
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-500">
            <ListChecks className="size-4" /> Agenda
          </h2>
          {(event.agenda || []).length === 0 ? (
            <p className="mt-3 text-sm text-ink-500">Agenda not published yet.</p>
          ) : (
            <ol className="relative mt-4 flex flex-col gap-5 border-l border-border pl-5">
              {(event.agenda || []).map((item, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[25px] top-0.5 flex size-3 items-center justify-center rounded-full border-2 border-accent-500 bg-surface" />
                  <span className="inline-block rounded-md bg-canvas px-1.5 py-0.5 font-mono text-xs text-ink-500">{item.time}</span>
                  <p className="mt-1 text-sm text-ink-700">{item.title}</p>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-500">
            <Mic className="size-4" /> Speakers
          </h2>
          {(event.speakers || []).length === 0 ? (
            <p className="mt-3 text-sm text-ink-500">No speakers listed yet.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-3">
              {(event.speakers || []).map((speaker) => (
                <li key={speaker} className="flex items-center gap-3">
                  <Avatar name={speaker} size="sm" />
                  <span className="text-sm font-medium text-ink-700">{speaker}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Mirrors EventDetails' real layout: back link, banner+header card, and the
 * two-column agenda/speakers grid (Phase 1 G.2).
 */
function EventDetailsSkeleton() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 pb-10">
      <Skeleton className="h-4 w-40" />

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <Skeleton className="h-2.5 w-full rounded-none" />
        <div className="flex flex-col gap-4 p-6">
          <div className="space-y-2">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-7 w-2/3" />
          </div>
          <SkeletonText lines={2} />
          <Skeleton className="h-24 w-full rounded-lg" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-10 w-28 rounded-xl" />
            <Skeleton className="h-10 w-36 rounded-xl" />
            <Skeleton className="h-10 w-24 rounded-xl" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <Skeleton className="h-4 w-20" />
          <SkeletonText lines={4} className="mt-3" />
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <Skeleton className="h-4 w-20" />
          <SkeletonText lines={3} className="mt-3" />
        </div>
      </div>
    </div>
  );
}
