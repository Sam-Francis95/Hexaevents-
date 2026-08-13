import submissionsData from '../data/submissions.json';
import registrationsData from '../data/registrations.json';
import eventsData from '../data/events.json';
import { mockDelay, apiClient, USE_MOCK } from '../../../shared/services/apiClient';
import { ok, fail } from '../../../shared/schema/ApiResponse';
import { SUBMISSION_STATUS } from '../../../shared/utils/constants';

// In-memory mutable copy so submitting during a mock session reflects in the UI.
let mockSubmissions = [...submissionsData];

function computeStatus(submission, event) {
  const deadlinePassed = Boolean(event?.submissionDeadline) && new Date(event.submissionDeadline) < new Date();
  if (submission?.submittedAt) return SUBMISSION_STATUS.SUBMITTED;
  return deadlinePassed ? SUBMISSION_STATUS.PAST_DEADLINE : SUBMISSION_STATUS.NOT_SUBMITTED;
}

function emptySubmissionShape(registration, event) {
  return {
    id: null,
    registrationId: registration.id,
    eventId: event.id,
    userId: registration.userId,
    githubLink: null,
    driveVideoLink: null,
    pdfUrl: null,
    submittedAt: null,
    submissionDeadline: event.submissionDeadline,
    status: computeStatus(null, event),
  };
}

// ---- Mock implementations ----

async function mockGetSubmissionForRegistration(registrationId) {
  await mockDelay(150);
  const registration = registrationsData.find((r) => r.id === registrationId);
  if (!registration) return fail('Registration not found.', 'NOT_FOUND');
  const event = eventsData.find((e) => e.id === registration.eventId);

  const existing = mockSubmissions.find((s) => s.registrationId === registrationId);
  if (!existing) return ok(emptySubmissionShape(registration, event));
  return ok({ ...existing, status: computeStatus(existing, event) });
}

async function mockSubmitSubmission({ registrationId, githubLink, driveVideoLink, pdfFile }) {
  await mockDelay();
  const registration = registrationsData.find((r) => r.id === registrationId);
  if (!registration) return fail('Registration not found.', 'NOT_FOUND');
  const event = eventsData.find((e) => e.id === registration.eventId);
  if (!event?.requiresSubmission) return fail('This event does not accept submissions.', 'NOT_APPLICABLE');

  const deadlinePassed = Boolean(event.submissionDeadline) && new Date(event.submissionDeadline) < new Date();
  if (deadlinePassed) return fail('The submission deadline has passed.', 'SUBMISSION_CLOSED');

  const existing = mockSubmissions.find((s) => s.registrationId === registrationId);
  if (!pdfFile && !existing?.pdfUrl) {
    return fail('A PDF submission is required.', 'VALIDATION_ERROR');
  }

  // No real upload endpoint in mock mode -- an object URL is good enough to
  // let the demo actually open/preview the file that was just picked.
  const pdfUrl = pdfFile ? URL.createObjectURL(pdfFile) : existing?.pdfUrl || null;

  const updated = {
    id: existing?.id || `sub-${Date.now()}`,
    registrationId,
    eventId: event.id,
    userId: registration.userId,
    githubLink: githubLink || null,
    driveVideoLink: driveVideoLink || null,
    pdfUrl,
    submittedAt: new Date().toISOString(),
    submissionDeadline: event.submissionDeadline,
    status: SUBMISSION_STATUS.SUBMITTED,
  };

  mockSubmissions = existing
    ? mockSubmissions.map((s) => (s.registrationId === registrationId ? updated : s))
    : [...mockSubmissions, updated];

  return ok(updated, 'Submission saved.');
}

// ---- Real implementations ----

async function realGetSubmissionForRegistration(registrationId) {
  try {
    const res = await apiClient.get(`/submissions/registration/${registrationId}`);
    return ok(res.data);
  } catch (err) {
    return fail(err.message, err.code);
  }
}

async function realSubmitSubmission({ registrationId, githubLink, driveVideoLink, pdfFile }) {
  try {
    const formData = new FormData();
    formData.append('registrationId', registrationId);
    if (githubLink) formData.append('githubLink', githubLink);
    if (driveVideoLink) formData.append('driveVideoLink', driveVideoLink);
    if (pdfFile) formData.append('pdf', pdfFile);

    const res = await apiClient.postForm('/submissions', formData);
    return ok(res.data, res.message);
  } catch (err) {
    return fail(err.message, err.code, err.details);
  }
}

export const getSubmissionForRegistration = USE_MOCK
  ? mockGetSubmissionForRegistration
  : realGetSubmissionForRegistration;
export const submitSubmission = USE_MOCK ? mockSubmitSubmission : realSubmitSubmission;
