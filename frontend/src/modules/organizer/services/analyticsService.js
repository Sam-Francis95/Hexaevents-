import { apiClient, USE_MOCK, mockDelay } from '../../../shared/services/apiClient';

export async function getEventAnalytics(eventId) {
  if (USE_MOCK) {
    await mockDelay();
    return { 
      success: true, 
      data: {
        registrations: { total: 0, approved: 0, pending: 0, waitlisted: 0, rejected: 0 },
        attendance: { expected: 0, checkedIn: 0, rate: 0 },
        submissions: { total: 0, rate: 0 }
      } 
    };
  }
  return apiClient.get(`/organizer/events/${eventId}/analytics`);
}
