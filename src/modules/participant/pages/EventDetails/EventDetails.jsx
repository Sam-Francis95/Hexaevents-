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
} from 'lucide-react';
import { Loader } from '../../../../shared/components/common/Loader';
import { Button } from '../../../../shared/components/common/Button';
import { Badge } from '../../../../shared/components/common/Badge';
import { StatusBadge } from '../../components/StatusBadge';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { useToast } from '../../../../shared/hooks/useToast';
import { getEventById } from '../../services/eventService';
import { getRegistrationForEvent, cancelRegistration } from '../../services/registrationService';
import { formatDate, formatTimeRange, seatsLabel } from '../../../../shared/utils/formatters';
import { downloadEventIcs } from '../../../../shared/utils/calendar';
import { ROUTES } from '../../../../shared/utils/constants';

const MODE_LABEL = { online: 'Online', offline: 'In-person', hybrid: 'Hybrid' };

export default function EventDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    Promise.all([getEventById(id), getRegistrationForEvent(user.id, id)]).then(([eventRes, regRes]) => {
      if (cancelled) return;
      setEvent(eventRes.success ? eventRes.data : null);
      setRegistration(regRes.data || null);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [id, user.id]);

  if (isLoading) return <Loader fullHeight label="Loading event…" />;

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

  const isFull = event.registeredCount >= event.capacity;
  const deadlinePassed = new Date(event.registrationDeadline).getTime() < Date.now();
  const canRegister = event.status === 'published' && !deadlinePassed && !registration;

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

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 pb-10">
      <Link to={ROUTES.PARTICIPANT.EVENTS} className="flex w-fit items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900">
        <ArrowLeft className="size-4" /> Back to Browse Events
      </Link>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="h-2.5" style={{ backgroundColor: event.bannerColor }} />
        <div className="flex flex-col gap-4 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge tone="accent" dot={false}>{event.category}</Badge>
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
            <div className="flex items-center gap-2.5 text-sm text-ink-700">
              <Users className="size-4 shrink-0 text-ink-500" /> {seatsLabel(event.capacity, event.registeredCount)} · {MODE_LABEL[event.mode]}
            </div>
          </div>

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
                {deadlinePassed ? 'Registration closed' : 'Not open for registration'}
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
          <ul className="mt-3 flex flex-col gap-2.5">
            {event.agenda.map((item, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="w-14 shrink-0 font-mono text-ink-300">{item.time}</span>
                <span className="text-ink-700">{item.title}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-500">
            <Mic className="size-4" /> Speakers
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {event.speakers.map((speaker) => (
              <li key={speaker} className="text-sm text-ink-700">{speaker}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
