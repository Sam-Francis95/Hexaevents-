import { ProtectedRoute } from '../../app/ProtectedRoute';
import { ROLES } from '../../shared/utils/constants';
import { OrganizerShell } from './components/OrganizerShell';

import OrganizerDashboard from './pages/OrganizerDashboard/OrganizerDashboard';
import OrganizerEvents from './pages/OrganizerEvents/OrganizerEvents';
import CreateEvent from './pages/CreateEvent/CreateEvent';
import EventOverview from './pages/EventOverview/EventOverview';
import Registrations from './pages/Registrations/Registrations';
import Attendees from './pages/Attendees/Attendees';
import Attendance from './pages/Attendance/Attendance';
import Communications from './pages/Communications/Communications';
import Analytics from './pages/Analytics/Analytics';
import ComingSoonPage from "../participant/pages/ComingSoon/ComingSoonPage";
import { Settings, User } from 'lucide-react';

export const organizerRoutes = [
  {
    element: (
      <ProtectedRoute roles={[ROLES.ORGANIZER]}>
        <OrganizerShell />
      </ProtectedRoute>
    ),
    children: [
      { path: '/organizer/dashboard', element: <OrganizerDashboard /> },
      { path: '/organizer/events', element: <OrganizerEvents /> },
      { path: '/organizer/events/create', element: <CreateEvent /> },
      { path: '/organizer/events/:eventId', element: <EventOverview /> },
      { path: '/organizer/events/:eventId/edit', element: <CreateEvent isEdit /> },
      { path: '/organizer/events/:eventId/registrations', element: <Registrations /> },
      { path: '/organizer/events/:eventId/attendees', element: <Attendees /> },
      { path: '/organizer/events/:eventId/attendance', element: <Attendance /> },
      { path: '/organizer/events/:eventId/communications', element: <Communications /> },
      { path: '/organizer/events/:eventId/analytics', element: <Analytics /> },
      { path: '/organizer/profile', element: <ComingSoonPage title="Profile" icon={User} description="Manage your organizer profile." /> },
      { path: '/organizer/settings', element: <ComingSoonPage title="Settings" icon={Settings} description="Manage event default settings." /> }
    ]
  }
];
