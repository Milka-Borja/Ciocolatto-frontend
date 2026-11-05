import api from './api';

export const authService = {
  // 1.-Login: POST /auth/login
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data?.token) {
      // Guardar en sessionStorage para aislar las sesiones por pestaña
      sessionStorage.setItem('token', response.data.token);
      sessionStorage.setItem(
        'usuario',
        JSON.stringify(response.data.usuario || { email, rol: response.data.rol || 'caja' })
      );
    }
    return response.data;
  },

  // 2.-Registro_Usuarios: POST /auth/registro
  registro: async ({ nombre, email, password, rol }) => {
    const response = await api.post('/auth/registro', {
      nombre,
      email,
      password,
      rol,
    });
    return response.data;
  },

  // 3.-Listar_Usuarios: GET /usuarios
  obtenerUsuarios: async () => {
    const response = await api.get('/usuarios');
    return response.data;
  },

  // 4.-Actualizar_Usuario: PUT /usuarios/:id
  actualizarUsuario: async (id, datos) => {
    const response = await api.put(`/usuarios/${id}`, datos);
    return response.data;
  },

  // 5.-Eliminar_Usuario: DELETE /usuarios/:id (Desactivación lógica)
  eliminarUsuario: async (id) => {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  },

  logout: () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
  },

  getUsuarioActual: () => {
    try {
      const userStr = sessionStorage.getItem('usuario');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },
};

export default authService;