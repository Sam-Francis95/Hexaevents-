import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../shared/hooks/useAuth';
import { Loader } from '../shared/components/common/Loader';
import { ROUTES } from '../shared/utils/constants';

export function ProtectedRoute({ roles: requiredRoles, children }) {
  const { isAuthenticated, isInitializing, roles } = useAuth();
  const location = useLocation();

  if (isInitializing) return <Loader fullHeight label="Loading your session…" />;

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  const hasRequiredRole = requiredRoles ? requiredRoles.some((r) => roles.includes(r)) : true;
  if (!hasRequiredRole) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return children;
}
