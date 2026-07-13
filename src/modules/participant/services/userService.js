import usersData from '../data/users.json';
import { mockDelay } from '../../../shared/services/apiClient';
import { ok, fail } from '../../../shared/schema/ApiResponse';

let users = [...usersData];

export async function getUserProfile(userId) {
  await mockDelay();
  const user = users.find((u) => u.id === userId);
  if (!user) return fail('User not found.', 'NOT_FOUND');
  // eslint-disable-next-line no-unused-vars
  const { password, ...safeUser } = user;
  return ok(safeUser);
}

export async function updateUserProfile(userId, updates) {
  await mockDelay();
  const exists = users.some((u) => u.id === userId);
  if (!exists) return fail('User not found.', 'NOT_FOUND');
  users = users.map((u) => (u.id === userId ? { ...u, ...updates } : u));
  // eslint-disable-next-line no-unused-vars
  const { password, ...safeUser } = users.find((u) => u.id === userId);
  return ok(safeUser, 'Profile updated.');
}
