import React, { useState, useEffect } from 'react';
import { incidenciaService } from '../../services/incidenciaService';

export default function IncidenciasTab() {
  const [incidencias, setIncidencias] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    cargarIncidencias();
  }, []);

  const cargarIncidencias = async () => {
    setCargando(true);
    try {
      const data = await incidenciaService.obtenerTodas();
      // Ordenamos para que las más recientes salgan primero
      const dataOrdenada = (Array.isArray(data) ? data : []).sort(
        (a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion)
      );
      setIncidencias(dataOrdenada);
    } catch (error) {
      console.error('Error al cargar incidencias:', error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="space-y-4 font-montserrat">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#003366]">Historial de Incidencias</h2>
          <p className="text-xs text-gray-500">
            Registro de alertas, faltantes o fallas operativas reportadas por el personal de cocina.
          </p>
        </div>
        <button
          onClick={cargarIncidencias}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-200 cursor-pointer transition-colors shadow-2xs"
        >
          Actualizar Lista
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-left border-collapse bg-white">
          <thead className="bg-[#F8F9FA]">
            <tr className="border-b border-[#F8F9FA] text-xs text-[#333333] uppercase tracking-wider">
              <th className="py-3 px-4 font-semibold">ID</th>
              <th className="py-3 px-4 font-semibold">Fecha y Hora</th>
              <th className="py-3 px-4 font-semibold">Reportado por</th>
              <th className="py-3 px-4 font-semibold">Descripción del Problema</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F8F9FA] text-sm">
            {cargando ? (
              <tr>
                <td colSpan="4" className="py-8 text-center text-[#333333]">
                  Cargando incidencias...
                </td>
              </tr>
            ) : incidencias.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-8 text-center text-[#333333]">
                  No hay incidencias reportadas.
                </td>
              </tr>
            ) : (
              incidencias.map((inc) => (
                <tr key={inc.id} className="hover:bg-[#F8F9FA] transition-colors">
                  <td className="py-4 px-4 font-mono text-xs text-gray-500">#{inc.id}</td>
                  <td className="py-4 px-4 text-[#333333] font-mono text-xs">
                    {new Date(inc.fecha_creacion).toLocaleString([], {
                      dateStyle: 'short',
                      timeStyle: 'short'
                    })}
                  </td>
                  <td className="py-4 px-4">
                    <span className="flex items-center gap-1.5 font-bold text-[#003366]">
                      <span className="w-6 h-6 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-xs">
                        {inc.usuario_nombre ? inc.usuario_nombre.charAt(0).toUpperCase() : 'U'}
                      </span>
                      {inc.usuario_nombre || `Usuario #${inc.usuario_id}`}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-[#333333]">
                    <div className="bg-red-50/50 p-2.5 rounded-xl border border-red-100 text-sm">
                      {inc.descripcion}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}