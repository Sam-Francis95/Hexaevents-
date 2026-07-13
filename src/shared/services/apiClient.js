import { MOCK_DELAY_MS } from '../utils/constants';

const USE_MOCK = true; // maps to VITE_USE_MOCK_DATA once .env is wired up
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export function mockDelay(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let authToken = null;

export function setAuthToken(token) {
  authToken = token;
}

/**
 * Thin fetch wrapper matching the ADR-frozen response envelope.
 * Swaps to real Flask endpoints once USE_MOCK is false — no caller changes needed.
 */
async function request(path, { method = 'GET', body, headers = {} } = {}) {
  if (USE_MOCK) {
    throw new Error(
      `apiClient.request() called for "${path}" while USE_MOCK is true. Module services should read from local dummy data instead.`
    );
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    const error = new Error(json.message || 'Request failed');
    error.code = json.error?.code;
    error.details = json.error?.details;
    error.status = res.status;
    throw error;
  }
  return json;
}

export const apiClient = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  delete: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
};
