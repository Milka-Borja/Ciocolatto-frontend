import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';

export default function UsuariosTab() {
  const [usuarios, setUsuarios] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  
  // Pestañas: 'activos', 'inactivos', 'eliminados'
  const [pestanaActiva, setPestanaActiva] = useState('activos');


  const [alerta, setAlerta] = useState({ mostrar: false, mensaje: '', tipo: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ mostrar: false, mensaje: '', accionConfirmar: null });

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'caja',
  });

  useEffect(() => {
    cargarUsuarios();
  }, [pestanaActiva]);

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      const data = await authService.obtenerUsuarios(pestanaActiva);
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setUsuarios([]);
    } finally {
      setCargando(false);
    }
  };

  const mostrarAlerta = (mensaje, tipo = 'success') => {
    setAlerta({ mostrar: true, mensaje, tipo });
    setTimeout(() => setAlerta({ mostrar: false, mensaje: '', tipo: 'success' }), 3500);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formError) setFormError('');
  };

  const handleOpenCrear = () => {
    setEditingId(null);
    setFormData({ nombre: '', email: '', password: '', rol: 'caja' });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditar = (u) => {
    setEditingId(u.id);
    setFormData({
      nombre: u.nombre || '',
      email: u.email || '',
      password: '',
      rol: (u.rol || 'caja').toLowerCase(),
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (formData.nombre.trim().length < 3) {
      setFormError('El nombre debe tener al menos 3 caracteres.');
      return;
    }
    if (!editingId && formData.password.length < 6) {
      setFormError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setGuardando(true);
    try {
      if (editingId) {
        const updatePayload = {
          nombre: formData.nombre.trim(),
          email: formData.email.trim(),
        };
        if (formData.password) updatePayload.password = formData.password;
        
        await authService.actualizarUsuario(editingId, updatePayload);
        mostrarAlerta('¡Usuario actualizado exitosamente!');
      } else {
        await authService.registro({
          nombre: formData.nombre.trim(),
          email: formData.email.trim(),
          password: formData.password,
          rol: formData.rol,
        });
        mostrarAlerta('¡Usuario registrado exitosamente!');
      }

      await cargarUsuarios();
      setIsModalOpen(false);
      setFormData({ nombre: '', email: '', password: '', rol: 'caja' });
    } catch (err) {
      console.error('Error al procesar usuario:', err);
      setFormError(err.response?.data?.mensaje || 'Error al conectar con el servidor.');
    } finally {
      setGuardando(false);
    }
  };


  const toggleEstadoOperativo = (id, estadoActual) => {
    const accion = estadoActual ? 'suspender (poner en pausa)' : 'reintegrar';
    setConfirmDialog({
      mostrar: true,
      mensaje: `¿Estás seguro de ${accion} a este usuario?`,
      accionConfirmar: async () => {
        setConfirmDialog({ mostrar: false, mensaje: '', accionConfirmar: null });
        try {
          await authService.actualizarEstadoOperativo(id, !estadoActual);
          mostrarAlerta('Estado operativo actualizado correctamente.');
          cargarUsuarios();
        } catch (error) {
          console.error('Error al cambiar el estado operativo:', error);
          mostrarAlerta('Hubo un error al intentar cambiar el estado del usuario.', 'error');
        }
      }
    });
  };


  const darDeBajaUsuario = (id, nombre) => {
    setConfirmDialog({
      mostrar: true,
      mensaje: `⚠️ ¿Estás seguro de dar de baja definitiva a ${nombre}? Pasará a la papelera.`,
      accionConfirmar: async () => {
        setConfirmDialog({ mostrar: false, mensaje: '', accionConfirmar: null });
        try {
          await authService.eliminarUsuario(id);
          mostrarAlerta('Usuario dado de baja correctamente.');
          cargarUsuarios();
        } catch (error) {
          console.error('Error al dar de baja:', error);
          mostrarAlerta('Hubo un error al intentar dar de baja al usuario.', 'error');
        }
      }
    });
  };

  return (
    <div className="space-y-4 font-montserrat relative">
      {/* Toast Notificación */}
      {alerta.mostrar && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-xl shadow-lg border text-sm font-bold animate-fade-in-down ${alerta.tipo === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
          {alerta.mensaje}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#003366]">Gestión de Cuentas y Roles</h2>
          <p className="text-xs text-gray-500">Control de acceso, permisos laborales y bajas de personal.</p>
        </div>
        
        {/* Pestañas de Navegación */}
        <div className="flex space-x-1 bg-[#F8F9FA] p-1 rounded-xl text-xs">
          <button
            onClick={() => setPestanaActiva('activos')}
            className={`px-3 py-2 rounded-lg font-medium transition-all cursor-pointer ${
              pestanaActiva === 'activos' ? 'bg-[#003366] shadow-2xs text-white font-bold' : 'text-[#333333] hover:text-[#003366]'
            }`}
          >
            Usuarios Activos
          </button>
          
          <button
            onClick={() => setPestanaActiva('inactivos')}
            className={`px-3 py-2 rounded-lg font-medium transition-all cursor-pointer ${
              pestanaActiva === 'inactivos' ? 'bg-[#003366] shadow-2xs text-white font-bold' : 'text-[#333333] hover:text-[#003366]'
            }`}
          >
            En pausa
          </button>
          <button
            onClick={() => setPestanaActiva('eliminados')}
            className={`px-3 py-2 rounded-lg font-medium transition-all cursor-pointer ${
              pestanaActiva === 'eliminados' ? 'bg-[#003366] shadow-2xs text-white font-bold' : 'text-[#333333] hover:text-[#003366]'
            }`}
          >
            Papelera
          </button>
        </div>

        {pestanaActiva === 'activos' && (
          <button
            onClick={handleOpenCrear}
            className="bg-[#003366] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#002D62] cursor-pointer transition-colors shadow-2xs"
          >
            + Nuevo Usuario
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#F8F9FA]">
        <table className="w-full text-left border-collapse bg-white">
          <thead className="bg-[#F8F9FA]">
            <tr className="border-b border-[#F8F9FA] text-xs text-[#333333] uppercase tracking-wider">
              <th className="py-3 px-4 font-semibold">Nombre</th>
              <th className="py-3 px-4 font-semibold">Correo Electrónico</th>
              <th className="py-3 px-4 font-semibold">Rol</th>
              <th className="py-3 px-4 font-semibold">Estado</th>
              <th className="py-3 px-4 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F8F9FA] text-sm">
            {cargando ? (
              <tr><td colSpan="5" className="py-8 text-center text-[#333333]">Cargando usuarios...</td></tr>
            ) : usuarios.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-[#333333]">
                  {pestanaActiva === 'activos' && 'No hay usuarios activos operando.'}
                  {pestanaActiva === 'inactivos' && 'No hay usuarios en pausa.'}
                  {pestanaActiva === 'eliminados' && 'La papelera de exempleados está vacía.'}
                </td>
              </tr>
            ) : (
              usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-[#F8F9FA] transition-colors">
                  <td className="py-4 px-4 font-bold text-[#003366]">{u.nombre}</td>
                  <td className="py-4 px-4 text-[#333333]">{u.email}</td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#F8F9FA] text-[#003366] border border-[#F8F9FA] uppercase">
                      {u.rol}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-[#333333]">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                      {u.eliminado ? 'Dado de baja' : u.activo ? 'Activo' : 'En pausa'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right space-x-3">
                    {pestanaActiva === 'activos' && (
                      <>
                        <button onClick={() => handleOpenEditar(u)} className="text-[#333333] hover:text-[#003366] underline-offset-2 hover:underline text-xs font-bold cursor-pointer">Editar</button>
                        <button onClick={() => toggleEstadoOperativo(u.id, u.activo)} className="text-[#333333] hover:text-[#003366] underline-offset-2 hover:underline text-xs font-bold cursor-pointer">Pausar</button>
                        <button onClick={() => darDeBajaUsuario(u.id, u.nombre)} className="text-gray-500 hover:text-gray-700 underline-offset-2 hover:underline text-xs font-bold cursor-pointer">Dar de Baja</button>
                      </>
                    )}

                    {pestanaActiva === 'inactivos' && (
                      <>
                        <button onClick={() => toggleEstadoOperativo(u.id, u.activo)} className="text-[#333333] hover:text-[#003366] underline-offset-2 hover:underline text-xs font-bold cursor-pointer">Reintegrar</button>
                        <button onClick={() => darDeBajaUsuario(u.id, u.nombre)} className="text-gray-500 hover:text-gray-700 underline-offset-2 hover:underline text-xs font-bold cursor-pointer">Dar de Baja</button>
                      </>
                    )}

                    {pestanaActiva === 'eliminados' && (
                      <span className="text-xs text-[#333333] italic">Registro histórico (Inmutable)</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-[#F8F9FA] space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#F8F9FA]">
              <h3 className="text-lg font-bold text-[#003366]">{editingId ? `Editar Usuario #${editingId}` : 'Registrar Nuevo Usuario'}</h3>
              <button onClick={() => { setIsModalOpen(false); setFormError(''); }} className="text-[#333333] hover:text-[#003366] text-lg font-bold cursor-pointer">✕</button>
            </div>
            
            {formError && <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100">{formError}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#333333] mb-1">Nombre Completo</label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required className="w-full border border-[#F8F9FA] rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-[#003366] outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#333333] mb-1">Correo Electrónico</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full border border-[#F8F9FA] rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-[#003366] outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#333333] mb-1">{editingId ? 'Nueva Contraseña (opcional)' : 'Contraseña'}</label>
                <input type="password" name="password" value={formData.password} onChange={handleInputChange} required={!editingId} className="w-full border border-[#F8F9FA] rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-[#003366] outline-none" />
              </div>
              {!editingId && (
                <div>
                  <label className="block text-xs font-bold text-[#333333] mb-1">Rol Asignado</label>
                  <select name="rol" value={formData.rol} onChange={handleInputChange} className="w-full border border-[#F8F9FA] rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-[#003366] outline-none bg-white cursor-pointer">
                    <option value="caja">Caja / Ventas</option>
                    <option value="cocina">Cocina</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              )}
              <div className="flex justify-end space-x-3 pt-3 border-t border-[#F8F9FA]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-[#333333] bg-[#F8F9FA] rounded-xl hover:bg-[#F0F2F5] transition-colors cursor-pointer">Cancelar</button>
                <button type="submit" disabled={guardando} className="px-5 py-2 text-xs font-bold text-white bg-[#003366] hover:bg-[#002D62] rounded-xl transition-colors cursor-pointer shadow-2xs disabled:opacity-50">
                  {guardando ? 'Guardando...' : editingId ? 'Actualizar Usuario' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDialog.mostrar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-xl">⚠️</div>
            <h3 className="text-lg font-bold text-gray-900">¿Confirmar Acción?</h3>
            <p className="text-sm text-gray-500">{confirmDialog.mensaje}</p>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setConfirmDialog({ mostrar: false, mensaje: '', accionConfirmar: null })}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDialog.accionConfirmar}
                className="flex-1 px-4 py-2.5 text-white rounded-xl text-xs font-bold bg-[#003366] hover:bg-[#002244] cursor-pointer shadow-sm"
              >
                Sí, proceder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}