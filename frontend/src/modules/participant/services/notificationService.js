import notificationsData from '../data/notifications.json';
import { mockDelay, apiClient, USE_MOCK } from '../../../shared/services/apiClient';
import { ok, fail } from '../../../shared/schema/ApiResponse';

let mockNotifications = [...notificationsData];

// ---- Mock implementations ----

async function mockGetNotifications() {
  await mockDelay();
  const sorted = [...mockNotifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return ok(sorted);
}

async function mockGetUnreadCount() {
  await mockDelay(100);
  return ok(mockNotifications.filter((n) => !n.read).length);
}

async function mockMarkNotificationRead(id) {
  await mockDelay(120);
  const exists = mockNotifications.some((n) => n.id === id);
  if (!exists) return fail('Notification not found.', 'NOT_FOUND');
  mockNotifications = mockNotifications.map((n) => (n.id === id ? { ...n, read: true } : n));
  return ok(null);
}

async function mockMarkAllRead() {
  await mockDelay(150);
  mockNotifications = mockNotifications.map((n) => ({ ...n, read: true }));
  return ok(null, 'All notifications marked as read.');
}

// ---- Real implementations ----

function normalize(n) {
  // Backend uses isRead; existing UI reads `read`. Normalize at the edge so
  // no component needs to know which source it came from.
  return { ...n, read: n.isRead };
}

async function realGetNotifications() {
  try {
    const res = await apiClient.get('/notifications');
    return ok(res.data.map(normalize));
  } catch (err) {
    return fail(err.message, err.code);
  }
}

async function realGetUnreadCount() {
  try {
    const res = await apiClient.get('/notifications/unread-count');
    return ok(res.data);
  } catch (err) {
    return fail(err.message, err.code);
  }
}

async function realMarkNotificationRead(id) {
  try {
    await apiClient.patch(`/notifications/${id}/read`);
    return ok(null);
  } catch (err) {
    return fail(err.message, err.code);
  }
}

async function realMarkAllRead() {
  try {
    await apiClient.patch('/notifications/mark-all-read');
    return ok(null, 'All notifications marked as read.');
  } catch (err) {
    return fail(err.message, err.code);
  }
}

export const getNotifications = USE_MOCK ? mockGetNotifications : realGetNotifications;
export const getUnreadCount = USE_MOCK ? mockGetUnreadCount : realGetUnreadCount;
export const markNotificationRead = USE_MOCK ? mockMarkNotificationRead : realMarkNotificationRead;
export const markAllRead = USE_MOCK ? mockMarkAllRead : realMarkAllRead;
