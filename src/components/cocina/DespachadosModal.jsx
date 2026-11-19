import React from 'react';

export default function DespachadosModal({
  isOpen,
  onClose,
  cargando,
  ticketsDespachados,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-xl border border-gray-200 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Historial de Tickets Despachados</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-lg font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[400px] overflow-y-auto space-y-3">
          {cargando ? (
            <p className="text-center py-6 text-gray-400 text-sm">Consultando despachados...</p>
          ) : ticketsDespachados.length === 0 ? (
            <p className="text-center py-6 text-gray-400 text-sm">No hay tickets despachados.</p>
          ) : (
            ticketsDespachados.map((t) => (
              <div
                key={t.ticket_id || t.id}
                className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2 text-xs"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">
                    Ticket #{t.ticket_id || t.id} (Pedido #{t.pedido_id})
                  </span>
                  <span className="text-gray-500 font-mono">
                    {t.fecha_actualizacion
                      ? new Date(t.fecha_actualizacion).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : ''}
                  </span>
                </div>

                <div className="text-gray-700 space-y-1">
                  {t.items?.map((it, idx) => (
                    <div key={idx}>
                      • {it.cantidad}x {it.producto || it.nombre_producto}{' '}
                      {it.notas ? `(${it.notas})` : ''}
                    </div>
                  ))}
                </div>

                {t.descripcion_extras && (
                  <div className="text-amber-800 font-medium">
                    Extras: {t.descripcion_extras}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}