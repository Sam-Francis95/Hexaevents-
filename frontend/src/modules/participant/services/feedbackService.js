import feedbackData from '../data/feedback.json';
import { mockDelay, apiClient, USE_MOCK } from '../../../shared/services/apiClient';
import { ok, fail } from '../../../shared/schema/ApiResponse';

let mockFeedbackEntries = [...feedbackData];

// ---- Mock implementations ----

async function mockGetFeedbackForEvent(userId, eventId) {
  await mockDelay(150);
  const entry = mockFeedbackEntries.find((f) => f.userId === userId && f.eventId === eventId);
  return ok(entry || null);
}

async function mockSubmitFeedback({ userId, eventId, rating, comments, suggestions }) {
  await mockDelay();
  if (!rating || rating < 1 || rating > 5) return fail('Please select a rating.', 'VALIDATION_ERROR');
  const entry = {
    id: `fb-${Date.now()}`,
    eventId,
    userId,
    rating,
    comments: comments || '',
    suggestions: suggestions || '',
    submittedAt: new Date().toISOString(),
  };
  mockFeedbackEntries = [...mockFeedbackEntries, entry];
  return ok(entry, 'Thanks for your feedback.');
}

async function mockGetMyFeedback(userId) {
  await mockDelay(150);
  return ok(mockFeedbackEntries.filter((f) => f.userId === userId));
}

// ---- Real implementations ----

async function realGetFeedbackForEvent(userId, eventId) {
  try {
    const res = await apiClient.get(`/feedback/${eventId}`);
    return ok(res.data);
  } catch (err) {
    if (err.message && (err.message.includes('fetch') || err.message.includes('unexpected response') || err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
      return mockGetFeedbackForEvent(userId, eventId);
    }
    return fail(err.message, err.code);
  }
}

async function realSubmitFeedback(payload) {
  try {
    const res = await apiClient.post('/feedback', payload);
    return ok(res.data, res.message);
  } catch (err) {
    if (err.message && (err.message.includes('fetch') || err.message.includes('unexpected response') || err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
      return mockSubmitFeedback(payload);
    }
    return fail(err.message, err.code);
  }
}

async function realGetMyFeedback(userId) {
  try {
    const res = await apiClient.get('/feedback');
    return ok(res.data);
  } catch (err) {
    if (err.message && (err.message.includes('fetch') || err.message.includes('unexpected response') || err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
      return mockGetMyFeedback(userId);
    }
    return fail(err.message, err.code);
  }
}

export const getFeedbackForEvent = USE_MOCK ? mockGetFeedbackForEvent : realGetFeedbackForEvent;
export const submitFeedback = USE_MOCK ? mockSubmitFeedback : realSubmitFeedback;
export const getMyFeedback = USE_MOCK ? mockGetMyFeedback : realGetMyFeedback;
