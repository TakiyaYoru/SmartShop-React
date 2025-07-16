// src/components/auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  requiredRole = null,
  fallback = null 
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Redirect to login with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is authenticated but shouldn't be (e.g., login page)
  if (!requireAuth && isAuthenticated) {
    // Redirect based on user role
    const redirectPath = user?.role === 'admin' || user?.role === 'manager' 
      ? '/admin' 
      : '/';
    return <Navigate to={redirectPath} replace />;
  }

  // Check role-based access
  if (requireAuth && requiredRole) {
    if (Array.isArray(requiredRole)) {
      // Multiple roles allowed
      if (!requiredRole.includes(user?.role)) {
        return fallback || (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Không có quyền truy cập
              </h1>
              <p className="text-gray-600 mb-6">
                Bạn không có quyền truy cập vào trang này.
              </p>
              <button
                onClick={() => window.history.back()}
                className="btn btn-primary"
              >
                Quay lại
              </button>
            </div>
          </div>
        );
      }
    } else {
      // Single role required
      if (user?.role !== requiredRole) {
        return fallback || (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Không có quyền truy cập
              </h1>
              <p className="text-gray-600 mb-6">
                Trang này yêu cầu quyền {requiredRole}.
              </p>
              <button
                onClick={() => window.history.back()}
                className="btn btn-primary"
              >
                Quay lại
              </button>
            </div>
          </div>
        );
      }
    }
  }

  // All checks passed, render children
  return children;
};

// Convenience components for different access levels
export const AdminRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRole="admin" {...props}>
    {children}
  </ProtectedRoute>
);

export const ManagerRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRole={['admin', 'manager']} {...props}>
    {children}
  </ProtectedRoute>
);

export const CustomerRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRole="customer" {...props}>
    {children}
  </ProtectedRoute>
);

export const GuestRoute = ({ children, ...props }) => (
  <ProtectedRoute requireAuth={false} {...props}>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;