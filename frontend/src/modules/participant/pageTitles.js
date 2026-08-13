import { ROUTES } from '../../shared/utils/constants';

// Ordered most-specific-first so matchPath checks nested routes before their parents.
export const PARTICIPANT_PAGE_TITLES = [
  { path: ROUTES.PARTICIPANT.REGISTER(), title: 'Register' },
  { path: ROUTES.PARTICIPANT.EVENT_DETAILS(), title: 'Event Details' },
  { path: ROUTES.PARTICIPANT.EVENTS, title: 'Browse Events' },
  { path: ROUTES.PARTICIPANT.DASHBOARD, title: 'Dashboard' },
  { path: ROUTES.PARTICIPANT.SUBMISSION(), title: 'Hackathon Submission' },
  { path: ROUTES.PARTICIPANT.MY_REGISTRATIONS, title: 'My Registrations' },
  { path: ROUTES.PARTICIPANT.CALENDAR, title: 'Calendar' },
  { path: ROUTES.PARTICIPANT.NOTIFICATIONS, title: 'Notifications' },
  { path: ROUTES.PARTICIPANT.CERTIFICATES, title: 'Certificates' },
  { path: ROUTES.PARTICIPANT.FEEDBACK(), title: 'Feedback' },
  { path: ROUTES.PARTICIPANT.PROFILE, title: 'Profile' },
];
