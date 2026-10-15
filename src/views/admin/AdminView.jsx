import React, { useState } from 'react';

export default function AdminView() {
  const [activeAdminTab, setActiveAdminTab] = useState('inventario');

  const [inventory, setInventory] = useState([
    { id: 1, name: "Copa Duraznos", category: "Ice cream", stock: 25, price: 2.50, status: "Disponible" },
    { id: 2, name: "Bandeja de frutas", category: "Frutas", stock: 18, price: 2.50, status: "Disponible" },
    { id: 3, name: "Fresas con crema", category: "Frutas", stock: 8, price: 1.75, status: "Stock bajo" },
    { id: 4, name: "Capuccino", category: "Bebidas", stock: 40, price: 1.50, status: "Disponible" },
  ]);

  return (
    <div className="p-6 max-w-[1440px] mx-auto w-full space-y-6 font-cinzel">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel Administrativo</h1>
          <p className="text-gray-500 text-sm">Gestión integral de inventario, ventas y modelo predictivo de demanda.</p>
        </div>
        
        <div className="flex bg-gray-100 p-1.5 rounded-xl space-x-1">
          <button 
            onClick={() => setActiveAdminTab('inventario')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeAdminTab === 'inventario' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500'}`}
          >
             Inventario y Productos
          </button>
          <button 
            onClick={() => setActiveAdminTab('reportes')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeAdminTab === 'reportes' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500'}`}
          >
             Historial y Reportes
          </button>
          <button 
            onClick={() => setActiveAdminTab('prediccion')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeAdminTab === 'prediccion' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500'}`}
          >
             Predicción de Demanda
          </button>
        </div>
      </div>

      {activeAdminTab === 'inventario' && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-2xs space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Control y Registro de Inventario</h2>
            <button className="bg-[#5C4033] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#4A3B32] cursor-pointer">
              + Nuevo Producto
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-xs text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Producto</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Stock Actual</th>
                  <th className="py-3 px-4">Precio</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4 font-bold text-gray-900">{item.name}</td>
                    <td className="py-4 px-4 text-gray-500">{item.category}</td>
                    <td className="py-4 px-4 font-mono font-medium">{item.stock} unidades</td>
                    <td className="py-4 px-4 font-bold text-gray-900">${item.price.toFixed(2)}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        item.status === 'Disponible' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button className="text-blue-600 hover:underline text-xs font-bold cursor-pointer">Editar</button>
                      <button className="text-red-500 hover:underline text-xs font-bold cursor-pointer">Desactivar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeAdminTab === 'reportes' && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-2xs space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Historial de Ventas y Descarga de Reportes</h2>
      
          <div className="p-12 border-2 border-dashed border-gray-200 rounded-2xl text-center text-gray-400">
            
          </div>
        </div>
      )}

      {activeAdminTab === 'prediccion' && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-2xs space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Modelo de Predicción de Demanda</h2>

          <div className="p-16 border-2 border-dashed border-gray-200 rounded-2xl text-center text-gray-400">
            
          </div>
        </div>
      )}

    </div>
  );
}