import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { ADMIN_BASE_PATH } from '../config';

interface AdminRouteGuardProps {
  children: React.ReactNode;
  requireAdminRole?: boolean;
}

export const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({
  children,
  requireAdminRole = false,
}) => {
  const { user, token, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center text-xs text-gray-500">
        Vérification des droits d'accès...
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to={`${ADMIN_BASE_PATH}/login`} state={{ from: location }} replace />;
  }

  if (requireAdminRole && !isAdmin) {
    return (
      <div className="p-8 text-center text-xs text-red-600 bg-red-50 rounded-lg max-w-md mx-auto mt-12 border border-red-200">
        Accès restreint. Ce module nécessite les privilèges d'administrateur principal.
      </div>
    );
  }

  return <>{children}</>;
};
