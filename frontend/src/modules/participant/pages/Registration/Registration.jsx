import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Users, CheckCircle2 } from 'lucide-react';
import { Loader } from '../../../../shared/components/common/Loader';
import { Input } from '../../../../shared/components/common/Input';
import { Dropdown } from '../../../../shared/components/common/Dropdown';
import { Button } from '../../../../shared/components/common/Button';
import { Avatar } from '../../../../shared/components/common/Avatar';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { useToast } from '../../../../shared/hooks/useToast';
import { getEventById } from '../../services/eventService';
import { createRegistration, getRegistrationForEvent } from '../../services/registrationService';
import { isValidEmail, isRequired, validate } from '../../../../shared/utils/validators';
import { formatDate } from '../../../../shared/utils/formatters';
import { EXPERIENCE_OPTIONS, DEPARTMENT_OPTIONS, ROUTES } from '../../../../shared/utils/constants';

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

  // Drives the Department Dropdown/"Other" split. values.department stays
  // the single source of truth for the submit payload either way — this is
  // just presentation state (Part H.3).
  const [departmentChoice, setDepartmentChoice] = useState(() => {
    const initial = user.department || '';
    const isKnown = DEPARTMENT_OPTIONS.some((o) => o.value === initial);
    return isKnown ? initial : initial ? 'Other' : '';
  });

  // Brief success-burst moment before navigating away on submit (Part H.3).
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  // Only populated/relevant when the event's requiresSubmission is true --
  // these are teammates *in addition to* the person registering above, and
  // teamSizeLimit is validated against this array's length.
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamError, setTeamError] = useState('');

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
      if (eventRes.data.requiresSubmission) {
        const min = eventRes.data.teamSizeLimit?.min || 0;
        setTeamMembers(Array.from({ length: min }, () => ({ name: '', email: '' })));
      }
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

  function handleDepartmentSelect(e) {
    const val = e.target.value;
    setDepartmentChoice(val);
    // Keep values.department (the actual payload field) in sync: a known
    // department is the value itself; "Other" clears it so the follow-up
    // text input starts blank rather than carrying over a stale value.
    setValues((v) => ({ ...v, department: val === 'Other' ? '' : val }));
  }

  function updateTeamMember(index, field, value) {
    setTeamMembers((rows) => rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  function addTeamMember() {
    const max = event.teamSizeLimit?.max ?? Infinity;
    if (teamMembers.length >= max) return;
    setTeamMembers((rows) => [...rows, { name: '', email: '' }]);
  }

  function removeTeamMember(index) {
    const min = event.teamSizeLimit?.min || 0;
    if (teamMembers.length <= min) return;
    setTeamMembers((rows) => rows.filter((_, i) => i !== index));
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

    let teamValidationError = '';
    if (event.requiresSubmission) {
      const { min = 0, max = min } = event.teamSizeLimit || {};
      if (teamMembers.length < min || teamMembers.length > max) {
        teamValidationError = `This event needs between ${min} and ${max} additional team members (you have ${teamMembers.length}).`;
      } else if (teamMembers.some((m) => !isRequired(m.name) || !isValidEmail(m.email))) {
        teamValidationError = 'Every team member needs a name and a valid email address.';
      }
    }
    setTeamError(teamValidationError);

    if (Object.keys(fieldErrors).length > 0 || teamValidationError) return;

    setIsSubmitting(true);
    const { termsAccepted: _termsAccepted, ...formResponses } = values;
    const res = await createRegistration({
      userId: user.id,
      eventId: id,
      formResponses,
      teamMembers: event.requiresSubmission ? teamMembers : undefined,
    });
    setIsSubmitting(false);

    if (!res.success) {
      toast.error(res.message);
      return;
    }
    toast.success(res.message);
    setShowSuccessOverlay(true);
    // Let the badge-unlock burst play before leaving the page (Part H.3).
    setTimeout(() => navigate(ROUTES.PARTICIPANT.MY_REGISTRATIONS), 650);
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

      <form onSubmit={handleSubmit} noValidate className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6">
        <div className="flex flex-col gap-4">
          <div>
            <Dropdown
              label="Department"
              options={DEPARTMENT_OPTIONS}
              value={departmentChoice}
              onChange={handleDepartmentSelect}
              error={departmentChoice === 'Other' ? undefined : errors.department}
              required
              containerClassName="[&_label]:text-base [&_label]:font-semibold"
            />
            {departmentChoice === 'Other' && (
              <Input
                placeholder="Enter your department"
                value={values.department}
                onChange={handleChange('department')}
                error={errors.department}
                required
                containerClassName="mt-2"
                aria-label="Department (other)"
              />
            )}
          </div>
          <Dropdown
            label="Experience"
            options={EXPERIENCE_OPTIONS}
            value={values.experience}
            onChange={handleChange('experience')}
            error={errors.experience}
            required
            containerClassName="[&_label]:text-base [&_label]:font-semibold"
          />
        </div>

        <div className="mt-5 rounded-xl bg-canvas p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-500">Your details</h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="Full name" value={values.name} onChange={handleChange('name')} error={errors.name} required />
            <Input label="Employee ID" value={values.employeeId} onChange={handleChange('employeeId')} error={errors.employeeId} required />
            <Input label="Email" type="email" value={values.email} onChange={handleChange('email')} error={errors.email} required />
            <Input label="Phone" value={values.phone} onChange={handleChange('phone')} error={errors.phone} required />
          </div>
        </div>

        {event.requiresSubmission && (
          <div className="mt-6 rounded-xl border border-border bg-canvas p-4">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-accent-500" />
              <h2 className="text-sm font-semibold text-ink-900">Team members</h2>
            </div>
            <p className="mt-1 text-xs text-ink-500">
              This is a Hackathon event — list your teammates below (in addition to yourself).
              {event.teamSizeLimit && (
                <>
                  {' '}
                  Requires {event.teamSizeLimit.min}–{event.teamSizeLimit.max} additional team members.
                </>
              )}
            </p>

            <div className="mt-3 flex flex-col gap-3">
              {teamMembers.map((member, index) => (
                <div key={index} className="flex flex-col gap-2 sm:flex-row sm:items-start">
                  <Avatar name={member.name} size="sm" className="mt-1 shrink-0" />
                  <Input
                    containerClassName="flex-1"
                    placeholder="e.g. Kane Williamson"
                    value={member.name}
                    onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                    aria-label={`Team member ${index + 1} name`}
                  />
                  <Input
                    containerClassName="flex-1"
                    type="email"
                    placeholder="e.g. kane.williamson@example.com"
                    value={member.email}
                    onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                    aria-label={`Team member ${index + 1} email`}
                  />
                  <button
                    type="button"
                    onClick={() => removeTeamMember(index)}
                    disabled={teamMembers.length <= (event.teamSizeLimit?.min || 0)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border-strong text-ink-500 hover:border-danger-500 hover:text-danger-500 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={`Remove team member ${index + 1}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addTeamMember}
              disabled={teamMembers.length >= (event.teamSizeLimit?.max ?? Infinity)}
              className="mt-3 flex items-center gap-1.5 text-sm font-medium text-accent-500 hover:text-accent-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="size-4" /> Add team member
            </button>

            {teamError && <p className="mt-3 text-xs text-danger-500">{teamError}</p>}
          </div>
        )}

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

        {showSuccessOverlay && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-surface/95">
            <span className="flex size-16 items-center justify-center rounded-full bg-success-500 text-white animate-badge-unlock">
              <CheckCircle2 className="size-8" />
            </span>
            <p className="text-base font-semibold text-ink-900">Registration confirmed!</p>
          </div>
        )}
      </form>
    </div>
  );
}
