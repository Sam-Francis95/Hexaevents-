import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Download, MessageSquareText, XCircle, CheckCircle2, Circle } from 'lucide-react';
import { Table } from '../../../../shared/components/common/Table';
import { EmptyState } from '../../../../shared/components/common/EmptyState';
import { Loader } from '../../../../shared/components/common/Loader';
import { Button } from '../../../../shared/components/common/Button';
import { buttonVariants } from '../../../../shared/components/common/buttonStyles';
import { Modal } from '../../../../shared/components/common/Modal';
import { StatusBadge } from '../../components/StatusBadge';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { useToast } from '../../../../shared/hooks/useToast';
import { getMyRegistrations, cancelRegistration } from '../../services/registrationService';
import { getCertificates } from '../../services/certificateService';
import { getMyFeedback } from '../../services/feedbackService';
import { formatDate } from '../../../../shared/utils/formatters';
import { ROUTES, REGISTRATION_STATUS } from '../../../../shared/utils/constants';

export default function MyRegistrations() {
  const { user } = useAuth();
  const toast = useToast();

  const [rows, setRows] = useState([]);
  const [certificatesByEvent, setCertificatesByEvent] = useState({});
  const [feedbackEventIds, setFeedbackEventIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [pendingCancel, setPendingCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  async function load() {
    setIsLoading(true);
    const [regsRes, certRes, feedbackRes] = await Promise.all([
      getMyRegistrations(user.id),
      getCertificates(user.id),
      getMyFeedback(user.id),
    ]);
    setRows(regsRes.data || []);
    setCertificatesByEvent(Object.fromEntries((certRes.data || []).map((c) => [c.eventId, c])));
    setFeedbackEventIds(new Set((feedbackRes.data || []).map((f) => f.eventId)));
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
    if (res.success) {
      toast.success('Registration cancelled.');
      load();
    } else {
      toast.error(res.message);
    }
  }

  if (isLoading) return <Loader fullHeight label="Loading your registrations…" />;

  const columns = [
    {
      key: 'event',
      header: 'Event',
      render: (row) => (
        <Link to={ROUTES.PARTICIPANT.EVENT_DETAILS(row.eventId)} className="font-medium text-ink-900 hover:text-accent-600">
          {row.event?.title || 'Untitled event'}
        </Link>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      className: 'font-mono text-xs whitespace-nowrap',
      render: (row) => formatDate(row.event?.startDate),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'attendance',
      header: 'Attendance',
      render: (row) =>
        row.attended ? (
          <span className="flex items-center gap-1.5 text-sm text-success-700">
            <CheckCircle2 className="size-3.5" /> Attended
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-sm text-ink-300">
            <Circle className="size-3.5" /> Pending
          </span>
        ),
    },
    {
      key: 'certificate',
      header: 'Certificate',
      render: (row) => {
        const cert = certificatesByEvent[row.eventId];
        if (!cert) return <span className="text-sm text-ink-300">—</span>;
        return (
          <a href={cert.downloadUrl} className="flex items-center gap-1.5 text-sm font-medium text-accent-600 hover:text-accent-700">
            <Download className="size-3.5" /> Download
          </a>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (row) => {
        const canCancel = [REGISTRATION_STATUS.REGISTERED, REGISTRATION_STATUS.APPROVED, REGISTRATION_STATUS.WAITLISTED].includes(row.status);
        const canGiveFeedback = row.status === REGISTRATION_STATUS.COMPLETED && row.attended && !feedbackEventIds.has(row.eventId);

        return (
          <div className="flex justify-end gap-2">
            {canGiveFeedback && (
              <Link to={ROUTES.PARTICIPANT.FEEDBACK(row.eventId)} className={buttonVariants({ variant: 'secondary', size: 'sm' })}>
                <MessageSquareText className="size-3.5 mr-1.5" /> Feedback
              </Link>
            )}
            {canCancel && (
              <Button variant="ghost" size="sm" onClick={() => setPendingCancel(row)}>
                <XCircle className="size-3.5 mr-1.5 text-danger-500" /> Cancel
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">My registrations</h1>
        <p className="mt-1 text-sm text-ink-500">Track the status of every event you've registered for.</p>
      </div>

      <Table
        columns={columns}
        rows={rows}
        emptyState={
          <EmptyState
            icon={ClipboardList}
            title="No registrations yet"
            description="Browse upcoming events and register to see them here."
            action={
              <Link to={ROUTES.PARTICIPANT.EVENTS} className={buttonVariants({ size: 'sm' })}>
                Browse events
              </Link>
            }
          />
        }
      />

      <Modal
        isOpen={Boolean(pendingCancel)}
        onClose={() => setPendingCancel(null)}
        title="Cancel registration?"
        description={pendingCancel ? `You'll lose your spot for "${pendingCancel.event?.title}".` : ''}
        footer={
          <>
            <Button variant="secondary" onClick={() => setPendingCancel(null)}>
              Keep registration
            </Button>
            <Button variant="danger" isLoading={isCancelling} onClick={confirmCancel}>
              Cancel registration
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-500">This action can't be undone. You can register again later if seats are available.</p>
      </Modal>
    </div>
  );
}
