import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { ticketService } from '../../services/ticketService';
import { productoService } from '../../services/productoService';
import { incidenciaService } from '../../services/incidenciaService';

import CocinaHeader from '../../components/cocina/CocinaHeader';
import KanbanColumn from '../../components/cocina/KanbanColumn';
import DespachadosModal from '../../components/cocina/DespachadosModal';
import StockModal from '../../components/cocina/StockModal';
import IncidenciaModal from '../../components/cocina/IncidenciaModal';

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

  // Estados para Modal de Incidencias
  const [modalIncidenciaOpen, setModalIncidenciaOpen] = useState(false);
  const [descripcionIncidencia, setDescripcionIncidencia] = useState('');
  const [enviandoIncidencia, setEnviandoIncidencia] = useState(false);

  // Estados para Alertas Personalizadas (Ventana flotante centrada)
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });

  // Función para mostrar la alerta flotante
  const showToast = (message, type = 'success') => {
    setToast({ open: true, message, type });
    setTimeout(() => setToast({ open: false, message: '', type: 'success' }), 4000);
  };

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

  // 2. Conexión WebSocket con handshake por polling primero
  useEffect(() => {
    cargarTicketsActivos();

    const token = sessionStorage.getItem('token') || localStorage.getItem('token');

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
      showToast('No se pudo actualizar el estado de la comanda en el servidor.', 'error');
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
      console.error(err);
      showToast('Error al actualizar disponibilidad.', 'error');
    }
  };

  // 6. Reportar Incidencia
  const handleReportarIncidencia = async () => {
    if (!descripcionIncidencia.trim()) {
      showToast('Por favor, describe la incidencia antes de enviar.', 'warning');
      return;
    }

    setEnviandoIncidencia(true);
    try {
      await incidenciaService.reportar(descripcionIncidencia);
      showToast('Incidencia reportada correctamente al administrador.', 'success');
      setDescripcionIncidencia('');
      setModalIncidenciaOpen(false);
    } catch (error) {
      console.error('Error al reportar incidencia:', error);
      showToast('Hubo un error al enviar el reporte.', 'error');
    } finally {
      setEnviandoIncidencia(false);
    }
  };

  // Clasificación por columnas
  const pendientes = tickets.filter((t) => t.estado === 'pendiente' || !t.estado);
  const enPreparacion = tickets.filter(
    (t) => t.estado === 'en_preparacion' || t.estado === 'en preparación'
  );
  const listos = tickets.filter((t) => t.estado === 'listo');

  return (
    <div className="p-8 max-w-[1550px] mx-auto w-full space-y-6 font-montserrat relative">
      {/* Alerta flotante centrada en pantalla */}
      {toast.open && (
        <div className="fixed top-12 left-1/2 transform -translate-x-1/2 z-[100] transition-all">
          <div
            className={`px-8 py-4 rounded-2xl shadow-2xl border font-bold text-sm text-center flex items-center gap-3 ${
              toast.type === 'error'
                ? 'bg-red-50 text-red-700 border-red-200'
                : toast.type === 'warning'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            <span className="text-xl">
              {toast.type === 'error' ? '❌' : toast.type === 'warning' ? '⚠️' : '✅'}
            </span>
            {toast.message}
          </div>
        </div>
      )}

      <CocinaHeader
        socketConectado={socketConectado}
        totalActivos={tickets.length}
        totalPendientes={pendientes.length}
        totalEnPreparacion={enPreparacion.length}
        totalListos={listos.length}
        onAbrirIncidencia={() => setModalIncidenciaOpen(true)}
        onAbrirDespachados={handleAbrirDespachados}
        onAbrirStock={handleAbrirModalStock}
        onRecargar={cargarTicketsActivos}
      />

      {/* Tablero Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <KanbanColumn
          titulo="Pendiente"
          colorPunto="bg-amber-600"
          tickets={pendientes}
          tipo="pendiente"
          cargando={cargando}
          mensajeVacio="No hay tickets pendientes."
          onCambiarEstado={handleCambiarEstado}
        />

        <KanbanColumn
          titulo="En preparación"
          colorPunto="bg-blue-500"
          tickets={enPreparacion}
          tipo="en_preparacion"
          mensajeVacio="No hay tickets en preparación."
          onCambiarEstado={handleCambiarEstado}
        />

        <KanbanColumn
          titulo="Listo"
          colorPunto="bg-emerald-500"
          tickets={listos}
          tipo="listo"
          mensajeVacio="No hay comandas terminadas."
          onCambiarEstado={handleCambiarEstado}
        />
      </div>

      <DespachadosModal
        isOpen={modalDespachadosOpen}
        onClose={() => setModalDespachadosOpen(false)}
        cargando={cargandoDespachados}
        ticketsDespachados={ticketsDespachados}
      />

      <StockModal
        isOpen={modalStockOpen}
        onClose={() => setModalStockOpen(false)}
        cargando={cargandoStock}
        productos={productos}
        onToggleDisponibilidad={handleToggleDisponibilidad}
      />

      <IncidenciaModal
        isOpen={modalIncidenciaOpen}
        onClose={() => setModalIncidenciaOpen(false)}
        descripcion={descripcionIncidencia}
        onChangeDescripcion={setDescripcionIncidencia}
        enviando={enviandoIncidencia}
        onEnviar={handleReportarIncidencia}
      />
    </div>
  );
}