import React from 'react';
import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import AcademicLoader from '../components/common/AcademicLoader';

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <AcademicLoader message="Verifying authentication..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
