import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import imgCono from '../assets/cono.jpg';

export default function LoginView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);

  // Estados para recuperación de contraseña
  const [modalRecuperar, setModalRecuperar] = useState(false);
  const [emailRecuperar, setEmailRecuperar] = useState('');
  const [mensajeRecuperar, setMensajeRecuperar] = useState('');
  const [enviandoRecuperar, setEnviandoRecuperar] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setCargando(true);

    try {
      const data = await authService.login(email.trim(), password);
      const rol = data?.usuario?.rol || data?.rol;

      if (rol === 'admin' || rol === 'Administrador') {
        navigate('/admin');
      } else if (rol === 'cocina' || rol === 'Cocina') {
        navigate('/cocina');
      } else {
        navigate('/ventas');
      }
    } catch (err) {
      console.error('Error de autenticación:', err);
      setErrorMsg(err.response?.data?.mensaje || 'Credenciales inválidas o problema de conexión con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  const handleRecuperarPassword = async (e) => {
    e.preventDefault();
    setEnviandoRecuperar(true);
    setMensajeRecuperar('');
    try {
      const res = await authService.olvidePassword(emailRecuperar.trim());
      setMensajeRecuperar(
        res.mensaje || 'Si el correo está registrado, recibirás un enlace de confirmación en tu bandeja.'
      );
      setEmailRecuperar('');
    } catch (err) {
      setMensajeRecuperar(
        err.response?.data?.mensaje || 'Ocurrió un error al procesar la solicitud.'
      );
    } finally {
      setEnviandoRecuperar(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 font-montserrat">
      <div className="bg-white border border-gray-200 rounded-3xl p-8 max-w-md w-full shadow-md space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-2xs border border-gray-100 flex items-center justify-center bg-gray-50">
            <img src={imgCono} alt="Ciocolatto Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-3xl tracking-wide text-[#00A3FF] font-pacifico">Ciocolatto</span>
          <p className="text-xs text-gray-500">Sistema Interno de Gestión y Ventas</p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="ejemplo@ciocolatto.com"
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5C4033]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5C4033]"
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-[#5C4033] hover:bg-[#4A3B32] text-white py-3 rounded-xl font-bold text-sm shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {cargando ? 'Iniciando sesión...' : 'Ingresar al Sistema'}
          </button>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => {
                setModalRecuperar(true);
                setMensajeRecuperar('');
              }}
              className="text-xs font-semibold text-gray-500 hover:text-[#5C4033] hover:underline cursor-pointer"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </form>
      </div>

      {modalRecuperar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 font-montserrat">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-xl border border-gray-200 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Recuperar Contraseña</h3>
              <button
                onClick={() => setModalRecuperar(false)}
                className="text-gray-400 hover:text-gray-700 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Ingresa tu correo registrado. Te enviaremos un enlace de confirmación (válido por 15 minutos) para generar una nueva clave temporal.
            </p>

            {mensajeRecuperar && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 font-medium">
                {mensajeRecuperar}
              </div>
            )}

            <form onSubmit={handleRecuperarPassword} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={emailRecuperar}
                  onChange={(e) => setEmailRecuperar(e.target.value)}
                  placeholder="ejemplo@gmail.com"
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#5C4033]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalRecuperar(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  disabled={enviandoRecuperar}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#5C4033] hover:bg-[#4A3B32] rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {enviandoRecuperar ? 'Enviando...' : 'Enviar enlace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}