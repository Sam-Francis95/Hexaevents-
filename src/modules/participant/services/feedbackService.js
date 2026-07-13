import feedbackData from '../data/feedback.json';
import { mockDelay } from '../../../shared/services/apiClient';
import { ok, fail } from '../../../shared/schema/ApiResponse';

let feedbackEntries = [...feedbackData];

export async function getMyFeedback(userId) {
  await mockDelay(150);
  const mine = feedbackEntries.filter((f) => f.userId === userId);
  return ok(mine);
}

export async function getFeedbackForEvent(userId, eventId) {
  await mockDelay(150);
  const entry = feedbackEntries.find((f) => f.userId === userId && f.eventId === eventId);
  return ok(entry || null);
}

export async function submitFeedback({ userId, eventId, rating, comments, suggestions }) {
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
  feedbackEntries = [...feedbackEntries, entry];
  return ok(entry, 'Thanks for your feedback.');
}
