import { useRoutes, Navigate } from 'react-router-dom';
import { participantPublicRoutes, participantRoutes } from '../modules/participant/routes';
import { organizerRoutes } from '../modules/organizer/routes';
import { adminRoutes } from '../modules/admin/routes';
import { ROUTES } from '../shared/utils/constants';
import Unauthorized from '../shared/pages/Unauthorized';
import NotFound from '../shared/pages/NotFound';

// Composition point for per-module route arrays. Each dev adds one import + one spread line.
export function AppRoutes() {
  const routes = useRoutes([
    { path: '/', element: <Navigate to={ROUTES.LOGIN} replace /> },
    ...participantPublicRoutes,
    ...participantRoutes,
    ...organizerRoutes,
    ...adminRoutes,
    { path: ROUTES.UNAUTHORIZED, element: <Unauthorized /> },
    { path: '*', element: <NotFound /> },
  ]);

  return routes;
}
