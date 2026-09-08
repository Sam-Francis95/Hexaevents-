import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList, Download, MessageSquareText, XCircle, Calendar, MapPin,
  Ticket, Trophy, ArrowRight, ChevronRight
} from 'lucide-react';
import { Modal } from '../../../../shared/components/common/Modal';
import { Button } from '../../../../shared/components/common/Button';
import { buttonVariants } from '../../../../shared/components/common/buttonStyles';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { useToast } from '../../../../shared/hooks/useToast';
import { getMyRegistrations, cancelRegistration } from '../../services/registrationService';
import { getSubmissionForRegistration } from '../../services/submissionService';
import { getCertificates } from '../../services/certificateService';
import { getMyFeedback } from '../../services/feedbackService';
import { formatDate } from '../../../../shared/utils/formatters';
import { ROUTES, REGISTRATION_STATUS, SUBMISSION_STATUS } from '../../../../shared/utils/constants';
import { MOCK_REGISTRATIONS, MOCK_EVENTS } from '../../../../shared/utils/mockData';
import { cn } from '../../../../shared/utils/cn';

const STATUS_TABS = [
  { key: 'all',       label: 'All' },
  { key: 'registered', label: 'Registered' },
  { key: 'approved',  label: 'Confirmed' },
  { key: 'waitlisted', label: 'Waitlisted' },
  { key: 'completed', label: 'Completed' },
];

const STATUS_STYLE = {
  registered: { dot: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400', label: 'Registered' },
  approved:   { dot: 'bg-green-500', badge: 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400', label: 'Confirmed' },
  waitlisted: { dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400', label: 'Waitlisted' },
  completed:  { dot: 'bg-slate-400', badge: 'bg-slate-50 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400', label: 'Completed' },
  rejected:   { dot: 'bg-red-500',   badge: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400', label: 'Rejected' },
};

const CAT_STYLE = {
  HACKATHON:   'bg-[#0056D2] text-white',
  IDEATHON:    'bg-[#7C3AED] text-white',
  COMPETITION: 'bg-[#0891B2] text-white',
  WORKSHOP:    'bg-[#16A34A] text-white',
  CHALLENGE:   'bg-[#EA580C] text-white',
  default:     'bg-ink-700 text-white',
};

export default function MyRegistrations() {
  const { user } = useAuth();
  const toast = useToast();

  const [rows, setRows] = useState([]);
  const [certificatesByEvent, setCertificatesByEvent] = useState({});
  const [feedbackEventIds, setFeedbackEventIds] = useState(new Set());
  const [submissionsByRegistration, setSubmissionsByRegistration] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [pendingCancel, setPendingCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  async function load() {
    setIsLoading(true);
    const [regsRes, certRes, feedbackRes] = await Promise.all([
      getMyRegistrations(user.id),
      getCertificates(user.id),
      getMyFeedback(user.id),
    ]);
    const registrations = (regsRes.data || []).length > 0 ? regsRes.data : MOCK_REGISTRATIONS;
    setRows(registrations);
    setCertificatesByEvent(Object.fromEntries((certRes.data || []).map((c) => [c.eventId, c])));
    setFeedbackEventIds(new Set((feedbackRes.data || []).map((f) => f.eventId)));

    const hackathonRows = registrations.filter((r) => r.event?.requiresSubmission);
    if (hackathonRows.length > 0) {
      const subResults = await Promise.all(hackathonRows.map((r) => getSubmissionForRegistration(r.id)));
      const map = {};
      hackathonRows.forEach((r, i) => { if (subResults[i].success) map[r.id] = subResults[i].data; });
      setSubmissionsByRegistration(map);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  async function confirmCancel() {
    if (!pendingCancel) return;
    setIsCancelling(true);
    const res = await cancelRegistration(pendingCancel.id);
    setIsCancelling(false);
    setPendingCancel(null);
    if (res.success) { toast.success('Registration cancelled.'); load(); }
    else toast.error(res.message);
  }

  const filteredRows = activeTab === 'all' ? rows : rows.filter((r) => r.status === activeTab);
  const tabCounts = STATUS_TABS.reduce((acc, tab) => {
    acc[tab.key] = tab.key === 'all' ? rows.length : rows.filter((r) => r.status === tab.key).length;
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">My Registrations</h1>
          <p className="mt-1 text-sm text-ink-400">Track all the competitions and events you've joined.</p>
        </div>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-[18px] border border-border bg-surface" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">My Registrations</h1>
          <p className="mt-1 text-sm text-ink-400">Track all the competitions and events you've joined.</p>
        </div>
        <Link to={ROUTES.PARTICIPANT.EVENTS} className="flex items-center gap-1.5 rounded-xl bg-[#0056D2] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#0048B0]">
          Explore Events <ArrowRight className="size-4" />
        </Link>
      </div>

      {/* Tab filters */}
      <div className="flex gap-1 overflow-x-auto rounded-[14px] border border-border bg-canvas p-1 scrollbar-none">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all',
              activeTab === tab.key
                ? 'bg-[#0056D2] text-white shadow-sm'
                : 'text-ink-500 hover:bg-surface hover:text-ink-900'
            )}
          >
            {tab.label}
            {tabCounts[tab.key] > 0 && (
              <span className={cn(
                'flex min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-bold',
                activeTab === tab.key ? 'bg-white/25 text-white' : 'bg-border text-ink-500'
              )}>
                {tabCounts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {filteredRows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[18px] border border-dashed border-border bg-surface py-12 text-center">
          <ClipboardList className="mb-3 size-12 text-ink-200" />
          <h3 className="text-base font-bold text-ink-900">No registrations here</h3>
          <p className="mt-1 text-sm text-ink-400">
            {activeTab === 'all' ? "You haven't registered for any events yet." : `No ${STATUS_TABS.find((t) => t.key === activeTab)?.label.toLowerCase()} registrations.`}
          </p>
          <Link to={ROUTES.PARTICIPANT.EVENTS} className="mt-4 flex items-center gap-1.5 rounded-xl bg-[#0056D2] px-4 py-2.5 text-sm font-semibold text-white">
            Discover your next opportunity <ArrowRight className="size-4" />
          </Link>
          {activeTab === 'all' && (
            <div className="mt-8 w-full px-6">
              <p className="mb-4 text-left text-sm font-bold text-ink-700">You might like</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {MOCK_EVENTS.slice(0, 4).map((event) => (
                  <MiniEventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredRows.map((row, i) => (
            <div key={row.id} className="animate-entrance-rise" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
              <RegistrationCard
                row={row}
                certificatesByEvent={certificatesByEvent}
                feedbackEventIds={feedbackEventIds}
                submissionsByRegistration={submissionsByRegistration}
                onCancelClick={setPendingCancel}
              />
            </div>
          ))}
        </div>
      )}

      {/* Cancel Modal */}
      <Modal
        isOpen={Boolean(pendingCancel)}
        onClose={() => setPendingCancel(null)}
        title="Cancel registration?"
        description={pendingCancel ? `You'll lose your spot for "${pendingCancel.event?.title}".` : ''}
        footer={
          <>
            <Button variant="secondary" onClick={() => setPendingCancel(null)}>Keep registration</Button>
            <Button variant="danger" isLoading={isCancelling} onClick={confirmCancel}>Cancel registration</Button>
          </>
        }
      >
        <p className="text-sm text-ink-500">This action can't be undone. You can register again later if seats are available.</p>
      </Modal>
    </div>
  );
}

function RegistrationCard({ row, certificatesByEvent, feedbackEventIds, submissionsByRegistration, onCancelClick }) {
  const event = row.event || {};
  const ss = STATUS_STYLE[row.status] || STATUS_STYLE.registered;
  const catStyle = CAT_STYLE[String(event.category || '').toUpperCase()] || CAT_STYLE.default;
  const cert = certificatesByEvent[row.eventId];
  const canCancel = [REGISTRATION_STATUS.REGISTERED, REGISTRATION_STATUS.APPROVED, REGISTRATION_STATUS.WAITLISTED].includes(row.status);
  const canGiveFeedback = row.status === REGISTRATION_STATUS.COMPLETED && row.attended && !feedbackEventIds.has(row.eventId);
  const submission = submissionsByRegistration[row.id];
  const subStatus = submission?.status || SUBMISSION_STATUS.NOT_SUBMITTED;

  return (
    <div className="group flex overflow-hidden rounded-[18px] border border-border bg-surface shadow-sm transition-all hover:shadow-md">
      {/* Event Image */}
      <div className="relative hidden w-36 shrink-0 overflow-hidden sm:block">
        {event.bannerUrl ? (
          <img src={event.bannerUrl} alt={event.title} className="size-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#0056D2,#7C3AED)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        {event.category && (
          <span className={cn('absolute left-2 top-2 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide', catStyle)}>
            {event.category}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <Link to={ROUTES.PARTICIPANT.EVENT_DETAILS(event.id || '')} className="text-base font-bold text-ink-900 hover:text-[#0056D2]">
              {event.title || 'Event'}
            </Link>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-[12px] text-ink-400">
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5" /> {event.startDate ? formatDate(event.startDate) : 'TBD'}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" /> {event.mode === 'online' ? 'Online' : event.location || 'TBA'}
              </span>
            </div>
          </div>
          {/* Status badge */}
          <span className={cn('flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold', ss.badge)}>
            <span className={cn('size-1.5 rounded-full', ss.dot)} />
            {ss.label}
          </span>
        </div>

        {/* Submission status for hackathons */}
        {event.requiresSubmission && (
          <Link to={ROUTES.PARTICIPANT.SUBMISSION(row.id)} className="flex items-center gap-2 rounded-xl border border-border bg-canvas px-3 py-2 hover:border-[#0056D2]/30">
            <Ticket className="size-4 text-ink-400" />
            <span className="text-[12px] font-medium text-ink-700">Submission:</span>
            <span className={cn('text-[12px] font-bold', subStatus === SUBMISSION_STATUS.SUBMITTED ? 'text-green-600' : subStatus === SUBMISSION_STATUS.PAST_DEADLINE ? 'text-red-500' : 'text-ink-400')}>
              {subStatus === SUBMISSION_STATUS.SUBMITTED ? '✓ Submitted' : subStatus === SUBMISSION_STATUS.PAST_DEADLINE ? 'Past deadline' : 'Not submitted'}
            </span>
            <ChevronRight className="ml-auto size-3.5 text-ink-300" />
          </Link>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Link to={ROUTES.PARTICIPANT.EVENT_DETAILS(event.id || '')} className="rounded-xl border border-border bg-canvas px-3 py-1.5 text-[12px] font-semibold text-ink-700 hover:bg-ink-900/5">
            View Details
          </Link>
          {cert && (
            <a href={cert.downloadUrl} className="flex items-center gap-1.5 rounded-xl bg-green-50 px-3 py-1.5 text-[12px] font-semibold text-green-700 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400">
              <Download className="size-3.5" /> Certificate
            </a>
          )}
          {canGiveFeedback && (
            <Link to={ROUTES.PARTICIPANT.FEEDBACK(row.eventId)} className="flex items-center gap-1.5 rounded-xl bg-purple-50 px-3 py-1.5 text-[12px] font-semibold text-purple-700 hover:bg-purple-100 dark:bg-purple-500/10 dark:text-purple-400">
              <MessageSquareText className="size-3.5" /> Feedback
            </Link>
          )}
          {canCancel && (
            <button onClick={() => onCancelClick(row)} className="flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-1.5 text-[12px] font-semibold text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 ml-auto">
              <XCircle className="size-3.5" /> Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniEventCard({ event }) {
  const catStyle = CAT_STYLE[String(event.category || '').toUpperCase()] || CAT_STYLE.default;
  return (
    <Link to={ROUTES.PARTICIPANT.EVENT_DETAILS(event.id)} className="group flex items-center gap-3 rounded-[14px] border border-border bg-canvas p-3 transition-all hover:border-[#0056D2]/30 hover:shadow-sm">
      <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-ink-900/5">
        {event.bannerUrl ? <img src={event.bannerUrl} alt={event.title} className="size-full object-cover" /> : <div className="size-full bg-[linear-gradient(135deg,#0056D2,#7C3AED)]" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-ink-900 group-hover:text-[#0056D2]">{event.title}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={cn('rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide', catStyle)}>{event.category}</span>
          <span className="text-[10px] text-ink-400">{formatDate(event.startDate)}</span>
        </div>
      </div>
      <ArrowRight className="size-3.5 shrink-0 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#0056D2]" />
    </Link>
  );
}
