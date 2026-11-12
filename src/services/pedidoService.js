import api from './api';

export const pedidoService = {
  // 1.-Confirmar_Pedido: POST /api/pedidos
  crearPedido: async (pedidoData) => {
    const response = await api.post('/pedidos', pedidoData);
    return response.data;
  },

  // 2.-Consultar_Con_Id_Pedido: GET /api/pedidos/:id
  obtenerPedidoPorId: async (id) => {
    const response = await api.get(`/pedidos/${id}`);
    return response.data;
  },

  // 3.-Consultar_Pedidos_Id_Usuario: GET /api/pedidos/usuario/:usuarioId
  obtenerPedidosPorUsuario: async (usuarioId) => {
    const response = await api.get(`/pedidos/usuario/${usuarioId}`);
    return response.data;
  },

  // Respaldo para Cocina si Lubswer habilita GET /api/pedidos
  obtenerTodosPedidos: async () => {
    try {
      const response = await api.get('/pedidos');
      return response.data;
    } catch {
      return [];
    }
  },
  // GET /api/pedidos (Endpoint exclusivo para Admin)
  obtenerHistorialPedidos: async (fechaInicio = '', fechaFin = '', soloExtras = false) => {
    try {
      // Construir los query params
      const params = new URLSearchParams();
      if (fechaInicio) params.append('fechaInicio', fechaInicio);
      if (fechaFin) params.append('fechaFin', fechaFin);
      if (soloExtras) params.append('soloExtras', 'true');
      
      const url = `/pedidos?${params.toString()}`;
      const response = await api.get(url);
      
      return response.data;
    } catch (error) {
      console.error("Error al obtener el historial general:", error);
      throw error;
    }
  }
};

export default pedidoService;