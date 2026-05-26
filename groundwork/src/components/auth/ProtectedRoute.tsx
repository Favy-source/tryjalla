import { Navigate, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Guards authenticated routes.
 *
 * - Shows a spinner while auth state is initialising (prevents flash of redirect).
 * - Redirects unauthenticated users to /auth/login, preserving the intended URL
 *   in location.state.from so login can redirect back after sign-in.
 */
export function ProtectedRoute({
  children,
  redirectTo = "/auth/login",
}: ProtectedRouteProps) {
  const { user, loading, initialized } = useAuth();
  const location = useLocation();

  // Still resolving session — show a subtle spinner, never redirect yet
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-light-grey">
        <div className="w-8 h-8 border-2 border-brand-mid-grey border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // No session — redirect preserving the attempted URL
  if (!user) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  return <>{children}</>;
}
