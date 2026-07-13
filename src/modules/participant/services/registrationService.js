import registrationsData from '../data/registrations.json';
import eventsData from '../data/events.json';
import { mockDelay } from '../../../shared/services/apiClient';
import { ok, fail } from '../../../shared/schema/ApiResponse';
import { REGISTRATION_STATUS } from '../../../shared/utils/constants';

// In-memory mutable copy so registering during a session reflects in the UI.
let registrations = [...registrationsData];

export async function getMyRegistrations(userId) {
  await mockDelay();
  const mine = registrations
    .filter((r) => r.userId === userId)
    .map((r) => ({ ...r, event: eventsData.find((e) => e.id === r.eventId) || null }));
  return ok(mine);
}

export async function getRegistrationForEvent(userId, eventId) {
  await mockDelay(150);
  const reg = registrations.find((r) => r.userId === userId && r.eventId === eventId);
  return ok(reg || null);
}

export async function createRegistration({ userId, eventId, formResponses }) {
  await mockDelay();
  const event = eventsData.find((e) => e.id === eventId);
  if (!event) return fail('Event not found.', 'NOT_FOUND');

  const already = registrations.find((r) => r.userId === userId && r.eventId === eventId);
  if (already) return fail('You are already registered for this event.', 'ALREADY_REGISTERED');

  const isFull = event.registeredCount >= event.capacity;
  const registration = {
    id: `reg-${Date.now()}`,
    eventId,
    userId,
    formResponses: formResponses || {},
    status: isFull ? REGISTRATION_STATUS.WAITLISTED : REGISTRATION_STATUS.REGISTERED,
    attended: false,
    registeredAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  registrations = [...registrations, registration];
  return ok(registration, isFull ? 'Added to the waitlist.' : 'Registration submitted.');
}

export async function cancelRegistration(registrationId) {
  await mockDelay();
  const exists = registrations.some((r) => r.id === registrationId);
  if (!exists) return fail('Registration not found.', 'NOT_FOUND');
  registrations = registrations.filter((r) => r.id !== registrationId);
  return ok(null, 'Registration cancelled.');
}
