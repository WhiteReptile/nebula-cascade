import { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useGlobalAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: ReactElement;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, isAdmin, isLoading } = useGlobalAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050510] text-white flex items-center justify-center font-mono">
        <div className="text-center text-sm text-white/70">Checking access...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
