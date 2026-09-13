import { apiClient, USE_MOCK, mockDelay } from '../../../shared/services/apiClient';

export async function getManagedEvents() {
  if (USE_MOCK) {
    await mockDelay();
    return { success: true, data: [] }; // Mocks omitted for brevity
  }
  return apiClient.get('/organizer/events');
}

export async function getManagedEvent(id) {
  if (USE_MOCK) {
    await mockDelay();
    return { success: true, data: null };
  }
  return apiClient.get(`/organizer/events/${id}`);
}

export async function createEvent(data) {
  if (USE_MOCK) {
    await mockDelay();
    return { success: true, data: { ...data, _id: 'mock-id' } };
  }
  return apiClient.post('/organizer/events', data);
}

export async function updateEvent(id, data) {
  if (USE_MOCK) {
    await mockDelay();
    return { success: true, data: { ...data, _id: id } };
  }
  // We used PUT in the backend
  // Oh wait, apiClient has patch and get and post and delete but not put. Let's add put if missing, or use patch?
  // I will check if backend used put. I used @organizer_bp.put. 
  // Wait, I should add 'put' to apiClient or just use fetch? Let me add 'put' to apiClient!
  return apiClient.put(`/organizer/events/${id}`, data);
}
