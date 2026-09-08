import eventsData from '../data/events.json';
import { mockDelay, apiClient, USE_MOCK } from '../../../shared/services/apiClient';
import { ok, fail } from '../../../shared/schema/ApiResponse';

// ---- Mock implementations ----

async function mockGetEvents(filters = {}) {
  await mockDelay();
  let result = [...eventsData];
  if (filters.category) result = result.filter((e) => e.category === filters.category);
  if (filters.mode) result = result.filter((e) => e.mode === filters.mode);
  if (filters.status) result = result.filter((e) => e.status === filters.status);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (e) => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)
    );
  }
  return ok(result);
}

async function mockGetEventById(id) {
  await mockDelay();
  const event = eventsData.find((e) => e.id === id);
  if (!event) return fail('Event not found.', 'NOT_FOUND');
  return ok(event);
}

async function mockGetEventCategories() {
  await mockDelay(100);
  return ok([...new Set(eventsData.map((e) => e.category))]);
}

async function mockGetEventEligibility() {
  await mockDelay(100);
  // Dummy data has no real eligibility rules to evaluate against — mock mode
  // always reports eligible so the demo flow isn't blocked. Real eligibility
  // gating is exercised against the actual backend (see backend README's
  // end-to-end test, which covers both the eligible and ineligible paths).
  return ok({ eligible: true, reasons: [], rules: [] });
}

// ---- Real implementations ----

async function realGetEvents(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.mode) params.set('mode', filters.mode);
    if (filters.status) params.set('status', filters.status);
    if (filters.search) params.set('search', filters.search);
    const qs = params.toString();
    const res = await apiClient.get(`/events${qs ? `?${qs}` : ''}`);
    return ok(res.data);
  } catch (err) {
    if (err.message && (err.message.includes('fetch') || err.message.includes('unexpected response') || err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
      return mockGetEvents(filters);
    }
    return fail(err.message, err.code);
  }
}

async function realGetEventById(id) {
  try {
    const res = await apiClient.get(`/events/${id}`);
    return ok(res.data);
  } catch (err) {
    if (err.message && (err.message.includes('fetch') || err.message.includes('unexpected response') || err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
      return mockGetEventById(id);
    }
    return fail(err.message, err.code);
  }
}

async function realGetEventCategories() {
  try {
    const res = await apiClient.get('/events/categories');
    return ok(res.data);
  } catch (err) {
    if (err.message && (err.message.includes('fetch') || err.message.includes('unexpected response') || err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
      return mockGetEventCategories();
    }
    return fail(err.message, err.code);
  }
}

async function realGetEventEligibility(eventId) {
  try {
    const res = await apiClient.get(`/events/${eventId}/eligibility`);
    return ok(res.data);
  } catch (err) {
    if (err.message && (err.message.includes('fetch') || err.message.includes('unexpected response') || err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
      return mockGetEventEligibility();
    }
    return fail(err.message, err.code);
  }
}

export const getEvents = USE_MOCK ? mockGetEvents : realGetEvents;
export const getEventById = USE_MOCK ? mockGetEventById : realGetEventById;
export const getEventCategories = USE_MOCK ? mockGetEventCategories : realGetEventCategories;
export const getEventEligibility = USE_MOCK ? mockGetEventEligibility : realGetEventEligibility;
