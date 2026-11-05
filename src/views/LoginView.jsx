import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import imgCono from '../assets/cono.jpg';

export default function LoginView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
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
        </form>
      </div>
    </div>
  );
}