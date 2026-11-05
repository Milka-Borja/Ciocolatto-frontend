import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { ticketService } from '../../services/ticketService';
import { productoService } from '../../services/productoService';

// Detecta automáticamente la URL del backend sin quemar dominios en duro
const socketHost =
  (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '') || window.location.origin;

export default function CocinaView() {
  const [tickets, setTickets] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [socketConectado, setSocketConectado] = useState(false);

  // Referencia para reutilizar la misma instancia del socket en las acciones
  const socketRef = useRef(null);

  // Modales
  const [modalDespachadosOpen, setModalDespachadosOpen] = useState(false);
  const [ticketsDespachados, setTicketsDespachados] = useState([]);
  const [cargandoDespachados, setCargandoDespachados] = useState(false);

  const [modalStockOpen, setModalStockOpen] = useState(false);
  const [productos, setProductos] = useState([]);
  const [cargandoStock, setCargandoStock] = useState(false);

  // 1. Cargar tickets activos iniciales vía HTTP REST
  const cargarTicketsActivos = async () => {
    try {
      const data = await ticketService.obtenerTicketsActivos();
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar tickets activos en cocina:', err);
    } finally {
      setCargando(false);
    }
  };

  // 2. Conexión WebSocket con handshake por polling primero (Evita el fallo en Azure)
  useEffect(() => {
    cargarTicketsActivos();

    const token = sessionStorage.getItem('token') 

    const socket = io(socketHost, {
      auth: { token },
      transports: ['polling', 'websocket'], // Polling primero para conectar con éxito en Azure
      upgrade: true,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketConectado(true);
      console.log('WebSocket conectado exitosamente en Cocina con ID:', socket.id);
    });

    socket.on('disconnect', () => {
      setSocketConectado(false);
      console.warn('WebSocket desconectado en Cocina');
    });

    socket.on('connect_error', (err) => {
      setSocketConectado(false);
      console.warn('Fallo de conexión Socket en Cocina:', err.message);
    });

    // Evento A: Entra un nuevo pedido confirmado desde Caja
    socket.on('ticket_nuevo', (nuevoTicket) => {
      console.log('[Cocina] Nuevo ticket recibido:', nuevoTicket);
      setTickets((prev) => {
        const idNuevo = Number(nuevoTicket.ticket_id || nuevoTicket.id);
        const yaExiste = prev.some((t) => Number(t.ticket_id || t.id) === idNuevo);
        if (yaExiste) return prev;
        return [...prev, nuevoTicket];
      });
    });

    // Evento B: Actualización de estado en tiempo real
    socket.on('ticket_actualizado', (data) => {
      console.log('[Cocina] Ticket actualizado recibido:', data);
      const idTarget = Number(data.ticket_id || data.id);
      const nuevoEstado = (data.estado || data.nuevoEstado || '').toLowerCase().trim();

      setTickets((prev) =>
        prev.map((t) =>
          Number(t.ticket_id || t.id) === idTarget ? { ...t, estado: nuevoEstado } : t
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // 3. Transición de estado manual (PATCH /api/tickets/:id/estado)
  const handleCambiarEstado = async (ticketId, nuevoEstado) => {
    const ticketIdNum = Number(ticketId);

    // Actualización visual optimista inmediata en Cocina
    setTickets((prev) =>
      prev.map((t) =>
        Number(t.ticket_id || t.id) === ticketIdNum ? { ...t, estado: nuevoEstado } : t
      )
    );

    // Encontrar el pedido_id asociado para notificárselo a Caja
    const ticketActual = tickets.find((t) => Number(t.ticket_id || t.id) === ticketIdNum);
    const pedidoId = ticketActual?.pedido_id || ticketIdNum;

    // Emisión por socket para que la Caja reciba el cambio al instante
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('ticket_actualizado', {
        ticket_id: ticketIdNum,
        pedido_id: Number(pedidoId),
        estado: nuevoEstado,
        nuevoEstado: nuevoEstado,
      });
    }

    try {
      await ticketService.cambiarEstado(ticketIdNum, nuevoEstado);
    } catch (err) {
      console.error('Error al actualizar estado en el servidor:', err);
      alert('No se pudo actualizar el estado de la comanda en el servidor.');
    }
  };

  // 4. Modal de tickets despachados
  const handleAbrirDespachados = async () => {
    setModalDespachadosOpen(true);
    setCargandoDespachados(true);
    try {
      const data = await ticketService.obtenerTicketsDespachados();
      setTicketsDespachados(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar tickets despachados:', err);
    } finally {
      setCargandoDespachados(false);
    }
  };

  // 5. Modal de disponibilidad rápida de insumos
  const handleAbrirModalStock = async () => {
    setModalStockOpen(true);
    setCargandoStock(true);
    try {
      const data = await productoService.obtenerTodos();
      setProductos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar catálogo en cocina:', err);
    } finally {
      setCargandoStock(false);
    }
  };

  const handleToggleDisponibilidad = async (prod) => {
    const nuevoEstado = !prod.disponible;
    try {
      await productoService.cambiarDisponibilidad(prod.id, nuevoEstado);
      setProductos((prev) =>
        prev.map((p) => (p.id === prod.id ? { ...p, disponible: nuevoEstado } : p))
      );
    } catch (err) {
      alert('Error al actualizar disponibilidad.');
      console.error(err);
    }
  };

  // Clasificación por columnas
  const pendientes = tickets.filter(
    (t) => t.estado === 'pendiente' || !t.estado
  );
  const enPreparacion = tickets.filter(
    (t) => t.estado === 'en_preparacion' || t.estado === 'en preparación'
  );
  const listos = tickets.filter((t) => t.estado === 'listo');

  return (
    <div className="p-8 max-w-[1550px] mx-auto w-full space-y-6 font-montserrat">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-950">Cocina</h1>
          <p className="text-xs text-gray-500">
            Comandero digital sincronizado en vivo mediante WebSockets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAbrirDespachados}
            className="flex items-center space-x-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-2xs cursor-pointer"
          >
            <span>Ver Despachados</span>
          </button>
          <button
            onClick={handleAbrirModalStock}
            className="flex items-center space-x-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-2xs cursor-pointer"
          >
            <span>Disponibilidad Insumos</span>
          </button>
          <button
            onClick={cargarTicketsActivos}
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
          Tickets activos: <strong className="text-gray-900">{tickets.length}</strong>
        </div>
        <div>
          Pendientes: <strong className="text-amber-600">{pendientes.length}</strong>
        </div>
        <div>
          En preparación: <strong className="text-blue-600">{enPreparacion.length}</strong>
        </div>
        <div>
          Listos: <strong className="text-emerald-600">{listos.length}</strong>
        </div>
      </div>

      {/* Tablero Kanban */}
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
            {cargando ? (
              <p className="text-center text-xs text-gray-400 py-6">Cargando tickets...</p>
            ) : pendientes.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-6">No hay tickets pendientes.</p>
            ) : (
              pendientes.map((ticket) => {
                const id = ticket.ticket_id || ticket.id;
                const hora = ticket.fecha_creacion
                  ? new Date(ticket.fecha_creacion).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '--:--';

                return (
                  <div
                    key={id}
                    className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-2xs space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-extrabold text-gray-900">
                        Ticket #{id}
                        {ticket.pedido_id && (
                          <span className="text-xs text-gray-400 font-normal ml-2">
                            (Pedido #{ticket.pedido_id})
                          </span>
                        )}
                      </h3>
                      <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg">
                        ⏱ {hora}
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-gray-100 text-sm text-gray-800">
                      {ticket.items?.map((item, idx) => (
                        <div key={idx} className="flex flex-col">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-[#5C4033]">{item.cantidad} ×</span>
                            <span className="font-medium">
                              {item.producto || item.nombre_producto}
                            </span>
                          </div>
                          {item.notas && (
                            <span className="text-[11px] text-gray-400 pl-6 italic">
                              ↳ {item.notas}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {ticket.descripcion_extras && ticket.descripcion_extras !== 'Sin extras' && (
                      <div className="bg-amber-50/90 border border-amber-200 p-2.5 rounded-xl text-xs space-y-0.5 text-amber-950">
                        <span className="font-bold block text-[11px] uppercase tracking-wider text-amber-800">
                           Extras / Adicionales:
                        </span>
                        <p className="font-medium">{ticket.descripcion_extras}</p>
                      </div>
                    )}

                    {ticket.notas_pedido && (
                      <div className="bg-gray-50 border border-gray-100 p-2.5 rounded-xl text-xs text-gray-600 flex items-center space-x-2">
                        <span>📝</span>
                        <span className="truncate">{ticket.notas_pedido}</span>
                      </div>
                    )}

                    <button
                      onClick={() => handleCambiarEstado(id, 'en_preparacion')}
                      className="w-full bg-[#4A3B32] hover:bg-[#382c25] text-white py-3 rounded-xl font-bold text-xs shadow-sm transition-colors cursor-pointer"
                    >
                      ▶ Empezar preparación
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMNA 2: En Preparación */}
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
            {enPreparacion.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-6">No hay tickets en preparación.</p>
            ) : (
              enPreparacion.map((ticket) => {
                const id = ticket.ticket_id || ticket.id;
                const hora = ticket.fecha_creacion
                  ? new Date(ticket.fecha_creacion).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '--:--';

                return (
                  <div
                    key={id}
                    className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-2xs space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-extrabold text-gray-900">
                        Ticket #{id}
                        {ticket.pedido_id && (
                          <span className="text-xs text-gray-400 font-normal ml-2">
                            (Pedido #{ticket.pedido_id})
                          </span>
                        )}
                      </h3>
                      <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg">
                        ⏱ {hora}
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-gray-100 text-sm text-gray-800">
                      {ticket.items?.map((item, idx) => (
                        <div key={idx} className="flex flex-col">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-blue-700">{item.cantidad} ×</span>
                            <span className="font-medium">
                              {item.producto || item.nombre_producto}
                            </span>
                          </div>
                          {item.notas && (
                            <span className="text-[11px] text-gray-400 pl-6 italic">
                              ↳ {item.notas}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {ticket.descripcion_extras && ticket.descripcion_extras !== 'Sin extras' && (
                      <div className="bg-amber-50/90 border border-amber-200 p-2.5 rounded-xl text-xs space-y-0.5 text-amber-950">
                        <span className="font-bold block text-[11px] uppercase tracking-wider text-amber-800">
                          ✨ Extras / Adicionales:
                        </span>
                        <p className="font-medium">{ticket.descripcion_extras}</p>
                      </div>
                    )}

                    {ticket.notas_pedido && (
                      <div className="bg-gray-50 border border-gray-100 p-2.5 rounded-xl text-xs text-gray-600 flex items-center space-x-2">
                        <span>📝</span>
                        <span className="truncate">{ticket.notas_pedido}</span>
                      </div>
                    )}

                    <button
                      onClick={() => handleCambiarEstado(id, 'listo')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-xs shadow-sm transition-colors cursor-pointer"
                    >
                      ✓ Marcar como listo
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMNA 3: Listo */}
        <div className="bg-[#F7F4EE] border border-gray-200/80 rounded-3xl p-5 space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Listo
            </span>
            <span className="bg-white border border-gray-200 text-gray-700 font-bold text-xs px-2.5 py-0.5 rounded-full shadow-3xs">
              {listos.length}
            </span>
          </div>

          <div className="space-y-4">
            {listos.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-6">No hay comandas terminadas.</p>
            ) : (
              listos.map((ticket) => {
                const id = ticket.ticket_id || ticket.id;

                return (
                  <div
                    key={id}
                    className="bg-white border border-emerald-200 rounded-2xl p-5 shadow-2xs space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-extrabold text-gray-900">Ticket #{id}</h3>
                      <span className="text-xs font-mono bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg">
                        Listo
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-gray-100 text-sm text-gray-800">
                      {ticket.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <span className="font-bold text-emerald-700">{item.cantidad} ×</span>
                          <span className="font-medium">
                            {item.producto || item.nombre_producto}
                          </span>
                        </div>
                      ))}
                    </div>

                    {ticket.descripcion_extras && ticket.descripcion_extras !== 'Sin extras' && (
                      <div className="bg-amber-50/90 border border-amber-200 p-2.5 rounded-xl text-xs space-y-0.5 text-amber-950">
                        <span className="font-bold block text-[11px] uppercase tracking-wider text-amber-800">
                          Extras / Adicionales:
                        </span>
                        <p className="font-medium">{ticket.descripcion_extras}</p>
                      </div>
                    )}

                    <div className="p-2 text-center bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold">
                      Listo para entrega en mostrador
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Modal Despachados */}
      {modalDespachadosOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-xl border border-gray-200 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Historial de Tickets Despachados</h3>
              <button
                onClick={() => setModalDespachadosOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto space-y-3">
              {cargandoDespachados ? (
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
      )}

      {/* Modal Disponibilidad Rápida */}
      {modalStockOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl border border-gray-200 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Disponibilidad Rápida en Cocina</h3>
              <button
                onClick={() => setModalStockOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Marca los productos sin insumos para deshabilitarlos al instante en el catálogo de caja.
            </p>

            <div className="max-h-[350px] overflow-y-auto space-y-2">
              {cargandoStock ? (
                <p className="text-center text-xs text-gray-400 py-4">Cargando productos...</p>
              ) : (
                productos.map((prod) => (
                  <div
                    key={prod.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">{prod.nombre}</h4>
                      <span className="text-[11px] text-gray-400">Stock: {prod.stock} u.</span>
                    </div>

                    <button
                      onClick={() => handleToggleDisponibilidad(prod)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        prod.disponible
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                      }`}
                    >
                      ● {prod.disponible ? 'Disponible' : 'Agotado'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}