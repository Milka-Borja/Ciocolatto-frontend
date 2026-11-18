import api from './api';

export const incidenciaService = {
  // 1. Reportar_Incidencia: POST /api/incidencias
  reportar: async (descripcion) => {
    const response = await api.post('/incidencias', { descripcion });
    return response.data;
  },

  // 2. Listar: GET /api/incidencias (Para el Administrador)
  obtenerTodas: async () => {
    const response = await api.get('/incidencias');
    return response.data;
  },

  // 3. Listar_Incidencia_Usuario: GET /api/incidencias/usuario/:id
  obtenerPorUsuario: async (usuarioId) => {
    const response = await api.get(`/incidencias/usuario/${usuarioId}`);
    return response.data;
  }
};