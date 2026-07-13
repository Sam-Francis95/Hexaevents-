import usersData from '../data/users.json';
import { mockDelay } from '../../../shared/services/apiClient';
import { ok, fail } from '../../../shared/schema/ApiResponse';

const SESSION_KEY = 'smartevent_session'; // mock-only; replaced by httpOnly JWT cookie in Phase 2

/** @returns {Promise<{success:boolean,data:import('../../../shared/schema/User').User|null,message:string,error:any}>} */
export async function loginUser(email, password) {
  await mockDelay();
  const match = usersData.find(
    (u) => u.email.toLowerCase() === String(email).toLowerCase() && u.password === password
  );
  if (!match) return fail('Invalid email or password.', 'INVALID_CREDENTIALS');

  // eslint-disable-next-line no-unused-vars
  const { password: _pw, ...safeUser } = match;
  persistSession(safeUser);
  return ok(safeUser, 'Logged in successfully.');
}

export function persistSession(user) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function getStoredSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearStoredSession() {
  sessionStorage.removeItem(SESSION_KEY);
}
