import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';

export default function UsuariosTab() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = Registrar, número = Editar
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'caja',
  });

  // 1. Cargar usuarios de la base de datos (GET /api/usuarios)
  const cargarUsuarios = async () => {
    setCargando(true);
    try {
      const data = await authService.obtenerUsuarios();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formError) setFormError('');
  };

  // Abrir modal en modo "Nuevo Usuario"
  const handleOpenCrear = () => {
    setEditingId(null);
    setFormData({
      nombre: '',
      email: '',
      password: '',
      rol: 'caja',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  // Abrir modal en modo "Editar Usuario"
  const handleOpenEditar = (u) => {
    setEditingId(u.id);
    setFormData({
      nombre: u.nombre || '',
      email: u.email || '',
      password: '', // En edición se puede ingresar nueva o dejar la que decida el admin
      rol: (u.rol || 'caja').toLowerCase(),
    });
    setFormError('');
    setIsModalOpen(true);
  };

  // 2. Guardar (POST registro o PUT actualización)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validación de Nombre
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!nameRegex.test(formData.nombre.trim()) || formData.nombre.trim().length < 3) {
      setFormError('El nombre debe tener al menos 3 letras y no contener números ni símbolos.');
      return;
    }

    // Validación de Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setFormError('Por favor ingresa un correo electrónico válido.');
      return;
    }

    // Validación de Password (obligatoria al crear, mínima de 6 caracteres si se provee al editar)
    if (!editingId && formData.password.length < 6) {
      setFormError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (editingId && formData.password && formData.password.length < 6) {
      setFormError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setGuardando(true);

    try {
      if (editingId) {
        // PUT /api/usuarios/:id
        const updatePayload = {
          nombre: formData.nombre.trim(),
          email: formData.email.trim(),
        };
        if (formData.password) {
          updatePayload.password = formData.password;
        }
        await authService.actualizarUsuario(editingId, updatePayload);
        alert('¡Usuario actualizado exitosamente!');
      } else {
        // POST /api/auth/registro
        await authService.registro({
          nombre: formData.nombre.trim(),
          email: formData.email.trim(),
          password: formData.password,
          rol: formData.rol.toLowerCase(),
        });
        alert('¡Usuario registrado exitosamente en la base de datos!');
      }

      setIsModalOpen(false);
      await cargarUsuarios();
    } catch (err) {
      console.error('Error al procesar usuario:', err);
      const backendMsg =
        err.response?.data?.mensaje ||
        err.response?.data?.error ||
        'Error al procesar la solicitud en el servidor.';
      setFormError(backendMsg);
    } finally {
      setGuardando(false);
    }
  };

  // 3. Desactivar usuario (DELETE /api/usuarios/:id)
  const handleDesactivar = async (id, nombre) => {
    if (!confirm(`¿Deseas desactivar la cuenta del usuario ${nombre}?`)) return;
    try {
      await authService.eliminarUsuario(id);
      await cargarUsuarios();
      alert(`Usuario ${nombre} desactivado.`);
    } catch (err) {
      console.error('Error al desactivar usuario:', err);
      alert('Error al desactivar el usuario.');
    }
  };

  return (
    <div className="space-y-4 font-montserrat">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Gestión de Usuarios y Roles</h2>
          <p className="text-xs text-gray-500">Cuentas y credenciales del personal de Ciocolatto.</p>
        </div>
        <button
          onClick={handleOpenCrear}
          className="bg-[#5C4033] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#4A3B32] cursor-pointer transition-colors shadow-2xs"
        >
          + Nuevo Usuario
        </button>
      </div>

      {/* Tabla con datos de la BD */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-left border-collapse bg-white">
          <thead className="bg-gray-50">
            <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
              <th className="py-3 px-4 font-semibold">ID</th>
              <th className="py-3 px-4 font-semibold">Nombre del Empleado</th>
              <th className="py-3 px-4 font-semibold">Correo Electrónico</th>
              <th className="py-3 px-4 font-semibold">Rol Asignado</th>
              <th className="py-3 px-4 font-semibold">Estado</th>
              <th className="py-3 px-4 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {cargando ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-400">
                  Cargando usuarios desde la base de datos...
                </td>
              </tr>
            ) : usuarios.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-400">
                  No se encontraron usuarios en el sistema.
                </td>
              </tr>
            ) : (
              usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 font-mono text-xs text-gray-400">#{u.id}</td>
                  <td className="py-4 px-4 font-bold text-gray-900">{u.nombre}</td>
                  <td className="py-4 px-4 text-gray-500">{u.email}</td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200 uppercase">
                      {u.rol}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`text-xs font-bold ${
                        u.activo ? 'text-emerald-600' : 'text-gray-400'
                      }`}
                    >
                      ● {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right space-x-3">
                    <button
                      onClick={() => handleOpenEditar(u)}
                      className="text-gray-500 hover:text-gray-900 underline-offset-2 hover:underline text-xs font-bold cursor-pointer"
                    >
                      Editar
                    </button>
                    {u.activo && (
                      <button
                        onClick={() => handleDesactivar(u.id, u.nombre)}
                        className="text-red-500 hover:text-red-700 underline-offset-2 hover:underline text-xs font-bold cursor-pointer"
                      >
                        Desactivar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Dinámico (Registrar / Editar) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-gray-200 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {editingId ? `Editar Usuario #${editingId}` : 'Registrar Nuevo Usuario'}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setFormError('');
                }}
                className="text-gray-400 hover:text-gray-700 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  placeholder="Ej. Juan Pérez"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-gray-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="usuario@ciocolatto.com"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-gray-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {editingId ? 'Nueva Contraseña (dejar en blanco para no cambiar)' : 'Contraseña'}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!editingId}
                  placeholder={editingId ? '••••••••' : 'Mínimo 6 caracteres'}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-gray-900 outline-none"
                />
              </div>

              {!editingId && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Rol en el Sistema</label>
                  <select
                    name="rol"
                    value={formData.rol}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-gray-900 outline-none bg-white cursor-pointer"
                  >
                    <option value="caja">Caja / Ventas</option>
                    <option value="cocina">Cocina</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#5C4033] hover:bg-[#4A3B32] rounded-xl transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                >
                  {guardando
                    ? 'Procesando...'
                    : editingId
                    ? 'Actualizar Usuario'
                    : 'Guardar Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}