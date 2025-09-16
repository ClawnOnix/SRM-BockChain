import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string | string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    return <Navigate to="/" replace />;
  }
  const user = JSON.parse(userStr);
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  if (!roles.includes(user.Rol)) {
    // Redirect to user's own dashboard
    if (user.Rol === 'medico') return <Navigate to="/dashboard" replace />;
    if (user.Rol === 'paciente') return <Navigate to="/patient-dashboard" replace />;
    if (user.Rol === 'farmacia') return <Navigate to="/pharmacy-dashboard" replace />;
    if (user.Rol === 'regulador') return <Navigate to="/regulator-dashboard" replace />;
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
