import React from 'react';

export default function CocinaHeader({
  socketConectado,
  totalActivos,
  totalPendientes,
  totalEnPreparacion,
  totalListos,
  onAbrirIncidencia,
  onAbrirDespachados,
  onAbrirStock,
  onRecargar,
}) {
  return (
    <>
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-950">Cocina</h1>
          <p className="text-xs text-gray-500">
            Comandero digital sincronizado en vivo mediante WebSockets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onAbrirIncidencia}
            className="flex items-center space-x-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 shadow-2xs cursor-pointer transition-colors"
          >
            <span>⚠️ Reportar Incidente</span>
          </button>
          <button
            onClick={onAbrirDespachados}
            className="flex items-center space-x-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-2xs cursor-pointer"
          >
            <span>Ver Despachados</span>
          </button>
          <button
            onClick={onAbrirStock}
            className="flex items-center space-x-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-2xs cursor-pointer"
          >
            <span>Disponibilidad Insumos</span>
          </button>
          <button
            onClick={onRecargar}
            className="flex items-center space-x-2 bg-[#5C4033] text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-[#4A3B32] shadow-2xs cursor-pointer transition-colors"
          >
            <span>Forzar Recarga</span>
          </button>
        </div>
      </div>

      {/* Indicador de conexión y métricas */}
      <div className="flex flex-wrap items-center gap-6 text-xs text-gray-500 bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
        <div className="flex items-center space-x-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              socketConectado ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
            }`}
          ></span>
          <span className="font-bold text-gray-800">
            {socketConectado ? 'Socket en vivo (Conectado)' : 'Desconectado'}
          </span>
        </div>
        <div>
          Tickets activos: <strong className="text-gray-900">{totalActivos}</strong>
        </div>
        <div>
          Pendientes: <strong className="text-amber-600">{totalPendientes}</strong>
        </div>
        <div>
          En preparación: <strong className="text-blue-600">{totalEnPreparacion}</strong>
        </div>
        <div>
          Listos: <strong className="text-emerald-600">{totalListos}</strong>
        </div>
      </div>
    </>
  );
}