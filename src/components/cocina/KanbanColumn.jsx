import React from 'react';
import TicketCard from './TicketCard';

export default function KanbanColumn({
  titulo,
  colorPunto,
  tickets,
  tipo,
  cargando = false,
  mensajeVacio,
  onCambiarEstado,
}) {
  return (
    <div className="bg-[#F7F4EE] border border-gray-200/80 rounded-3xl p-5 space-y-4">
      <div className="flex justify-between items-center px-1">
        <span className="font-bold text-gray-800 text-sm flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${colorPunto}`}></span> {titulo}
        </span>
        <span className="bg-white border border-gray-200 text-gray-700 font-bold text-xs px-2.5 py-0.5 rounded-full shadow-3xs">
          {tickets.length}
        </span>
      </div>

      <div className="space-y-4">
        {cargando ? (
          <p className="text-center text-xs text-gray-400 py-6">Cargando tickets...</p>
        ) : tickets.length === 0 ? (
          <p className="text-center text-xs text-gray-400 py-6">{mensajeVacio}</p>
        ) : (
          tickets.map((ticket) => (
            <TicketCard
              key={ticket.ticket_id || ticket.id}
              ticket={ticket}
              tipo={tipo}
              onCambiarEstado={onCambiarEstado}
            />
          ))
        )}
      </div>
    </div>
  );
}