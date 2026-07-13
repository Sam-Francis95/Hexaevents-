// Composition point for per-module nav configs. Each dev adds one import + one spread line.
import { participantNav } from '../modules/participant/navConfig';
import { organizerNav } from '../modules/organizer/navConfig';
import { adminNav } from '../modules/admin/navConfig';

export const allNavItems = [...participantNav, ...organizerNav, ...adminNav];

export function getNavForRole(role) {
  return allNavItems.filter((item) => item.roles.includes(role));
}
