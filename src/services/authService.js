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
registro: async ({ nombre, email, rol }) => {
    const response = await api.post('/auth/registro', {
      nombre,
      email,
      rol,
    });
    return response.data;
  },

  // 3.-Listar_Usuarios: GET /usuarios
  obtenerUsuarios: async (filtro = 'activos') => {
    let url = '/usuarios';
    if (filtro === 'activos') url = '/usuarios?soloActivos=true';
    else if (filtro === 'inactivos') url = '/usuarios?soloInactivos=true';
    else if (filtro === 'eliminados') url = '/usuarios?soloEliminados=true';

    const response = await api.get(url);
    return response.data;
  },

  // NUEVO: Cambiar Estado Operativo (Vacaciones / Suspensión) - PATCH
  actualizarEstadoOperativo: async (id, activo) => {
    const response = await api.patch(`/usuarios/${id}/estado`, { activo });
    return response.data;
  },

  // Actualización General (Nombre, Email, Password) - PUT
  actualizarUsuario: async (id, datos) => {
    const response = await api.put(`/usuarios/${id}`, datos);
    return response.data;
  },

  // Baja Definitiva (Soft Delete) - DELETE
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
  // NUEVO: Actualizar Mi Perfil / Cambiar Contraseña (PUT /auth/mi-perfil)
  actualizarMiPerfil: async (datos) => {
    const response = await api.put('/auth/mi-perfil', datos);
    // Actualizamos el usuario guardado en sessionStorage si cambió el nombre
    if (response.data) {
      const actual = authService.getUsuarioActual() || {};
      sessionStorage.setItem('usuario', JSON.stringify({ ...actual, ...response.data }));
    }
    return response.data;
  },

  // NUEVO: Solicitar Recuperación de Contraseña (POST /auth/olvide-password)
  olvidePassword: async (email) => {
    const response = await api.post('/auth/olvide-password', { email });
    return response.data;
  },
};

export default authService;