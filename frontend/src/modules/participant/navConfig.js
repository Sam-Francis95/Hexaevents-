import {
  LayoutDashboard,
  CalendarSearch,
  ClipboardList,
  Calendar,
  Bell,
  Award,
  UserCircle,
} from 'lucide-react';
import { ROUTES } from '../../shared/utils/constants';

export const participantNav = [
  { label: 'Dashboard', path: ROUTES.PARTICIPANT.DASHBOARD, icon: LayoutDashboard, roles: ['participant'] },
  { label: 'Browse events', path: ROUTES.PARTICIPANT.EVENTS, icon: CalendarSearch, roles: ['participant'] },
  { label: 'My registrations', path: ROUTES.PARTICIPANT.MY_REGISTRATIONS, icon: ClipboardList, roles: ['participant'] },
  { label: 'Calendar', path: ROUTES.PARTICIPANT.CALENDAR, icon: Calendar, roles: ['participant'] },
  { label: 'Notifications', path: ROUTES.PARTICIPANT.NOTIFICATIONS, icon: Bell, roles: ['participant'] },
  { label: 'Certificates', path: ROUTES.PARTICIPANT.CERTIFICATES, icon: Award, roles: ['participant'] },
  { label: 'Profile', path: ROUTES.PARTICIPANT.PROFILE, icon: UserCircle, roles: ['participant'] },
];
