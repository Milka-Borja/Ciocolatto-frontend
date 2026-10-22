import React, { useState } from 'react';
import InventarioTab from '../../components/admin/InventarioTab';
import UsuariosTab from '../../components/admin/UsuariosTab';
import ReportesTab from '../../components/admin/ReportesTab';
import PrediccionTab from '../../components/admin/PrediccionTab';

export default function AdminView() {
  const [activeAdminTab, setActiveAdminTab] = useState('inventario');

  return (
    <div className="p-6 max-w-[1440px] mx-auto w-full space-y-6 font-cinzel">
    
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel Administrativo</h1>
          <p className="text-gray-500 text-sm">Gestión integral de usuarios, inventario, ventas y predicción.</p>
        </div>
        
        <div className="flex flex-wrap bg-gray-100 p-1.5 rounded-xl gap-1">
          <button 
            onClick={() => setActiveAdminTab('usuarios')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeAdminTab === 'usuarios' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-800'}`}
          >
             Usuarios
          </button>
          <button 
            onClick={() => setActiveAdminTab('inventario')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeAdminTab === 'inventario' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-800'}`}
          >
             Inventario
          </button>
          <button 
            onClick={() => setActiveAdminTab('reportes')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeAdminTab === 'reportes' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-800'}`}
          >
             Reportes y Ventas
          </button>
          <button 
            onClick={() => setActiveAdminTab('prediccion')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeAdminTab === 'prediccion' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-800'}`}
          >
             Predicción
          </button>
        </div>
      </div>

      
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-2xs">
        {activeAdminTab === 'usuarios' && <UsuariosTab />}
        {activeAdminTab === 'inventario' && <InventarioTab />}
        {activeAdminTab === 'reportes' && <ReportesTab />}
        {activeAdminTab === 'prediccion' && <PrediccionTab />}
      </div>

    </div>
  );
}