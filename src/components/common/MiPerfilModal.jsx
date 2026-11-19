import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';

// Íconos SVG de ojito (abierto y cerrado)
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

export default function MiPerfilModal({ isOpen, onClose }) {
  const usuarioActual = authService.getUsuarioActual();

  const [nombre, setNombre] = useState(usuarioActual?.nombre || '');
  const [passwordActual, setPasswordActual] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');

  // Estados para mostrar/ocultar contraseñas
  const [verActual, setVerActual] = useState(false);
  const [verNueva, setVerNueva] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);

  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [mostrarExito, setMostrarExito] = useState(false);

  // Reiniciar campos cada vez que se abre el modal
  useEffect(() => {
    if (isOpen) {
      const user = authService.getUsuarioActual();
      setNombre(user?.nombre || '');
      setPasswordActual('');
      setNuevaPassword('');
      setConfirmarPassword('');
      setVerActual(false);
      setVerNueva(false);
      setVerConfirmar(false);
      setError('');
    }
  }, [isOpen]);

  if (!isOpen && !mostrarExito) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {};
    const nombreLimpio = nombre.trim();

    // 1. Validación de nombre si se modificó
    if (nombreLimpio !== (usuarioActual?.nombre || '')) {
      const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
      if (nombreLimpio.length < 3 || !nameRegex.test(nombreLimpio)) {
        setError('El nombre debe tener al menos 3 letras y no contener números ni símbolos.');
        return;
      }
      payload.nombre = nombreLimpio;
    }

    // 2. Validaciones de contraseña si escribió en cualquiera de los campos nuevos
    if (nuevaPassword || confirmarPassword) {
      if (!passwordActual) {
        setError('Debes ingresar tu contraseña actual para poder cambiarla.');
        return;
      }
      if (nuevaPassword.length < 6) {
        setError('La nueva contraseña debe tener mínimo 6 caracteres.');
        return;
      }
      if (nuevaPassword !== confirmarPassword) {
        setError('Las contraseñas nuevas no coinciden. Verifica ambos campos.');
        return;
      }
      if (nuevaPassword === passwordActual) {
        setError('La nueva contraseña debe ser diferente a la actual.');
        return;
      }
      payload.passwordActual = passwordActual;
      payload.nuevaPassword = nuevaPassword;
    }

    if (Object.keys(payload).length === 0) {
      setError('No hay cambios para guardar.');
      return;
    }

    setGuardando(true);
    try {
      await authService.actualizarMiPerfil(payload);
      onClose(); // Cierra automáticamente el modal de edición
      setMostrarExito(true); // Muestra la ventana emergente de éxito
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al actualizar el perfil.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      {/* Modal de Edición de Perfil */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 font-montserrat">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl border border-gray-200 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="text-base font-bold text-[#4A3B32]">Mi Perfil y Contraseña</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-[#4A3B32] font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#5C4033] outline-none"
                />
              </div>

              <div className="pt-2 border-t border-gray-100 space-y-2.5">
                <p className="text-xs font-bold text-gray-700">Cambiar Contraseña (opcional)</p>

                {/* Contraseña Actual */}
                <div className="relative">
                  <input
                    type={verActual ? 'text' : 'password'}
                    value={passwordActual}
                    onChange={(e) => {
                      setPasswordActual(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Contraseña actual (o temporal del correo)"
                    className="w-full border border-gray-300 rounded-xl p-2.5 pr-10 text-xs focus:ring-2 focus:ring-[#5C4033] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setVerActual(!verActual)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#4A3B32] cursor-pointer"
                    tabIndex={-1}
                  >
                    {verActual ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>

                {/* Nueva Contraseña */}
                <div className="relative">
                  <input
                    type={verNueva ? 'text' : 'password'}
                    value={nuevaPassword}
                    onChange={(e) => {
                      setNuevaPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Nueva contraseña (mínimo 6 caracteres)"
                    className="w-full border border-gray-300 rounded-xl p-2.5 pr-10 text-xs focus:ring-2 focus:ring-[#5C4033] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setVerNueva(!verNueva)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#4A3B32] cursor-pointer"
                    tabIndex={-1}
                  >
                    {verNueva ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>

                {/* Confirmar Nueva Contraseña */}
                <div className="relative">
                  <input
                    type={verConfirmar ? 'text' : 'password'}
                    value={confirmarPassword}
                    onChange={(e) => {
                      setConfirmarPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Confirmar nueva contraseña"
                    className="w-full border border-gray-300 rounded-xl p-2.5 pr-10 text-xs focus:ring-2 focus:ring-[#5C4033] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setVerConfirmar(!verConfirmar)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#4A3B32] cursor-pointer"
                    tabIndex={-1}
                  >
                    {verConfirmar ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#5C4033] hover:bg-[#4A3B32] rounded-xl cursor-pointer transition-colors disabled:opacity-50"
                >
                  {guardando ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ventana Emergente de Éxito */}
      {mostrarExito && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 font-montserrat">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-xl border border-gray-200 text-center space-y-4">
            <div className="w-12 h-12 bg-[#EAE4DC] text-[#4A3B32] rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              ✓
            </div>
            <h3 className="text-base font-bold text-[#4A3B32]">¡Listo!</h3>
            <p className="text-xs text-gray-600">
              Perfil actualizado correctamente.
            </p>
            <button
              onClick={() => setMostrarExito(false)}
              className="w-full py-2.5 text-xs font-bold text-white bg-[#5C4033] hover:bg-[#4A3B32] rounded-xl cursor-pointer transition-colors"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </>
  );
}