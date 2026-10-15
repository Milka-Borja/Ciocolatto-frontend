import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import VentasView from './views/VentasView';
import AdminView from './views/admin/AdminView';

// Navbar exclusivo para la Cajera con tipografía Pacifico
function CajeraNavbar() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-2xs sticky top-0 z-50">
      <div className="flex items-center space-x-3">
        <div className="bg-[#00A3FF] p-2 rounded-xl text-white font-bold text-xl">🍦</div>
        <span className="text-2xl tracking-wide text-[#00A3FF] font-pacifico">Ciocolatto</span>
      </div>

      <div className="flex items-center space-x-3">
        <div className="text-right">
          <p className="text-sm font-bold text-gray-900">Milka Borja</p>
          <p className="text-xs text-gray-500">Cajera</p>
        </div>
        <div className="bg-[#EAE4DC] text-[#4A3B32] font-semibold w-10 h-10 rounded-full flex items-center justify-center text-sm">
          MB
        </div>
      </div>
    </header>
  );
}

// Navbar exclusivo para el Administrador con tipografía Pacifico
function AdminNavbar() {
  return (
    <header className="bg-[#4A3B32] text-white px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
      <div className="flex items-center space-x-3">
        <div className="bg-[#00A3FF] p-2 rounded-xl text-white font-bold text-xl">🍦</div>
        <span className="text-2xl tracking-wide text-white font-pacifico">Ciocolatto</span>
      </div>
      <div className="text-xs text-gray-300 font-medium">
        Panel Administrativo · Control y Gestión Global
      </div>
    </header>
  );
}

// Selector de Navbar según la ruta activa
function AppNavbar() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return isAdmin ? <AdminNavbar /> : <CajeraNavbar />;
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#FDFBF7] text-[#2D231E] flex flex-col justify-between font-sans">
        
        <AppNavbar />

        {/* Contenido de las vistas */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<VentasView />} />
            <Route path="/ventas" element={<VentasView />} />
            <Route path="/admin" element={<AdminView />} />
            <Route path="/cocina" element={
              <div className="p-16 text-center space-y-3">
                <h2 className="text-2xl font-bold text-gray-900">Módulo de Cocina</h2>
                
              </div>
            } />
          </Routes>
        </main>

        <footer className="bg-white border-t border-gray-200 py-3 px-6 text-center text-xs text-gray-400">
          Ciocolatto 
        </footer>

      </div>
    </Router>
  );
}