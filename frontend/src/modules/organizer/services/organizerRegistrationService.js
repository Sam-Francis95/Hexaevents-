import { apiClient, USE_MOCK, mockDelay } from '../../../shared/services/apiClient';

export async function getEventRegistrations(eventId) {
  if (USE_MOCK) {
    await mockDelay();
    return { success: true, data: [] };
  }
  return apiClient.get(`/organizer/events/${eventId}/registrations`);
}

export async function updateRegistrationStatus(regId, status) {
  if (USE_MOCK) {
    await mockDelay();
    return { success: true, data: { status } };
  }
  return apiClient.put(`/organizer/registrations/${regId}/status`, { status });
}
