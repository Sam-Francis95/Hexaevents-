import {
  LayoutDashboard,
  Compass,
  ClipboardList,
  Users,
  Ticket,
  CalendarDays,
  Award,
  MessageSquare,
  Bell,
  UserCircle,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { ROUTES } from '../../shared/utils/constants';

export const participantNav = [
  { label: 'Dashboard', path: ROUTES.PARTICIPANT.DASHBOARD, icon: LayoutDashboard, roles: ['participant'] },
  { label: 'Explore Events', path: ROUTES.PARTICIPANT.EVENTS, icon: Compass, roles: ['participant'] },
  { label: 'My Registrations', path: ROUTES.PARTICIPANT.MY_REGISTRATIONS, icon: ClipboardList, roles: ['participant'] },
  { label: 'My Teams', path: '/participant/teams', icon: Users, roles: ['participant'] },
  { label: 'My Tickets', path: '/participant/tickets', icon: Ticket, roles: ['participant'] },
  { label: 'Calendar', path: ROUTES.PARTICIPANT.CALENDAR, icon: CalendarDays, roles: ['participant'] },
  { label: 'Certificates', path: ROUTES.PARTICIPANT.CERTIFICATES, icon: Award, roles: ['participant'] },
  { label: 'Messages', path: '/participant/messages', icon: MessageSquare, roles: ['participant'], badge: 3 },
  { label: 'Notifications', path: ROUTES.PARTICIPANT.NOTIFICATIONS, icon: Bell, roles: ['participant'], badge: 5 },
  { label: 'My Profile', path: ROUTES.PARTICIPANT.PROFILE, icon: UserCircle, roles: ['participant'] },
  { label: 'Settings', path: '/participant/settings', icon: Settings, roles: ['participant'] },
  { label: 'Help & Support', path: '/participant/help', icon: HelpCircle, roles: ['participant'] },
];
