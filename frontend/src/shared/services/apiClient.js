import { MOCK_DELAY_MS } from '../utils/constants';

// Default to the real backend now that it exists. Flip VITE_USE_MOCK_DATA=true
// in .env to fall back to dummy JSON (e.g. for an offline demo with no backend running).
export const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const TOKEN_STORAGE_KEY = 'smartevent_token'; // mock-session used a different key; real JWT lives here

export function mockDelay(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function setAuthToken(token) {
  if (token) {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export function getAuthToken() {
  return sessionStorage.getItem(TOKEN_STORAGE_KEY);
}

/**
 * Thin fetch wrapper matching the ADR-frozen response envelope. Every
 * module service branches on USE_MOCK at import time — when false, this is
 * the only thing that ever talks to the network.
 */
async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const token = getAuthToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let json;
  try {
    json = await res.json();
  } catch {
    throw new Error('The server returned an unexpected response.');
  }

  if (!res.ok || !json.success) {
    const error = new Error(json.message || 'Request failed');
    error.code = json.error?.code;
    error.details = json.error?.details;
    error.status = res.status;
    throw error;
  }
  return json;
}

/**
 * Same envelope handling as request(), but for multipart/form-data (i.e. the
 * PDF upload on hackathon submissions). Deliberately does NOT set
 * Content-Type -- the browser sets it (including the multipart boundary)
 * automatically when the body is a FormData instance, and setting it by hand
 * breaks the upload.
 */
async function requestForm(path, formData) {
  const token = getAuthToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  let json;
  try {
    json = await res.json();
  } catch {
    throw new Error('The server returned an unexpected response.');
  }

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
  postForm: (path, formData) => requestForm(path, formData),
};
