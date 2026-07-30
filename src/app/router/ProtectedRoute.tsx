import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/app/providers/auth-context";
import { ROUTES } from "@/constants/routes";
import { LoadingState } from "@/components/feedback/LoadingState";
import type { UserRole } from "@/types/user";

interface ProtectedRouteProps {
  allow?: UserRole[];
}

export function ProtectedRoute({ allow }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, me } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingState label="Verificando sua sessão..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />;
  }

  if (allow && me && !allow.includes(me.user.role)) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  return <Outlet />;
}
