import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardCheck,
  CheckCircle2,
  FileCheck,
  Award,
  MessageSquareText,
  Download,
  XCircle,
  CalendarDays,
  MapPin,
} from 'lucide-react';
import { Button } from '../../../shared/components/common/Button';
import { buttonVariants } from '../../../shared/components/common/buttonStyles';
import { StatusBadge } from './StatusBadge';
import { getCategoryTheme } from '../utils/categoryTheme';
import { formatDate } from '../../../shared/utils/formatters';
import { ROUTES, REGISTRATION_STATUS, SUBMISSION_STATUS } from '../../../shared/utils/constants';
import { cn } from '../../../shared/utils/cn';

// Static class-string maps so Tailwind's content scanner can find every
// class at build time (matches the pattern already used in EventCard/EventBanner).
const TONE_ICON_CHIP = {
  accent: 'bg-accent-500',
  purple: 'bg-purple-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  info: 'bg-info-500',
};

function buildTrail(row, { certificatesByEvent, feedbackEventIds, submissionsByRegistration }) {
  const nodes = [
    { key: 'registered', label: 'Registered', icon: ClipboardCheck, complete: true },
    { key: 'attended', label: 'Attended', icon: CheckCircle2, complete: Boolean(row.attended) },
  ];

  if (row.event?.requiresSubmission) {
    const submission = submissionsByRegistration[row.id];
    nodes.push({
      key: 'submission',
      label: 'Submission',
      icon: FileCheck,
      complete: submission?.status === SUBMISSION_STATUS.SUBMITTED,
    });
  }

  nodes.push(
    { key: 'certificate', label: 'Certificate', icon: Award, complete: Boolean(certificatesByEvent[row.eventId]) },
    { key: 'feedback', label: 'Feedback', icon: MessageSquareText, complete: feedbackEventIds.has(row.eventId) }
  );

  return nodes;
}

function TrailNode({ node }) {
  const Icon = node.icon;
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          node.complete ? 'border-success-500 bg-success-500 text-white' : 'border-ink-300 bg-surface text-ink-300'
        )}
      >
        <Icon className="size-3.5" />
      </span>
      <span className={cn('whitespace-nowrap text-[10px] font-medium', node.complete ? 'text-success-700' : 'text-ink-300')}>
        {node.label}
      </span>
    </div>
  );
}

/**
 * Card showing one registration as a visual "journey" — Registered ->
 * Attended -> (Submission) -> Certificate -> Feedback — instead of a row of
 * table cells. Part H.1 of the redesign brief: the strongest audit finding.
 */
export function RegistrationJourneyCard({ row, certificatesByEvent, feedbackEventIds, submissionsByRegistration, onCancelClick }) {
  const { icon: CategoryIcon, tone: categoryTone } = getCategoryTheme(row.event?.category);
  const trail = buildTrail(row, { certificatesByEvent, feedbackEventIds, submissionsByRegistration });
  const cert = certificatesByEvent[row.eventId];

  const canCancel = [REGISTRATION_STATUS.REGISTERED, REGISTRATION_STATUS.APPROVED, REGISTRATION_STATUS.WAITLISTED].includes(row.status);
  const canGiveFeedback = row.status === REGISTRATION_STATUS.COMPLETED && row.attended && !feedbackEventIds.has(row.eventId);
  const submission = submissionsByRegistration[row.id];
  const submissionStatus = submission?.status || SUBMISSION_STATUS.NOT_SUBMITTED;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl text-white', TONE_ICON_CHIP[categoryTone])}>
            <CategoryIcon className="size-[18px]" />
          </span>
          <div className="min-w-0">
            <Link
              to={ROUTES.PARTICIPANT.EVENT_DETAILS(row.eventId)}
              className="block truncate text-sm font-semibold text-ink-900 hover:text-accent-600"
            >
              {row.event?.title || 'Untitled event'}
            </Link>
            <div className="mt-0.5 flex items-center gap-3 text-xs text-ink-500">
              <span className="flex items-center gap-1">
                <CalendarDays className="size-3.5" /> {formatDate(row.event?.startDate)}
              </span>
              {row.event?.venue && (
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5" /> {row.event.venue}
                </span>
              )}
            </div>
          </div>
        </div>
        <StatusBadge status={row.status} />
      </div>

      {/* Status trail — horizontal with connecting lines on sm+, a plain
          vertical stack of the same nodes on mobile. */}
      <div className="hidden items-center rounded-xl bg-canvas px-3 py-3 sm:flex">
        {trail.map((node, i) => (
          <Fragment key={node.key}>
            <TrailNode node={node} />
            {i < trail.length - 1 && (
              <div className={cn('mx-1.5 h-0.5 flex-1', node.complete ? 'bg-success-500' : 'bg-ink-300/40')} />
            )}
          </Fragment>
        ))}
      </div>
      <div className="flex flex-col gap-2 rounded-xl bg-canvas px-3 py-3 sm:hidden">
        {trail.map((node) => {
          const Icon = node.icon;
          return (
            <div key={node.key} className="flex items-center gap-2.5">
              <span
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full border-2',
                  node.complete ? 'border-success-500 bg-success-500 text-white' : 'border-ink-300 bg-surface text-ink-300'
                )}
              >
                <Icon className="size-3" />
              </span>
              <span className={cn('text-xs font-medium', node.complete ? 'text-success-700' : 'text-ink-500')}>{node.label}</span>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <div className="flex items-center gap-3 text-xs text-ink-500">
          {row.event?.requiresSubmission && (
            <Link to={ROUTES.PARTICIPANT.SUBMISSION(row.id)} className="inline-flex hover:opacity-80">
              <StatusBadge type="submission" status={submissionStatus} />
            </Link>
          )}
          {cert && (
            <a href={cert.downloadUrl} className="flex items-center gap-1.5 font-medium text-accent-600 hover:text-accent-700">
              <Download className="size-3.5" /> Certificate
            </a>
          )}
        </div>
        <div className="flex gap-2">
          {canGiveFeedback && (
            <Link to={ROUTES.PARTICIPANT.FEEDBACK(row.eventId)} className={buttonVariants({ variant: 'secondary', size: 'sm' })}>
              <MessageSquareText className="size-3.5 mr-1.5" /> Feedback
            </Link>
          )}
          {canCancel && (
            <Button variant="ghost" size="sm" onClick={() => onCancelClick(row)}>
              <XCircle className="size-3.5 mr-1.5 text-danger-500" /> Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
