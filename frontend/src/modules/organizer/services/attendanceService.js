import { apiClient, USE_MOCK, mockDelay } from '../../../shared/services/apiClient';

export async function getEventAttendance(eventId) {
  if (USE_MOCK) {
    await mockDelay();
    return { success: true, data: { attendees: [] } };
  }
  return apiClient.get(`/organizer/events/${eventId}/attendance`);
}

export async function checkInAttendee(eventId, participantId) {
  if (USE_MOCK) {
    await mockDelay();
    return { success: true, data: null };
  }
  return apiClient.post(`/organizer/events/${eventId}/attendance/check-in`, { participantId });
}
