import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Lock, UploadCloud } from 'lucide-react';
import { Loader } from '../../../../shared/components/common/Loader';
import { Input } from '../../../../shared/components/common/Input';
import { Button } from '../../../../shared/components/common/Button';
import { StatusBadge } from '../../components/StatusBadge';
import { useToast } from '../../../../shared/hooks/useToast';
import { getRegistrationById } from '../../services/registrationService';
import { getSubmissionForRegistration, submitSubmission } from '../../services/submissionService';
import { isValidUrl } from '../../../../shared/utils/validators';
import { formatDateTime } from '../../../../shared/utils/formatters';
import { ROUTES, SUBMISSION_STATUS } from '../../../../shared/utils/constants';

export default function Submission() {
  const { registrationId } = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [registration, setRegistration] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [githubLink, setGithubLink] = useState('');
  const [driveVideoLink, setDriveVideoLink] = useState('');
  const [pdfFile, setPdfFile] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getRegistrationById(registrationId), getSubmissionForRegistration(registrationId)]).then(
      ([regRes, subRes]) => {
        if (cancelled) return;
        if (!regRes.success || !regRes.data?.event?.requiresSubmission) {
          toast.error('This registration does not have a submission to manage.');
          navigate(ROUTES.PARTICIPANT.MY_REGISTRATIONS, { replace: true });
          return;
        }
        setRegistration(regRes.data);
        if (subRes.success) {
          setSubmission(subRes.data);
          setGithubLink(subRes.data.githubLink || '');
          setDriveVideoLink(subRes.data.driveVideoLink || '');
        }
        setIsLoading(false);
      }
    );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registrationId]);

  if (isLoading) return <Loader fullHeight label="Loading submission…" />;

  const event = registration.event;
  const isLocked = Boolean(event.submissionDeadline) && new Date(event.submissionDeadline) < new Date();

  async function handleSubmit(e) {
    e.preventDefault();
    const fieldErrors = {};
    if (!isValidUrl(githubLink)) fieldErrors.githubLink = 'Enter a valid URL starting with http:// or https://.';
    if (!isValidUrl(driveVideoLink)) fieldErrors.driveVideoLink = 'Enter a valid URL starting with http:// or https://.';
    if (!pdfFile && !submission?.pdfUrl) fieldErrors.pdf = 'A PDF submission is required.';
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setIsSubmitting(true);
    const res = await submitSubmission({ registrationId, githubLink, driveVideoLink, pdfFile });
    setIsSubmitting(false);

    if (!res.success) {
      toast.error(res.message);
      return;
    }
    toast.success(res.message);
    setSubmission(res.data);
    setPdfFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 pb-10">
      <Link
        to={ROUTES.PARTICIPANT.MY_REGISTRATIONS}
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft className="size-4" /> Back to my registrations
      </Link>

      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Hackathon submission</h1>
          {submission && <StatusBadge type="submission" status={isLocked ? SUBMISSION_STATUS.PAST_DEADLINE : submission.status} />}
        </div>
        <p className="mt-1 text-sm text-ink-500">
          {event.title}
          {event.submissionDeadline && <> · Submission deadline {formatDateTime(event.submissionDeadline)}</>}
        </p>
      </div>

      {isLocked ? (
        <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-6">
          <Lock className="mt-0.5 size-5 shrink-0 text-ink-300" />
          <div>
            <p className="text-sm font-medium text-ink-900">The submission deadline has passed.</p>
            <p className="mt-1 text-sm text-ink-500">
              {submission?.pdfUrl
                ? 'Your last submitted files are shown below, but no further changes can be made.'
                : 'No submission was made before the deadline closed.'}
            </p>
            {submission?.pdfUrl && (
              <a
                href={submission.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent-500 hover:text-accent-600"
              >
                <FileText className="size-4" /> View submitted PDF
              </a>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex flex-col gap-4">
            <Input
              label="GitHub link"
              hint="Optional"
              placeholder="https://github.com/your-team/project"
              value={githubLink}
              onChange={(e) => setGithubLink(e.target.value)}
              error={errors.githubLink}
            />
            <Input
              label="Google Drive video link"
              hint="Optional"
              placeholder="https://drive.google.com/file/d/..."
              value={driveVideoLink}
              onChange={(e) => setDriveVideoLink(e.target.value)}
              error={errors.driveVideoLink}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink-700" htmlFor="pdf">
                PDF writeup <span className="text-danger-500">*</span>
              </label>
              <label
                htmlFor="pdf"
                className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-dashed border-border-strong px-3.5 py-3 text-sm text-ink-500 hover:border-accent-500 hover:text-accent-500"
              >
                <UploadCloud className="size-4" />
                {pdfFile ? pdfFile.name : submission?.pdfUrl ? 'Replace the PDF on file (optional)' : 'Choose a PDF file'}
              </label>
              <input
                ref={fileInputRef}
                id="pdf"
                type="file"
                accept="application/pdf"
                className="sr-only"
                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
              />
              {submission?.pdfUrl && !pdfFile && (
                <a
                  href={submission.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-fit items-center gap-1.5 text-xs font-medium text-accent-500 hover:text-accent-600"
                >
                  <FileText className="size-3.5" /> View current PDF on file
                </a>
              )}
              {errors.pdf && <p className="text-xs text-danger-500">{errors.pdf}</p>}
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <Button type="submit" isLoading={isSubmitting}>
              {submission?.pdfUrl ? 'Update submission' : 'Submit'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.PARTICIPANT.MY_REGISTRATIONS)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
