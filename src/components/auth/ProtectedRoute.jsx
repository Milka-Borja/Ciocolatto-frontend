import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';

export default function ProtectedRoute({ allowedRoles, children }) {
  const location = useLocation();
  const token = sessionStorage.getItem('token');
  const usuario = authService.getUsuarioActual();

  // 1. Si no hay token ni sesión activa, redirigir al login
  if (!token || !usuario) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Normalizamos el rol a minúsculas para evitar discrepancias
  const userRole = (usuario.rol || usuario.role || '').toLowerCase();

  // 2. Si la ruta exige roles específicos y el usuario no lo tiene, redirigir a su panel
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    if (userRole === 'admin') return <Navigate to="/admin" replace />;
    if (userRole === 'cocina') return <Navigate to="/cocina" replace />;
    return <Navigate to="/ventas" replace />;
  }

  return children;
}