import React, { useState } from 'react';
import InventarioTab from '../../components/admin/InventarioTab';
import UsuariosTab from '../../components/admin/UsuariosTab';
import ReportesTab from '../../components/admin/ReportesTab';
import AnalisisTab from '../../components/admin/AnalisisTab';
import IncidenciasTab from '../../components/admin/IncidenciasTab'; 

export default function AdminView() {
  const [activeAdminTab, setActiveAdminTab] = useState('inventario');

  return (
    <div className="min-h-screen bg-gray-50 font-montserrat flex flex-col">
      
      <header className="bg-white border-b border-gray-200 px-6 py-6 md:px-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-[#003366]">Panel Administrativo</h1>
          <p className="text-[#333333] text-sm mt-1">Gestión integral de inventario, auditoría de ventas y análisis predictivo.</p>
        </div>
        
        <nav className="flex bg-[#F8F9FA] p-1.5 rounded-2xl space-x-1 overflow-x-auto border border-gray-100">
          <button 
            onClick={() => setActiveAdminTab('inventario')}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeAdminTab === 'inventario' ? 'bg-[#003366] text-white shadow-sm' : 'text-[#333333] hover:text-[#003366] hover:bg-gray-200/50'
            }`}
          >
            Inventario
          </button>
          <button 
            onClick={() => setActiveAdminTab('usuarios')}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeAdminTab === 'usuarios' ? 'bg-[#003366] text-white shadow-sm' : 'text-[#333333] hover:text-[#003366] hover:bg-gray-200/50'
            }`}
          >
            Usuarios
          </button>
          <button 
            onClick={() => setActiveAdminTab('reportes')}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeAdminTab === 'reportes' ? 'bg-[#003366] text-white shadow-sm' : 'text-[#333333] hover:text-[#003366] hover:bg-gray-200/50'
            }`}
          >
            Historial de Ventas
          </button>
          <button 
            onClick={() => setActiveAdminTab('analisis')}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeAdminTab === 'analisis' ? 'bg-[#003366] text-white shadow-sm' : 'text-[#333333] hover:text-[#003366] hover:bg-gray-200/50'
            }`}
          >
            Análisis
          </button>
          
          <button 
            onClick={() => setActiveAdminTab('incidencias')}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeAdminTab === 'incidencias' ? 'bg-[#003366] text-white shadow-sm' : 'text-[#333333] hover:text-[#003366] hover:bg-gray-200/50'
            }`}
          >
            Incidencias
          </button>
        </nav>
      </header>

      <main className="flex-1 p-6 md:p-10 max-w-[1600px] w-full mx-auto">
        <div className="bg-white border border-gray-200 rounded-[2rem] p-6 md:p-8 shadow-sm min-h-[500px]">
          {activeAdminTab === 'inventario' && <InventarioTab />}
          {activeAdminTab === 'usuarios' && <UsuariosTab />}
          {activeAdminTab === 'reportes' && <ReportesTab />}
          {activeAdminTab === 'analisis' && <AnalisisTab />}
          {activeAdminTab === 'incidencias' && <IncidenciasTab />}
        </div>
      </main>
    </div>
  );
}