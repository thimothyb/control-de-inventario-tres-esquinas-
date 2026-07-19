import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      if (isAdmin() && !adminOnly && ['/', '/dashboard', '/shop'].includes(location.pathname)) {
        navigate('/admin/dashboard', { replace: true });
      }
      if (!isAdmin() && adminOnly) {
        navigate('/shop', { replace: true });
      }
    }
  }, [user, loading, isAdmin, location.pathname, adminOnly, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

export default ProtectedRoute;
