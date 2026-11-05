import api from './api';

export const productoService = {
  // GET /api/productos (Catálogo de activos para Inventario y Ventas)
  obtenerTodos: async () => {
    const response = await api.get('/productos');
    return response.data;
  },

  // Alias para mantener compatibilidad si algún componente lo llama así
  obtenerActivos: async () => {
    const response = await api.get('/productos');
    return response.data;
  },

  // GET /api/productos?soloDisponibles=true (Para Ventas)
  obtenerDisponibles: async () => {
    const response = await api.get('/productos?soloDisponibles=true');
    return response.data;
  },

  // POST /api/productos (Crear)
  crear: async (datos) => {
    const response = await api.post('/productos', datos);
    return response.data;
  },

  // POST /api/productos (Crear o reactivar)
  crearOReactivar: async (datos) => {
    const response = await api.post('/productos', datos);
    return response.data;
  },

  // PATCH /api/productos/:id/disponibilidad (Cocina / Admin)
  cambiarDisponibilidad: async (id, disponible) => {
    const response = await api.patch(`/productos/${id}/disponibilidad`, { disponible });
    return response.data;
  },

  // PUT /api/productos/:id (Actualizar)
  actualizar: async (id, datos) => {
    const response = await api.put(`/productos/${id}`, datos);
    return response.data;
  },

  // DELETE /api/productos/:id (Borrado lógico)
  eliminarLogico: async (id) => {
    const response = await api.delete(`/productos/${id}`);
    return response.data;
  },

  // GET /api/productos?soloInactivos=true (Papelera)
  obtenerInactivos: async () => {
    const response = await api.get('/productos?soloInactivos=true');
    return response.data;
  },

  // GET /api/productos/:id
  obtenerPorId: async (id) => {
    const response = await api.get(`/productos/${id}`);
    return response.data;
  }
};

export default productoService;