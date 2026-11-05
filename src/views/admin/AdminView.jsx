import React, { useState } from 'react';
import InventarioTab from '../../components/admin/InventarioTab';
import UsuariosTab from '../../components/admin/UsuariosTab';

export default function AdminView() {
  const [activeAdminTab, setActiveAdminTab] = useState('inventario');

  return (
    <div className="p-6 max-w-[1440px] mx-auto w-full space-y-6 font-montserrat">
      {/* Encabezado del Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel Administrativo</h1>
        </div>
        
        {/* Pestañas de navegación interna */}
        <div className="flex bg-gray-100 p-1.5 rounded-xl space-x-1 overflow-x-auto">
          <button 
            onClick={() => setActiveAdminTab('inventario')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeAdminTab === 'inventario' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Inventario y Productos
          </button>
          <button 
            onClick={() => setActiveAdminTab('usuarios')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeAdminTab === 'usuarios' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Usuarios y Roles
          </button>
          <button 
            onClick={() => setActiveAdminTab('reportes')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeAdminTab === 'reportes' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Historial y Reportes
          </button>
          <button 
            onClick={() => setActiveAdminTab('prediccion')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeAdminTab === 'prediccion' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Predicción de Demanda
          </button>
        </div>
      </div>

      {/* Renderizado dinámico del tab activo */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-2xs">
        {activeAdminTab === 'inventario' && <InventarioTab />}
        {activeAdminTab === 'usuarios' && <UsuariosTab />}
        {activeAdminTab === 'reportes' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Historial de Ventas y Descarga de Reportes</h2>
            <p className="text-gray-500 text-sm">Consulte las transacciones pasadas y descargue los reportes de ventas consolidados.</p>
            
          </div>
        )}
        {activeAdminTab === 'prediccion' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Modelo de Predicción de Demanda</h2>
            <p className="text-gray-500 text-sm">Visualización gráfica del comportamiento futuro estimado de los productos basado en el histórico de ventas.</p>
          </div>
        )}
      </div>
    </div>
  );
}