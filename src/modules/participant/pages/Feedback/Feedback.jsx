import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Loader } from '../../../../shared/components/common/Loader';
import { Button } from '../../../../shared/components/common/Button';
import { StarRating } from '../../../../shared/components/common/StarRating';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { useToast } from '../../../../shared/hooks/useToast';
import { getEventById } from '../../services/eventService';
import { getFeedbackForEvent, submitFeedback } from '../../services/feedbackService';
import { ROUTES } from '../../../../shared/utils/constants';

export default function Feedback() {
  const { eventId } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [existing, setExisting] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ratingError, setRatingError] = useState('');

  const [values, setValues] = useState({ rating: 0, comments: '', suggestions: '' });

  useEffect(() => {
    let cancelled = false;
    Promise.all([getEventById(eventId), getFeedbackForEvent(user.id, eventId)]).then(([eventRes, fbRes]) => {
      if (cancelled) return;
      setEvent(eventRes.data);
      setExisting(fbRes.data);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [eventId, user.id]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (values.rating < 1) {
      setRatingError('Please select a rating.');
      return;
    }
    setRatingError('');
    setIsSubmitting(true);
    const res = await submitFeedback({ userId: user.id, eventId, ...values });
    setIsSubmitting(false);
    if (!res.success) {
      toast.error(res.message);
      return;
    }
    toast.success(res.message);
    navigate(ROUTES.PARTICIPANT.MY_REGISTRATIONS);
  }

  if (isLoading) return <Loader fullHeight label="Loading feedback form…" />;

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 pb-10">
      <Link
        to={ROUTES.PARTICIPANT.MY_REGISTRATIONS}
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft className="size-4" /> Back to my registrations
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Share your feedback</h1>
        <p className="mt-1 text-sm text-ink-500">{event?.title}</p>
      </div>

      {existing ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-8 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-success-50 text-success-500">
            <CheckCircle2 className="size-5" />
          </span>
          <p className="text-sm font-medium text-ink-900">Feedback already submitted</p>
          <StarRating value={existing.rating} readOnly />
          {existing.comments && <p className="max-w-sm text-sm text-ink-500">"{existing.comments}"</p>}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-6">
          <div>
            <label className="text-sm font-medium text-ink-700">
              Overall rating <span className="text-danger-500">*</span>
            </label>
            <div className="mt-2">
              <StarRating value={values.rating} onChange={(rating) => setValues((v) => ({ ...v, rating }))} size="lg" />
            </div>
            {ratingError && <p className="mt-1.5 text-xs text-danger-500">{ratingError}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-ink-700" htmlFor="comments">
              Comments
            </label>
            <textarea
              id="comments"
              rows={3}
              value={values.comments}
              onChange={(e) => setValues((v) => ({ ...v, comments: e.target.value }))}
              placeholder="What worked well?"
              className="mt-1.5 w-full resize-none rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm text-ink-900 placeholder:text-ink-300 focus-visible:ring-2 focus-visible:ring-accent-500 hover:border-ink-300"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-ink-700" htmlFor="suggestions">
              Suggestions
            </label>
            <textarea
              id="suggestions"
              rows={3}
              value={values.suggestions}
              onChange={(e) => setValues((v) => ({ ...v, suggestions: e.target.value }))}
              placeholder="What could be improved?"
              className="mt-1.5 w-full resize-none rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm text-ink-900 placeholder:text-ink-300 focus-visible:ring-2 focus-visible:ring-accent-500 hover:border-ink-300"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" isLoading={isSubmitting}>
              Submit feedback
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
