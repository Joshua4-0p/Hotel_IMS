import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, type AdminRole } from '../context/AuthContext';

interface Props {
  children: React.ReactNode;
  /** Restrict to specific roles; if omitted any admin can access */
  roles?: AdminRole[];
}

export function ProtectedAdminRoute({ children, roles }: Props) {
  const { isAdmin, user } = useAuth();
  const location          = useLocation();

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && user?.role && !roles.includes(user.role)) {
    // Authenticated admin but wrong role → go to admin home
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
