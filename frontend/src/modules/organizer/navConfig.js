import { LayoutDashboard, CalendarDays, PlusCircle, Settings, User } from 'lucide-react';
import { ROLES } from '../../shared/utils/constants';

export const organizerNav = [
  { label: 'Dashboard', path: '/organizer/dashboard', icon: LayoutDashboard, roles: [ROLES.ORGANIZER] },
  { label: 'My Events', path: '/organizer/events', icon: CalendarDays, roles: [ROLES.ORGANIZER] },
  { label: 'Create Event', path: '/organizer/events/create', icon: PlusCircle, roles: [ROLES.ORGANIZER] },
  { label: 'Profile', path: '/organizer/profile', icon: User, roles: [ROLES.ORGANIZER] },
  { label: 'Settings', path: '/organizer/settings', icon: Settings, roles: [ROLES.ORGANIZER] }
];
