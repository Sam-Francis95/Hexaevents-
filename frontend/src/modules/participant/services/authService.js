import usersData from '../data/users.json';
import { mockDelay, apiClient, setAuthToken, USE_MOCK } from '../../../shared/services/apiClient';
import { ok, fail } from '../../../shared/schema/ApiResponse';

const SESSION_KEY = 'smartevent_session';

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
  setAuthToken(null);
}

// ---- Mock implementations (dummy JSON, no backend required) ----

async function mockLoginUser(email, password) {
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

async function mockRegisterUser() {
  await mockDelay();
  return fail('Direct registration needs the real backend — set VITE_USE_MOCK_DATA=false.', 'MOCK_UNSUPPORTED');
}

async function mockLoginWithGoogle() {
  await mockDelay();
  return fail('Google login needs the real backend — set VITE_USE_MOCK_DATA=false.', 'MOCK_UNSUPPORTED');
}

// ---- Real implementations (calls the Flask backend) ----

async function realLoginUser(email, password) {
  try {
    const res = await apiClient.post('/auth/login', { email, password });
    setAuthToken(res.data.token);
    persistSession(res.data.user);
    return ok(res.data.user, res.message);
  } catch (err) {
    // If backend is unreachable or offline, fallback to mock login for seamless demo
    if (err.message && (err.message.includes('fetch') || err.message.includes('unexpected response') || err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
      return mockLoginUser(email, password);
    }
    return fail(err.message, err.code);
  }
}

async function realRegisterUser({ name, email, password, department, college, batch, accountType }) {
  try {
    const res = await apiClient.post('/auth/register', { name, email, password, department, college, batch, accountType });
    setAuthToken(res.data.token);
    persistSession(res.data.user);
    return ok(res.data.user, res.message);
  } catch (err) {
    return fail(err.message, err.code, err.details);
  }
}

async function realLoginWithGoogle(credential) {
  try {
    const res = await apiClient.post('/auth/google', { credential });
    setAuthToken(res.data.token);
    persistSession(res.data.user);
    return ok(res.data.user, res.message);
  } catch (err) {
    return fail(err.message, err.code);
  }
}

export const loginUser = USE_MOCK ? mockLoginUser : realLoginUser;
export const registerUser = USE_MOCK ? mockRegisterUser : realRegisterUser;
export const loginWithGoogle = USE_MOCK ? mockLoginWithGoogle : realLoginWithGoogle;
