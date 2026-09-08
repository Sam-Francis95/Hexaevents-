import usersData from '../data/users.json';
import { mockDelay, apiClient, USE_MOCK } from '../../../shared/services/apiClient';
import { ok, fail } from '../../../shared/schema/ApiResponse';

let mockUsers = [...usersData];

// ---- Mock implementations ----

async function mockGetUserProfile(userId) {
  await mockDelay();
  const user = mockUsers.find((u) => u.id === userId);
  if (!user) return fail('User not found.', 'NOT_FOUND');
  // eslint-disable-next-line no-unused-vars
  const { password, ...safeUser } = user;
  return ok(safeUser);
}

async function mockUpdateUserProfile(userId, updates) {
  await mockDelay();
  const exists = mockUsers.some((u) => u.id === userId);
  if (!exists) return fail('User not found.', 'NOT_FOUND');
  mockUsers = mockUsers.map((u) => (u.id === userId ? { ...u, ...updates } : u));
  // eslint-disable-next-line no-unused-vars
  const { password, ...safeUser } = mockUsers.find((u) => u.id === userId);
  return ok(safeUser, 'Profile updated.');
}

// ---- Real implementations ----

async function realGetUserProfile(userId) {
  try {
    const res = await apiClient.get('/users/me');
    return ok(res.data);
  } catch (err) {
    if (err.message && (err.message.includes('fetch') || err.message.includes('unexpected response') || err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
      return mockGetUserProfile(userId);
    }
    return fail(err.message, err.code);
  }
}

async function realUpdateUserProfile(userId, updates) {
  try {
    const res = await apiClient.patch('/users/me', updates);
    return ok(res.data, res.message);
  } catch (err) {
    if (err.message && (err.message.includes('fetch') || err.message.includes('unexpected response') || err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
      return mockUpdateUserProfile(userId, updates);
    }
    return fail(err.message, err.code);
  }
}

export const getUserProfile = USE_MOCK ? mockGetUserProfile : realGetUserProfile;
export const updateUserProfile = USE_MOCK ? mockUpdateUserProfile : realUpdateUserProfile;
