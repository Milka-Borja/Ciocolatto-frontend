import api from './api';

export const ticketService = {
  // Listar_tickets_activos: GET /api/tickets
  obtenerTicketsActivos: async () => {
    const response = await api.get('/tickets');
    return response.data;
  },

  // Cambiar_estado: PATCH /api/tickets/:id/estado
  // nuevoEstado: 'pendiente' | 'en_preparacion' | 'listo' | 'entregado'
  cambiarEstado: async (ticketId, nuevoEstado) => {
    const response = await api.patch(`/tickets/${ticketId}/estado`, {
      nuevoEstado,
    });
    return response.data;
  },

  // Listar_tickets_despachados: GET /api/tickets?tipo=despachados
  obtenerTicketsDespachados: async () => {
    const response = await api.get('/tickets?tipo=despachados');
    return response.data;
  },
};

export default ticketService;