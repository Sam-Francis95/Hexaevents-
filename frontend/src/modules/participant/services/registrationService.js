import registrationsData from '../data/registrations.json';
import eventsData from '../data/events.json';
import { mockDelay, apiClient, USE_MOCK } from '../../../shared/services/apiClient';
import { ok, fail } from '../../../shared/schema/ApiResponse';
import { REGISTRATION_STATUS } from '../../../shared/utils/constants';

// In-memory mutable copy so registering during a mock session reflects in the UI.
let mockRegistrations = [...registrationsData];

// ---- Mock implementations ----

async function mockGetMyRegistrations(userId) {
  await mockDelay();
  const mine = mockRegistrations
    .filter((r) => r.userId === userId)
    .map((r) => ({ ...r, event: eventsData.find((e) => e.id === r.eventId) || null }));
  return ok(mine);
}

async function mockGetRegistrationForEvent(userId, eventId) {
  await mockDelay(150);
  const reg = mockRegistrations.find((r) => r.userId === userId && r.eventId === eventId);
  return ok(reg || null);
}

async function mockCreateRegistration({ userId, eventId, formResponses, teamMembers }) {
  await mockDelay();
  const event = eventsData.find((e) => e.id === eventId);
  if (!event) return fail('Event not found.', 'NOT_FOUND');

  const already = mockRegistrations.find((r) => r.userId === userId && r.eventId === eventId);
  if (already) return fail('You are already registered for this event.', 'ALREADY_REGISTERED');

  let cleanedTeamMembers = [];
  if (event.requiresSubmission) {
    cleanedTeamMembers = teamMembers || [];
    const { min = 0, max = min } = event.teamSizeLimit || {};
    if (cleanedTeamMembers.length < min || cleanedTeamMembers.length > max) {
      return fail(
        `This event requires between ${min} and ${max} additional team members (you listed ${cleanedTeamMembers.length}).`,
        'TEAM_SIZE_INVALID'
      );
    }
  }

  const isFull = event.registeredCount >= event.capacity;
  const registration = {
    id: `reg-${Date.now()}`,
    eventId,
    userId,
    formResponses: formResponses || {},
    teamMembers: cleanedTeamMembers,
    status: isFull ? REGISTRATION_STATUS.WAITLISTED : REGISTRATION_STATUS.REGISTERED,
    attended: false,
    registeredAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockRegistrations = [...mockRegistrations, registration];
  return ok(registration, isFull ? 'Added to the waitlist.' : 'Registration submitted.');
}

async function mockGetRegistrationById(registrationId) {
  await mockDelay(150);
  const reg = mockRegistrations.find((r) => r.id === registrationId);
  if (!reg) return fail('Registration not found.', 'NOT_FOUND');
  return ok({ ...reg, event: eventsData.find((e) => e.id === reg.eventId) || null });
}

async function mockCancelRegistration(registrationId) {
  await mockDelay();
  const exists = mockRegistrations.some((r) => r.id === registrationId);
  if (!exists) return fail('Registration not found.', 'NOT_FOUND');
  mockRegistrations = mockRegistrations.filter((r) => r.id !== registrationId);
  return ok(null, 'Registration cancelled.');
}

// ---- Real implementations ----

async function realGetMyRegistrations(userId) {
  try {
    const res = await apiClient.get('/registrations');
    return ok(res.data);
  } catch (err) {
    if (err.message && (err.message.includes('fetch') || err.message.includes('unexpected response') || err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
      return mockGetMyRegistrations(userId);
    }
    return fail(err.message, err.code);
  }
}

async function realGetRegistrationForEvent(userId, eventId) {
  try {
    const res = await apiClient.get(`/registrations/event/${eventId}`);
    return ok(res.data);
  } catch (err) {
    if (err.message && (err.message.includes('fetch') || err.message.includes('unexpected response') || err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
      return mockGetRegistrationForEvent(userId, eventId);
    }
    return fail(err.message, err.code);
  }
}

async function realCreateRegistration(payload) {
  try {
    const res = await apiClient.post('/registrations', payload);
    return ok(res.data, res.message);
  } catch (err) {
    if (err.message && (err.message.includes('fetch') || err.message.includes('unexpected response') || err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
      return mockCreateRegistration(payload);
    }
    return fail(err.message, err.code, err.details);
  }
}

async function realGetRegistrationById(registrationId) {
  try {
    const res = await apiClient.get(`/registrations/${registrationId}`);
    return ok(res.data);
  } catch (err) {
    if (err.message && (err.message.includes('fetch') || err.message.includes('unexpected response') || err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
      return mockGetRegistrationById(registrationId);
    }
    return fail(err.message, err.code);
  }
}

async function realCancelRegistration(registrationId) {
  try {
    await apiClient.delete(`/registrations/${registrationId}`);
    return ok(null, 'Registration cancelled.');
  } catch (err) {
    if (err.message && (err.message.includes('fetch') || err.message.includes('unexpected response') || err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
      return mockCancelRegistration(registrationId);
    }
    return fail(err.message, err.code);
  }
}

export const getMyRegistrations = USE_MOCK ? mockGetMyRegistrations : realGetMyRegistrations;
export const getRegistrationForEvent = USE_MOCK ? mockGetRegistrationForEvent : realGetRegistrationForEvent;
export const getRegistrationById = USE_MOCK ? mockGetRegistrationById : realGetRegistrationById;
export const createRegistration = USE_MOCK ? mockCreateRegistration : realCreateRegistration;
export const cancelRegistration = USE_MOCK ? mockCancelRegistration : realCancelRegistration;
