import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import PrediccionTab from './PrediccionTab';

export default function AnalisisTab() {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  
  const [datosTopProductos, setDatosTopProductos] = useState([]);
  const [datosVentasDiarias, setDatosVentasDiarias] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [exportando, setExportando] = useState(false);

  // Nuevos estados para exportar productos vendidos
  const [exportandoProductos, setExportandoProductos] = useState(false);
  const [agruparPorFecha, setAgruparPorFecha] = useState(false);

  useEffect(() => {
    consultarAnaliticas();
  }, [fechaInicio, fechaFin]);

  const consultarAnaliticas = async () => {
    setCargando(true);
    try {
      const params = {};
      if (fechaInicio) params.fechaInicio = fechaInicio;
      if (fechaFin) params.fechaFin = fechaFin;

      const paramsVentas = { ...params };
      if (!fechaInicio && !fechaFin) {
        paramsVentas.ultimosDias = 7;
      }

      const [resProductos, resVentas] = await Promise.all([
        api.get('/reportes/top-productos', { params }),
        api.get('/reportes/ventas-diarias', { params: paramsVentas })
      ]);

      setDatosTopProductos(resProductos.data);
      setDatosVentasDiarias(resVentas.data);
    } catch (error) {
      console.error("Error al cargar analíticas:", error);
    } finally {
      setCargando(false);
    }
  };

  const handleExportarVentasDiarias = async () => {
    setExportando(true);
    try {
      const params = {};
      if (fechaInicio) params.fechaInicio = fechaInicio;
      if (fechaFin) params.fechaFin = fechaFin;
      if (!fechaInicio && !fechaFin) params.ultimosDias = 7;

      const response = await api.get('/reportes/ventas-diarias/excel', {
        params,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'reporte_ventas_diarias.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al exportar ventas:", error);
      alert("Hubo un error al descargar el reporte Excel.");
    } finally {
      setExportando(false);
    }
  };

  // Nueva función para descargar el Excel de productos vendidos (general o por fecha)
  const handleExportarProductosVendidos = async () => {
    setExportandoProductos(true);
    try {
      const params = {};
      if (fechaInicio) params.fechaInicio = fechaInicio;
      if (fechaFin) params.fechaFin = fechaFin;
      if (agruparPorFecha) params.agruparPorFecha = true;

      const response = await api.get('/reportes/productos-vendidos/excel', {
        params,
        responseType: 'blob'
      });

      const nombreArchivo = agruparPorFecha
        ? 'reporte_productos_vendidos_por_fecha.xlsx'
        : 'reporte_productos_vendidos.xlsx';

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', nombreArchivo);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al exportar productos vendidos:", error);
      alert("Hubo un error al descargar el reporte Excel de productos.");
    } finally {
      setExportandoProductos(false);
    }
  };

  const { totalIngresos, totalPedidos } = useMemo(() => {
    return datosVentasDiarias.reduce(
      (acc, dia) => ({
        totalIngresos: acc.totalIngresos + Number(dia.total_ingresos || 0),
        totalPedidos: acc.totalPedidos + Number(dia.cantidad_pedidos || 0)
      }),
      { totalIngresos: 0, totalPedidos: 0 }
    );
  }, [datosVentasDiarias]);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-2xs flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5"> Desde</label>
          <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#003366]" />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5"> Hasta</label>
          <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#003366]" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Ingresos del Período</p>
            <p className="text-3xl font-extrabold text-[#003366] mt-1">${totalIngresos.toFixed(2)}</p>
          </div>
          <div className="bg-green-100 text-green-700 p-3 rounded-2xl text-xl"></div>
        </div>
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Pedidos Completados</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">{totalPedidos}</p>
          </div>
          <div className="bg-blue-100 text-blue-700 p-3 rounded-2xl text-xl"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800">Fluctuación de Ingresos Diarios</h3>
            <button 
              onClick={handleExportarVentasDiarias}
              disabled={exportando || cargando}
              className="bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {exportando ? 'Descargando...' : 'Exportar Excel'}
            </button>
          </div>
          
          {cargando ? (
             <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm bg-gray-50 rounded-2xl">Cargando métricas...</div>
          ) : datosVentasDiarias.length > 0 ? (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={datosVentasDiarias} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#003366" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#003366" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="fecha" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value) => [`$${value}`, 'Ingresos']} />
                  <Area type="monotone" dataKey="total_ingresos" stroke="#003366" strokeWidth={3} fillOpacity={1} fill="url(#colorIngresos)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm bg-gray-50 rounded-2xl">No hay datos en este rango.</div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs">
          <div className="flex flex-wrap justify-between items-center gap-2 mb-6">
            <h3 className="font-bold text-gray-800">Top 10 Productos Más Vendidos</h3>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agruparPorFecha}
                  onChange={(e) => setAgruparPorFecha(e.target.checked)}
                  className="w-3.5 h-3.5 accent-[#003366] cursor-pointer"
                />
                Agrupar por fecha
              </label>
              <button 
                onClick={handleExportarProductosVendidos}
                disabled={exportandoProductos || cargando}
                className="bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {exportandoProductos ? 'Descargando...' : ' Exportar Excel'}
              </button>
            </div>
          </div>

          {cargando ? (
             <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm bg-gray-50 rounded-2xl">Cargando métricas...</div>
          ) : datosTopProductos.length > 0 ? (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datosTopProductos} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="nombre" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} interval={0} angle={-20} textAnchor="end" />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value) => [`${value} unidades`, 'Ventas']} />
                  <Bar dataKey="cantidad_total" radius={[6, 6, 0, 0]} maxBarSize={40}>
                    {datosTopProductos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#003366' : '#668099'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm bg-gray-50 rounded-2xl">No hay datos en este rango.</div>
          )}
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-gray-200">
        <PrediccionTab />
      </div>
    </div>
  );
}