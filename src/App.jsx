import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import VentasView from './views/VentasView';
import AdminView from './views/admin/AdminView';
import CocinaView from './views/cocina/CocinaView';
import LoginView from './views/LoginView';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { authService } from './services/authService';

import imgCono from './assets/cono.jpg';

// Navbar para Ventas / Caja
function CajeraNavbar() {
  const navigate = useNavigate();
  const usuario = authService.getUsuarioActual();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-2xs sticky top-0 z-50">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-2xs border border-gray-100 flex items-center justify-center bg-gray-50">
          <img src={imgCono} alt="Ciocolatto Logo" className="w-full h-full object-cover" />
        </div>
        <span className="text-2xl tracking-wide text-[#00A3FF] font-pacifico">Ciocolatto</span>
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="text-sm font-bold text-gray-900 font-montserrat">
            {usuario?.nombre || 'Milka Borja'}
          </p>
          <p className="text-xs text-gray-500 font-montserrat">Cajera</p>
        </div>
        <div className="bg-[#EAE4DC] text-[#4A3B32] font-semibold w-10 h-10 rounded-full flex items-center justify-center text-sm font-montserrat">
          MB
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-red-500 hover:text-red-700 font-bold ml-2 cursor-pointer"
        >
          Salir
        </button>
      </div>
    </header>
  );
}

// Navbar para Cocina
function CocinaNavbar() {
  const navigate = useNavigate();
  const usuario = authService.getUsuarioActual();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-2xs sticky top-0 z-50">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-2xs border border-gray-100 flex items-center justify-center bg-gray-50">
          <img src={imgCono} alt="Ciocolatto Logo" className="w-full h-full object-cover" />
        </div>
        <span className="text-2xl tracking-wide text-[#00A3FF] font-pacifico">Ciocolatto</span>
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="text-sm font-bold text-gray-900 font-montserrat">
            {usuario?.nombre || 'Lubswer Catagña'}
          </p>
          <p className="text-xs text-gray-500 font-montserrat">Cocinero</p>
        </div>
        <div className="bg-[#EAE4DC] text-[#4A3B32] font-semibold w-10 h-10 rounded-full flex items-center justify-center text-sm font-montserrat">
          LC
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-red-500 hover:text-red-700 font-bold ml-2 cursor-pointer"
        >
          Salir
        </button>
      </div>
    </header>
  );
}

// Navbar para Administrador
function AdminNavbar() {
  const navigate = useNavigate();
  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <header className="bg-[#4A3B32] text-white px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-white/20 flex items-center justify-center bg-gray-50">
          <img src={imgCono} alt="Ciocolatto Logo" className="w-full h-full object-cover" />
        </div>
        <span className="text-2xl tracking-wide text-white font-pacifico">Ciocolatto</span>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-xs text-gray-300 font-medium font-montserrat">
          Panel Administrativo · Control Global
        </span>
        <button
          onClick={handleLogout}
          className="text-xs text-red-300 hover:text-white font-bold cursor-pointer"
        >
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
}

// Selector de Navbar
function AppNavbar() {
  const location = useLocation();
  const path = location.pathname;

  if (path === '/login') return null;
  if (path.startsWith('/admin')) return <AdminNavbar />;
  if (path.startsWith('/cocina')) return <CocinaNavbar />;
  return <CajeraNavbar />;
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#FDFBF7] text-[#2D231E] flex flex-col justify-between font-montserrat">
        <AppNavbar />

        <main className="flex-1">
          <Routes>
            {/* Ruta pública */}
            <Route path="/login" element={<LoginView />} />

            {/* Rutas Protegidas por Rol */}
            <Route
              path="/ventas"
              element={
                <ProtectedRoute allowedRoles={['caja', 'admin']}>
                  <VentasView />
                </ProtectedRoute>
              }
            />

            <Route
              path="/cocina"
              element={
                <ProtectedRoute allowedRoles={['cocina', 'admin']}>
                  <CocinaView />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminView />
                </ProtectedRoute>
              }
            />

            {/* Redirección por defecto */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-gray-200 py-3 px-6 text-center text-xs text-gray-400 font-montserrat">
          Ciocolatto System · Trabajo de Integración Curricular
        </footer>
      </div>
    </Router>
  );
}