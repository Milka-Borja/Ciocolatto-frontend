import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import VentasView from './views/VentasView';
import AdminView from './views/admin/AdminView';
import CocinaView from './views/cocina/CocinaView';

import imgCono from './assets/cono.jpg';

// Navbar exclusivo para la Cajera (Ventas)
function CajeraNavbar() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-2xs sticky top-0 z-50">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-2xs border border-gray-100 flex items-center justify-center bg-gray-50">
          <img src={imgCono} alt="Ciocolatto Logo" className="w-full h-full object-cover" />
        </div>
        <span className="text-2xl tracking-wide text-[#00A3FF] font-pacifico">Ciocolatto</span>
      </div>

      <div className="flex items-center space-x-3">
        <div className="text-right">
          <p className="text-sm font-bold text-gray-900 font-montserrat">Milka Borja</p>
          <p className="text-xs text-gray-500 font-montserrat">Cajera</p>
        </div>
        <div className="bg-[#EAE4DC] text-[#4A3B32] font-semibold w-10 h-10 rounded-full flex items-center justify-center text-sm font-montserrat">
          MB
        </div>
      </div>
    </header>
  );
}

// Navbar exclusivo para el Cocinero (Cocina)
function CocinaNavbar() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-2xs sticky top-0 z-50">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-2xs border border-gray-100 flex items-center justify-center bg-gray-50">
          <img src={imgCono} alt="Ciocolatto Logo" className="w-full h-full object-cover" />
        </div>
        <span className="text-2xl tracking-wide text-[#00A3FF] font-pacifico">Ciocolatto</span>
      </div>

      <div className="flex items-center space-x-3">
        <div className="text-right">
          <p className="text-sm font-bold text-gray-900 font-montserrat">Lubswer Catagña</p>
          <p className="text-xs text-gray-500 font-montserrat">Cocinero</p>
        </div>
        <div className="bg-[#EAE4DC] text-[#4A3B32] font-semibold w-10 h-10 rounded-full flex items-center justify-center text-sm font-montserrat">
          LC
        </div>
      </div>
    </header>
  );
}

// Navbar exclusivo para el Administrador
function AdminNavbar() {
  return (
    <header className="bg-[#4A3B32] text-white px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-white/20 flex items-center justify-center bg-gray-50">
          <img src={imgCono} alt="Ciocolatto Logo" className="w-full h-full object-cover" />
        </div>
        <span className="text-2xl tracking-wide text-white font-pacifico">Ciocolatto</span>
      </div>
      <div className="text-xs text-gray-300 font-medium font-montserrat">
        Panel Administrativo · Control y Gestión Global
      </div>
    </header>
  );
}

// Selector automático del Navbar según la URL estricta
function AppNavbar() {
  const location = useLocation();
  const path = location.pathname;

  if (path.startsWith('/admin')) return <AdminNavbar />;
  if (path.startsWith('/cocina')) return <CocinaNavbar />;
  return <CajeraNavbar />; // Por defecto /ventas o /
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#FDFBF7] text-[#2D231E] flex flex-col justify-between font-montserrat">
        
        <AppNavbar />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<VentasView />} />
            <Route path="/ventas" element={<VentasView />} />
            <Route path="/cocina" element={<CocinaView />} />
            <Route path="/admin" element={<AdminView />} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-gray-200 py-3 px-6 text-center text-xs text-gray-400 font-montserrat">
          Ciocolatto 
        </footer>

      </div>
    </Router>
  );
}