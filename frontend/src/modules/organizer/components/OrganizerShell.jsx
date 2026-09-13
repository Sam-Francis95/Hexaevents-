import { matchPath, useLocation } from 'react-router-dom';
import { AppShell } from '../../../shared/components/layout/AppShell';

export function OrganizerShell() {
  const { pathname } = useLocation();

  // Very basic title mapping for organizer
  const titles = [
    { path: '/organizer/dashboard', title: 'Dashboard' },
    { path: '/organizer/events', title: 'My Events' },
    { path: '/organizer/events/create', title: 'Create Event' },
    { path: '/organizer/events/:eventId', title: 'Event Overview' },
    { path: '/organizer/events/:eventId/edit', title: 'Edit Event' },
    { path: '/organizer/events/:eventId/registrations', title: 'Registrations' },
    { path: '/organizer/events/:eventId/attendees', title: 'Attendees' },
    { path: '/organizer/events/:eventId/attendance', title: 'Attendance' },
    { path: '/organizer/events/:eventId/communications', title: 'Communications' },
    { path: '/organizer/events/:eventId/analytics', title: 'Analytics' },
    { path: '/organizer/profile', title: 'Profile' },
    { path: '/organizer/settings', title: 'Settings' }
  ];

  const title = titles.find((entry) => matchPath(entry.path, pathname))?.title;

  return (
    <AppShell unreadCount={0} title={title} />
  );
}
