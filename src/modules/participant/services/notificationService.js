import notificationsData from '../data/notifications.json';
import { mockDelay } from '../../../shared/services/apiClient';
import { ok, fail } from '../../../shared/schema/ApiResponse';

let notifications = [...notificationsData];

export async function getNotifications(userId) {
  await mockDelay();
  const mine = notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return ok(mine);
}

export async function getUnreadCount(userId) {
  await mockDelay(100);
  const count = notifications.filter((n) => n.userId === userId && !n.read).length;
  return ok(count);
}

export async function markNotificationRead(id) {
  await mockDelay(120);
  const exists = notifications.some((n) => n.id === id);
  if (!exists) return fail('Notification not found.', 'NOT_FOUND');
  notifications = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
  return ok(null);
}

export async function markAllRead(userId) {
  await mockDelay(150);
  notifications = notifications.map((n) => (n.userId === userId ? { ...n, read: true } : n));
  return ok(null, 'All notifications marked as read.');
}
