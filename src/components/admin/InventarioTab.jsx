import React, { useState } from 'react';

export default function InventarioTab() {
  const [inventory, setInventory] = useState([
    { id: 1, name: "Copa Duraznos", category: "Ice cream", stock: 25, price: 2.50, status: "Disponible" },
    { id: 2, name: "Bandeja de frutas", category: "Frutas", stock: 18, price: 2.50, status: "Disponible" },
    { id: 3, name: "Fresas con crema", category: "Frutas", stock: 8, price: 1.75, status: "Stock bajo" },
    { id: 4, name: "Capuccino", category: "Bebidas", stock: 40, price: 1.50, status: "Disponible" },
  ]);

  return (
    <div className="space-y-4 font-montserrat">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-900">Control y Registro de Inventario</h2>
        <button className="bg-[#5C4033] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#4A3B32] cursor-pointer transition-colors">
          + Nuevo Producto
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-left border-collapse bg-white">
          <thead className="bg-gray-50">
            <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
              <th className="py-3 px-4 font-semibold">Producto</th>
              <th className="py-3 px-4 font-semibold">Categoría</th>
              <th className="py-3 px-4 font-semibold">Stock Actual</th>
              <th className="py-3 px-4 font-semibold">Precio</th>
              <th className="py-3 px-4 font-semibold">Estado</th>
              <th className="py-3 px-4 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {inventory.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4 font-bold text-gray-900">{item.name}</td>
                <td className="py-4 px-4 text-gray-500">{item.category}</td>
                <td className="py-4 px-4 font-mono font-medium text-gray-700">{item.stock} unidades</td>
                <td className="py-4 px-4 font-bold text-gray-900">${item.price.toFixed(2)}</td>
                <td className="py-4 px-4">
                  {/* Estado uniforme sin colores llamativos */}
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
                    {item.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-right space-x-3">
                  {/* Botones uniformes */}
                  <button className="text-gray-500 hover:text-gray-900 underline-offset-2 hover:underline text-xs font-bold cursor-pointer transition-colors">Editar</button>
                  <button className="text-gray-500 hover:text-gray-900 underline-offset-2 hover:underline text-xs font-bold cursor-pointer transition-colors">Desactivar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}