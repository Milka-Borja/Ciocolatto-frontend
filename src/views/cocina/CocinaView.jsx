import React, { useState } from 'react';

export default function CocinaView() {
  // Estado inicial simulando las órdenes activas en la cocina de Ciocolatto
  const [orders, setOrders] = useState([
    {
      id: "1046",
      type: "Para servirse",
      time: "04:10",
      status: "pendiente",
      items: [
        { qty: 1, name: "Copa de duraznos" },
        { qty: 1, name: "Fresas con crema" },
        { qty: 1, name: "Fresas con crema y queso" }
      ],
      note: "Fresas con crema: extra crema"
    },
    {
      id: "1047",
      type: "Para llevar",
      time: "03:24",
      status: "pendiente",
      items: [
        { qty: 2, name: "Capuccino" },
        { qty: 1, name: "Bandeja de frutas" }
      ],
      note: "Capuccino: un capuccino sin azúcar"
    },
    {
      id: "1045",
      type: "Para llevar",
      time: "07:12",
      status: "preparacion",
      urgent: true,
      items: [
        { qty: 2, name: "Café con huma" },
        { qty: 1, name: "Fresas con crema" }
      ],
      note: "1 huma de sal - 1 huma de dulce"
    },
    {
      id: "1044",
      type: "Para servirse",
      time: "05:46",
      status: "preparacion",
      items: [
        { qty: 1, name: "Copa de duraznos" },
        { qty: 1, name: "Fresas con crema y queso" },
        { qty: 2, name: "Capuccino" }
      ],
      note: ""
    },
    {
      id: "1042",
      type: "Para servirse",
      time: "08:05",
      status: "lista",
      items: [
        { qty: 1, name: "Café con huma" },
        { qty: 1, name: "Capuccino" }
      ],
      note: "Café sin azúcar"
    },
    {
      id: "1043",
      type: "Para llevar",
      time: "06:20",
      status: "lista",
      items: [
        { qty: 2, name: "Café con huma" },
        { qty: 1, name: "Copa de duraznos" }
      ],
      note: "1 huma de sal - 1 huma de sal"
    }
  ]);

  // Función para cambiar el estado de la orden 
  const handleMoveOrder = (id, nextStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: nextStatus } : o));
  };

  const pendientes = orders.filter(o => o.status === 'pendiente');
  const enPreparacion = orders.filter(o => o.status === 'preparacion');
  const listas = orders.filter(o => o.status === 'lista');

  return (
    <div className="p-8 max-w-[1550px] mx-auto w-full space-y-6 font-montserrat">
      
      {/* Cabecera del Módulo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-950">Cocina</h1>
        </div>
        <button 
          onClick={() => alert("Reporte de fuera de stock enviado al administrador.")}
          className="flex items-center space-x-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-2xs cursor-pointer"
        >
          <span>⚠️ Reportar fuera de stock / Incidente</span>
        </button>
      </div>

      {/* Barra de métricas rápidas */}
      <div className="flex flex-wrap items-center gap-6 text-xs text-gray-500 bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
        <div><strong className="text-gray-900">{orders.length}</strong> órdenes activas</div>
        <div>Avg. preparación <strong className="text-gray-900">4m 30s</strong></div>
        <div><strong className="text-gray-900">42</strong> completadas hoy</div>
      </div>

      {/* Tablero Kanban de 3 Columnas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* COLUMNA 1: Pendiente */}
        <div className="bg-[#F7F4EE] border border-gray-200/80 rounded-3xl p-5 space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span> Pendiente
            </span>
            <span className="bg-white border border-gray-200 text-gray-700 font-bold text-xs px-2.5 py-0.5 rounded-full shadow-3xs">
              {pendientes.length}
            </span>
          </div>

          <div className="space-y-4">
            {pendientes.map(order => (
              <div key={order.id} className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-extrabold text-gray-900">#{order.id}</h3>
                  <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg">
                    ⏱ {order.time}
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-medium">{order.type}</p>

                <div className="space-y-1.5 pt-2 border-t border-gray-100 text-sm text-gray-800">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <span className="font-bold">{item.qty} ×</span>
                      <span>{item.name}</span>
                    </div>
                  ))}
                </div>

                {order.note && (
                  <div className="bg-gray-50 border border-gray-100 p-2.5 rounded-xl text-xs text-gray-600 flex items-center space-x-2">
                    <span>📄</span>
                    <span className="truncate">{order.note}</span>
                  </div>
                )}

                <button 
                  onClick={() => handleMoveOrder(order.id, 'preparacion')}
                  className="w-full bg-[#4A3B32] hover:bg-[#382c25] text-white py-3 rounded-xl font-bold text-xs shadow-sm transition-colors cursor-pointer"
                >
                  ▶ Empezar preparación
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMNA 2: En preparación */}
        <div className="bg-[#F7F4EE] border border-gray-200/80 rounded-3xl p-5 space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> En preparación
            </span>
            <span className="bg-white border border-gray-200 text-gray-700 font-bold text-xs px-2.5 py-0.5 rounded-full shadow-3xs">
              {enPreparacion.length}
            </span>
          </div>

          <div className="space-y-4">
            {enPreparacion.map(order => (
              <div key={order.id} className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-extrabold text-gray-900">#{order.id}</h3>
                  <span className="text-xs font-mono bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg">
                    ⏱ {order.time}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-400 font-medium">{order.type}</p>
                  {order.urgent && <span className="text-[10px] text-red-500 font-bold">Más de 7 min</span>}
                </div>

                <div className="space-y-1.5 pt-2 border-t border-gray-100 text-sm text-gray-800">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <span className="font-bold">{item.qty} ×</span>
                      <span>{item.name}</span>
                    </div>
                  ))}
                </div>

                {order.note && (
                  <div className="bg-gray-50 border border-gray-100 p-2.5 rounded-xl text-xs text-gray-600 flex items-center space-x-2">
                    <span>📄</span>
                    <span className="truncate">{order.note}</span>
                  </div>
                )}

                <button 
                  onClick={() => handleMoveOrder(order.id, 'lista')}
                  className="w-full bg-[#4A3B32] hover:bg-[#382c25] text-white py-3 rounded-xl font-bold text-xs shadow-sm transition-colors cursor-pointer"
                >
                  ✓ Marcar como lista
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMNA 3: Lista */}
        <div className="bg-[#F7F4EE] border border-gray-200/80 rounded-3xl p-5 space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Lista
            </span>
            <span className="bg-white border border-gray-200 text-gray-700 font-bold text-xs px-2.5 py-0.5 rounded-full shadow-3xs">
              {listas.length}
            </span>
          </div>

          <div className="space-y-4">
            {listas.map(order => (
              <div key={order.id} className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-extrabold text-gray-900">#{order.id}</h3>
                  <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg">
                    ⏱ {order.time}
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-medium">{order.type}</p>

                <div className="space-y-1.5 pt-2 border-t border-gray-100 text-sm text-gray-800">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <span className="font-bold">{item.qty} ×</span>
                      <span>{item.name}</span>
                    </div>
                  ))}
                </div>

                {order.note && (
                  <div className="bg-gray-50 border border-gray-100 p-2.5 rounded-xl text-xs text-gray-600 flex items-center space-x-2">
                    <span>📄</span>
                    <span className="truncate">{order.note}</span>
                  </div>
                )}

                <button 
                  onClick={() => alert(`Orden #${order.id} entregada/completada.`)}
                  className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 py-3 rounded-xl font-bold text-xs shadow-3xs transition-colors cursor-pointer"
                >
                  ✓ Orden completa
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}