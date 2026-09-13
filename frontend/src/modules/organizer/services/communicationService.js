import { apiClient, USE_MOCK, mockDelay } from '../../../shared/services/apiClient';

export async function sendAnnouncement(eventId, payload) {
  if (USE_MOCK) {
    await mockDelay();
    return { success: true, data: { sentCount: 10 } };
  }
  return apiClient.post(`/organizer/events/${eventId}/announcements`, payload);
}
