import { apiClient } from '../../../shared/services/apiClient';
import { ok, fail } from '../../../shared/schema/ApiResponse';

/**
 * Fetches the participant's reputation summary (XP, level, recent transactions).
 */
export async function getMyReputation() {
  try {
    const res = await apiClient.get('/reputation/me');
    return ok(res.data);
  } catch (err) {
    return fail(err.message || 'Failed to fetch reputation', err.code);
  }
}

/**
 * Fetches the full list of achievements (locked, in-progress, unlocked) for the participant.
 */
export async function getMyAchievements() {
  try {
    const res = await apiClient.get('/reputation/me/achievements');
    return ok(res.data);
  } catch (err) {
    return fail(err.message || 'Failed to fetch achievements', err.code);
  }
}

/**
 * Manual trigger for XP (usually backend triggered, but available for demo).
 */
export async function awardXP(sourceType, sourceId, amount, description) {
  try {
    const res = await apiClient.post('/reputation/me/award-xp', {
      sourceType,
      sourceId,
      amount,
      description
    });
    return ok(res.data, res.message);
  } catch (err) {
    return fail(err.message || 'Failed to award XP', err.code);
  }
}
