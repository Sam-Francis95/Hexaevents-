import { ProtectedRoute } from '../../app/ProtectedRoute';
import { ROUTES, ROLES } from '../../shared/utils/constants';
import { ParticipantShell } from './components/ParticipantShell';
import { Users, Ticket, MessageSquare, Settings, HelpCircle } from 'lucide-react';

import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import BrowseEvents from './pages/BrowseEvents/BrowseEvents';
import EventDetails from './pages/EventDetails/EventDetails';
import Registration from './pages/Registration/Registration';
import Submission from './pages/Submission/Submission';
import MyRegistrations from './pages/MyRegistrations/MyRegistrations';
import CalendarView from './pages/Calendar/Calendar';
import Notifications from './pages/Notifications/Notifications';
import Certificates from './pages/Certificates/Certificates';
import Feedback from './pages/Feedback/Feedback';
import Profile from './pages/Profile/Profile';
import ComingSoonPage from './pages/ComingSoon/ComingSoonPage';
import Tickets from './pages/Tickets/Tickets';
import Achievements from './pages/Achievements/Achievements';

// Public route (no shell, no guard)
export const participantPublicRoutes = [{ path: ROUTES.LOGIN, element: <Login /> }];

// Guarded routes render inside AppShell via nested <Outlet />
export const participantRoutes = [
  {
    element: (
      <ProtectedRoute roles={[ROLES.PARTICIPANT]}>
        <ParticipantShell />
      </ProtectedRoute>
    ),
    children: [
      { path: ROUTES.PARTICIPANT.DASHBOARD, element: <Dashboard /> },
      { path: ROUTES.PARTICIPANT.EVENTS, element: <BrowseEvents /> },
      { path: ROUTES.PARTICIPANT.EVENT_DETAILS(), element: <EventDetails /> },
      { path: ROUTES.PARTICIPANT.REGISTER(), element: <Registration /> },
      { path: ROUTES.PARTICIPANT.SUBMISSION(), element: <Submission /> },
      { path: ROUTES.PARTICIPANT.MY_REGISTRATIONS, element: <MyRegistrations /> },
      { path: ROUTES.PARTICIPANT.CALENDAR, element: <CalendarView /> },
      { path: ROUTES.PARTICIPANT.NOTIFICATIONS, element: <Notifications /> },
      { path: ROUTES.PARTICIPANT.CERTIFICATES, element: <Certificates /> },
      { path: ROUTES.PARTICIPANT.FEEDBACK(), element: <Feedback /> },
      { path: ROUTES.PARTICIPANT.PROFILE, element: <Profile /> },
      { path: '/participant/achievements', element: <Achievements /> },
      // New nav item routes — feature pages coming in next sprint
      {
        path: '/participant/teams',
        element: (
          <ComingSoonPage
            icon={Users}
            title="My Teams"
            description="Create and manage your competition teams. Invite members and compete together."
          />
        ),
      },
      {
        path: '/participant/tickets',
        element: <Tickets />,
      },
      {
        path: '/participant/messages',
        element: (
          <ComingSoonPage
            icon={MessageSquare}
            title="Messages"
            description="Chat with teammates, organizers and other participants."
          />
        ),
      },
      {
        path: '/participant/settings',
        element: (
          <ComingSoonPage
            icon={Settings}
            title="Settings"
            description="Manage your account preferences, notifications and privacy settings."
          />
        ),
      },
      {
        path: '/participant/help',
        element: (
          <ComingSoonPage
            icon={HelpCircle}
            title="Help & Support"
            description="Get help from our support team or browse the knowledge base."
          />
        ),
      },
    ],
  },
];
