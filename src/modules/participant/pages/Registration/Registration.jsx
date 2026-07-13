import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Loader } from '../../../../shared/components/common/Loader';
import { Input } from '../../../../shared/components/common/Input';
import { Dropdown } from '../../../../shared/components/common/Dropdown';
import { Button } from '../../../../shared/components/common/Button';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { useToast } from '../../../../shared/hooks/useToast';
import { getEventById } from '../../services/eventService';
import { createRegistration, getRegistrationForEvent } from '../../services/registrationService';
import { isValidEmail, isRequired, validate } from '../../../../shared/utils/validators';
import { formatDate } from '../../../../shared/utils/formatters';
import { EXPERIENCE_OPTIONS, ROUTES } from '../../../../shared/utils/constants';

export default function Registration() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [values, setValues] = useState({
    name: user.name || '',
    employeeId: user.employeeId || '',
    email: user.email || '',
    department: user.department || '',
    experience: '',
    phone: user.phone || '',
    additionalQuestions: '',
    termsAccepted: false,
  });

  useEffect(() => {
    let cancelled = false;
    Promise.all([getEventById(id), getRegistrationForEvent(user.id, id)]).then(([eventRes, regRes]) => {
      if (cancelled) return;
      if (!eventRes.success) {
        toast.error('Event not found.');
        navigate(ROUTES.PARTICIPANT.EVENTS, { replace: true });
        return;
      }
      if (regRes.data) {
        toast.info('You are already registered for this event.');
        navigate(ROUTES.PARTICIPANT.EVENT_DETAILS(id), { replace: true });
        return;
      }
      setEvent(eventRes.data);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user.id]);

  function handleChange(field) {
    return (e) => {
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setValues((v) => ({ ...v, [field]: value }));
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const fieldErrors = validate(values, {
      name: (v) => (!isRequired(v) ? 'Name is required.' : null),
      employeeId: (v) => (!isRequired(v) ? 'Employee ID is required.' : null),
      email: (v) => (!isRequired(v) ? 'Email is required.' : !isValidEmail(v) ? 'Enter a valid email address.' : null),
      department: (v) => (!isRequired(v) ? 'Department is required.' : null),
      experience: (v) => (!isRequired(v) ? 'Please select your experience level.' : null),
      phone: (v) => (!isRequired(v) ? 'Phone number is required.' : null),
      termsAccepted: (v) => (!v ? 'You must accept the terms to continue.' : null),
    });
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setIsSubmitting(true);
    const { termsAccepted: _termsAccepted, ...formResponses } = values;
    const res = await createRegistration({ userId: user.id, eventId: id, formResponses });
    setIsSubmitting(false);

    if (!res.success) {
      toast.error(res.message);
      return;
    }
    toast.success(res.message);
    navigate(ROUTES.PARTICIPANT.MY_REGISTRATIONS);
  }

  if (isLoading) return <Loader fullHeight label="Loading registration form…" />;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 pb-10">
      <Link
        to={ROUTES.PARTICIPANT.EVENT_DETAILS(id)}
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft className="size-4" /> Back to event
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Register for event</h1>
        <p className="mt-1 text-sm text-ink-500">
          {event.title} · {formatDate(event.startDate)}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="rounded-2xl border border-border bg-surface p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Full name" value={values.name} onChange={handleChange('name')} error={errors.name} required />
          <Input label="Employee ID" value={values.employeeId} onChange={handleChange('employeeId')} error={errors.employeeId} required />
          <Input label="Email" type="email" value={values.email} onChange={handleChange('email')} error={errors.email} required />
          <Input label="Phone" value={values.phone} onChange={handleChange('phone')} error={errors.phone} required />
          <Input label="Department" value={values.department} onChange={handleChange('department')} error={errors.department} required />
          <Dropdown
            label="Experience"
            options={EXPERIENCE_OPTIONS}
            value={values.experience}
            onChange={handleChange('experience')}
            error={errors.experience}
            required
          />
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium text-ink-700" htmlFor="additionalQuestions">
            Additional questions <span className="font-normal text-ink-300">(optional)</span>
          </label>
          <textarea
            id="additionalQuestions"
            value={values.additionalQuestions}
            onChange={handleChange('additionalQuestions')}
            rows={3}
            placeholder="Anything you'd like the organizer to know?"
            className="mt-1.5 w-full resize-none rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm text-ink-900 placeholder:text-ink-300 focus-visible:ring-2 focus-visible:ring-accent-500 hover:border-ink-300"
          />
        </div>

        <label className="mt-4 flex items-start gap-2.5 text-sm text-ink-700">
          <input
            type="checkbox"
            checked={values.termsAccepted}
            onChange={handleChange('termsAccepted')}
            className="mt-0.5 size-4 rounded border-border-strong text-accent-500 focus-visible:ring-2 focus-visible:ring-accent-500"
          />
          <span>
            I agree to the event terms and confirm the information above is accurate.
            {errors.termsAccepted && <span className="mt-0.5 block text-xs text-danger-500">{errors.termsAccepted}</span>}
          </span>
        </label>

        <div className="mt-6 flex gap-2">
          <Button type="submit" isLoading={isSubmitting}>
            Submit registration
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.PARTICIPANT.EVENT_DETAILS(id))}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
