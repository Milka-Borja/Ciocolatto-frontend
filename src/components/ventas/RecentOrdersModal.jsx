import React from 'react';
import OrderProgressBar from './OrderProgressBar';

export default function RecentOrdersModal({
  isOpen,
  onClose,
  cargandoOrdenes,
  ordenesRecientes,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-xl border border-gray-200 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Historial y Estado de Órdenes</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-lg font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[440px] overflow-y-auto space-y-3">
          {cargandoOrdenes ? (
            <p className="text-center py-6 text-gray-400 text-sm">Consultando pedidos...</p>
          ) : ordenesRecientes.length === 0 ? (
            <p className="text-center py-6 text-gray-400 text-sm">No se encontraron pedidos recientes registrados.</p>
          ) : (
            ordenesRecientes.map((ped) => (
              <div key={ped.id} className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-900">Pedido #{ped.id}</span>
                  <span className="text-gray-500 font-mono">
                    {ped.fecha_creacion
                      ? new Date(ped.fecha_creacion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : ''}
                  </span>
                </div>

                <OrderProgressBar estado={ped.estado} />

                <div className="text-xs text-gray-600">
                  {ped.lineas?.map((l) => (
                    <div key={l.id} className="flex justify-between">
                      <span>{l.cantidad}x {l.nombre_producto} {l.notas ? `(${l.notas})` : ''}</span>
                      <span className="font-mono">${Number(l.subtotal).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {ped.total_extras > 0 && (
                  <div className="text-[11px] text-amber-700 font-medium">
                    Adicionales: {ped.descripcion_extras} (+${Number(ped.total_extras).toFixed(2)})
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-xs font-bold">
                  <span className="text-gray-600">Pago: {ped.tipo_pago}</span>
                  <span className="text-[#5C4033] text-sm">${Number(ped.total).toFixed(2)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}