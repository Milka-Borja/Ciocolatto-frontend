import React from 'react';

export default function TicketCard({ ticket, tipo, onCambiarEstado }) {
  const id = ticket.ticket_id || ticket.id;
  const hora = ticket.fecha_creacion
    ? new Date(ticket.fecha_creacion).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '--:--';

  const esPendiente = tipo === 'pendiente';
  const esEnPreparacion = tipo === 'en_preparacion';
  const esListo = tipo === 'listo';

  return (
    <div
      className={`bg-white border ${
        esListo ? 'border-emerald-200' : 'border-gray-200/90'
      } rounded-2xl p-5 shadow-2xs space-y-3`}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-extrabold text-gray-900">
          Ticket #{id}
          {!esListo && ticket.pedido_id && (
            <span className="text-xs text-gray-400 font-normal ml-2">
              (Pedido #{ticket.pedido_id})
            </span>
          )}
        </h3>

        {esListo ? (
          <span className="text-xs font-mono bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg">
            Listo
          </span>
        ) : (
          <span
            className={`text-xs font-mono px-2.5 py-1 rounded-lg ${
              esEnPreparacion ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            ⏱ {hora}
          </span>
        )}
      </div>

      <div className="space-y-1.5 pt-2 border-t border-gray-100 text-sm text-gray-800">
        {ticket.items?.map((item, idx) => (
          <div key={idx} className={esListo ? 'flex items-center space-x-2' : 'flex flex-col'}>
            <div className="flex items-center space-x-2">
              <span
                className={`font-bold ${
                  esListo
                    ? 'text-emerald-700'
                    : esEnPreparacion
                    ? 'text-blue-700'
                    : 'text-[#5C4033]'
                }`}
              >
                {item.cantidad} ×
              </span>
              <span className="font-medium">{item.producto || item.nombre_producto}</span>
            </div>
            {!esListo && item.notas && (
              <span className="text-[11px] text-gray-400 pl-6 italic">↳ {item.notas}</span>
            )}
          </div>
        ))}
      </div>

      {ticket.descripcion_extras && ticket.descripcion_extras !== 'Sin extras' && (
        <div className="bg-amber-50/90 border border-amber-200 p-2.5 rounded-xl text-xs space-y-0.5 text-amber-950">
          <span className="font-bold block text-[11px] uppercase tracking-wider text-amber-800">
            {esEnPreparacion ? 'Extras / Adicionales:' : 'Extras / Adicionales:'}
          </span>
          <p className="font-medium">{ticket.descripcion_extras}</p>
        </div>
      )}

      {!esListo && ticket.notas_pedido && (
        <div className="bg-gray-50 border border-gray-100 p-2.5 rounded-xl text-xs text-gray-600 flex items-center space-x-2">
          <span>📝</span>
          <span className="truncate">{ticket.notas_pedido}</span>
        </div>
      )}

      {esPendiente && (
        <button
          onClick={() => onCambiarEstado(id, 'en_preparacion')}
          className="w-full bg-[#4A3B32] hover:bg-[#382c25] text-white py-3 rounded-xl font-bold text-xs shadow-sm transition-colors cursor-pointer"
        >
          ▶ Empezar preparación
        </button>
      )}

      {esEnPreparacion && (
        <button
          onClick={() => onCambiarEstado(id, 'listo')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-xs shadow-sm transition-colors cursor-pointer"
        >
          ✓ Marcar como listo
        </button>
      )}

      {esListo && (
        <div className="p-2 text-center bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold">
          Listo para entrega en mostrador
        </div>
      )}
    </div>
  );
}