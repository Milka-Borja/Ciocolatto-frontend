import React, { useState, useEffect } from 'react';
import { pedidoService } from '../../services/pedidoService';
import api from '../../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

export default function ReportesTab() {
  // 1. Estados temporales
  const [tempFechaInicio, setTempFechaInicio] = useState('');
  const [tempFechaFin, setTempFechaFin] = useState('');
  const [tempSoloExtras, setTempSoloExtras] = useState(false);
  
  // 2. Estados aplicados
  const [filtroAplicado, setFiltroAplicado] = useState({
    fechaInicio: '',
    fechaFin: '',
    soloExtras: false
  });

  // 3. Estado para alternar vistas internas
  const [vistaActiva, setVistaActiva] = useState('tabla'); // 'tabla' o 'grafica'

  const [historialVentas, setHistorialVentas] = useState([]);
  const [datosGrafica, setDatosGrafica] = useState([]);
  const [cargando, setCargando] = useState(false);
  
  const [pedidoDetalle, setPedidoDetalle] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const tieneExtras = (pedido) => {
    return pedido.extras === true || pedido.extras === 1 || pedido.extras === '1' || Number(pedido.total_extras) > 0;
  };

  useEffect(() => {
    consultarDatos();
  }, [filtroAplicado]);

  const consultarDatos = async () => {
    setCargando(true);
    try {
      // 1. Petición para la tabla
      const dataPedidos = await pedidoService.obtenerHistorialPedidos(filtroAplicado.fechaInicio, filtroAplicado.fechaFin, false);
      const registros = Array.isArray(dataPedidos) ? dataPedidos : (Array.isArray(dataPedidos?.pedidos) ? dataPedidos.pedidos : []);
      
      if (filtroAplicado.soloExtras) {
        setHistorialVentas(registros.filter(venta => tieneExtras(venta)));
      } else {
        setHistorialVentas(registros);
      }

      // 2. Petición para la gráfica
      const params = {};
      if (filtroAplicado.fechaInicio) params.fechaInicio = filtroAplicado.fechaInicio;
      if (filtroAplicado.fechaFin) params.fechaFin = filtroAplicado.fechaFin;

      const respuestaGrafica = await api.get('/reportes/top-productos', { params });
      setDatosGrafica(respuestaGrafica.data);

    } catch (error) {
      console.error("Error al consultar reportes:", error);
    } finally {
      setCargando(false);
    }
  };

  const handleAplicarFiltros = () => {
    setFiltroAplicado({
      fechaInicio: tempFechaInicio,
      fechaFin: tempFechaFin,
      soloExtras: tempSoloExtras
    });
  };

  const handleVerDetalles = async (ventaId) => {
    setCargandoDetalle(true);
    try {
      const dataCompleta = await pedidoService.obtenerPedidoPorId(ventaId);
      setPedidoDetalle(dataCompleta);
    } catch (error) {
      console.error("Error al obtener detalle:", error);
      alert("No se pudo cargar el detalle de esta orden.");
    } finally {
      setCargandoDetalle(false);
    }
  };

  return (
    <div className="p-8 space-y-6 font-montserrat">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-950">Historial y Reportes</h1>
          <p className="text-xs text-gray-500 mt-1">Consulta las transacciones, estadísticas y auditoría de cajeros.</p>
        </div>
        
        {/* Sub-pestañas internas */}
        <div className="flex bg-gray-100 p-1.5 rounded-xl space-x-1 border border-gray-200">
          <button 
            onClick={() => setVistaActiva('tabla')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              vistaActiva === 'tabla' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Tabla de Ventas
          </button>
          <button 
            onClick={() => setVistaActiva('grafica')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              vistaActiva === 'grafica' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Estadísticas
          </button>
        </div>

        <button 
          onClick={() => alert('Exportar Excel pendiente')}
          className="bg-[#5C4033] hover:bg-[#4A3B32] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer"
        >
           Descargar Reporte
        </button>
      </div>

      {/* FILTROS */}
      <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-2xs flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5"> Desde</label>
          <input 
            type="date" value={tempFechaInicio} onChange={(e) => setTempFechaInicio(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#5C4033]"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5"> Hasta</label>
          <input 
            type="date" value={tempFechaFin} onChange={(e) => setTempFechaFin(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#5C4033]"
          />
        </div>
        
        {vistaActiva === 'tabla' && (
          <div className="flex items-center space-x-2 bg-amber-50 border border-amber-200 px-3 py-2.5 rounded-xl h-10">
            <input 
              type="checkbox" 
              id="chkExtras"
              checked={tempSoloExtras}
              onChange={(e) => setTempSoloExtras(e.target.checked)}
              className="w-4 h-4 cursor-pointer accent-[#5C4033]"
            />
            <label htmlFor="chkExtras" className="text-xs font-bold text-amber-900 cursor-pointer">
              Solo pedidos con adicionales
            </label>
          </div>
        )}
        
        <button onClick={handleAplicarFiltros} className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold ml-auto cursor-pointer hover:bg-black">
           Aplicar Filtros
        </button>
      </div>

      {/* RENDERIZADO CONDICIONAL: GRÁFICA */}
      {vistaActiva === 'grafica' && (
        <div className="max-w-4xl mx-auto w-full">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs">
            <h3 className="font-bold text-gray-800 mb-6">
              Top 10 Productos Más Vendidos
            </h3>
            
            {cargando ? (
               <div className="h-[320px] flex items-center justify-center text-gray-400 text-sm bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                 Cargando analíticas desde el servidor...
               </div>
            ) : datosGrafica.length > 0 ? (
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={datosGrafica} margin={{ top: 10, right: 30, left: -20, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="nombre" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#6B7280' }} 
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <Tooltip 
                      cursor={{ fill: '#F3F4F6' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [`${value} unidades`, 'Ventas']}
                    />
                    <Bar dataKey="cantidad_total" radius={[6, 6, 0, 0]} maxBarSize={50}>
                      {datosGrafica.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#5C4033' : '#A38A7E'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[320px] flex items-center justify-center text-gray-400 text-sm bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                No hay ventas registradas en este rango de fechas.
              </div>
            )}
          </div>
        </div>
      )}

      {/* RENDERIZADO CONDICIONAL: TABLA */}
      {vistaActiva === 'tabla' && (
        <div className="bg-white border border-gray-200 rounded-3xl shadow-2xs overflow-hidden relative">
          {cargandoDetalle && (
            <div className="absolute top-0 left-0 w-full h-1 bg-gray-100 z-10"><div className="h-full bg-[#5C4033] animate-pulse"></div></div>
          )}

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase">
                <th className="py-4 px-6">Nº Orden</th>
                <th className="py-4 px-6">Fecha</th>
                <th className="py-4 px-6">Usuario (Caja)</th>
                <th className="py-4 px-6">Detalles Generales</th>
                <th className="py-4 px-6 text-right">Total</th>
                <th className="py-4 px-6 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {cargando ? (
                <tr><td colSpan="6" className="py-8 text-center text-gray-400">Cargando base de datos...</td></tr>
              ) : historialVentas.length === 0 ? (
                <tr><td colSpan="6" className="py-8 text-center text-gray-400">No se encontraron ventas.</td></tr>
              ) : (
                historialVentas.map((venta) => (
                  <tr key={venta.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-bold text-gray-900">#{venta.id}</td>
                    <td className="py-4 px-6 text-gray-500 font-mono">
                      {venta.fecha_creacion ? new Date(venta.fecha_creacion).toLocaleString() : '--'}
                    </td>
                    
                    {/* NUEVA CELDA DEL CAJERO CON EL NOMBRE REAL */}
                    <td className="py-4 px-6 font-medium text-gray-800">
                      <span className="bg-gray-100 text-gray-700 px-2.5 py-1.5 rounded-lg border border-gray-200 inline-flex items-center space-x-1.5 shadow-2xs">
                        <span></span>
                        <span>{venta.usuario_nombre || venta.nombre_usuario || venta.cajero || `Cajero #${venta.usuario_id || 'N/A'}`}</span>
                      </span>
                    </td>

                    <td className="py-4 px-6 space-y-1">
                      <div className="text-gray-600 font-medium line-clamp-2">{venta.notas || venta.notas_pedido || 'Sin observaciones'}</div>
                      {tieneExtras(venta) && (
                        <span className="inline-block bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase border border-amber-200 mt-1">
                           Adicional Registrado
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right font-extrabold text-[#5C4033] text-sm">
                      ${Number(venta.total || 0).toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button 
                        onClick={() => handleVerDetalles(venta.id)}
                        disabled={cargandoDetalle}
                        className="text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer disabled:opacity-50"
                      >
                        {cargandoDetalle ? 'Cargando...' : 'Ver Detalle'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL DE DETALLE COMPLETO */}
      {pedidoDetalle && (
         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-3xl w-full max-w-xl p-6 shadow-xl space-y-5 border border-gray-200">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Detalle Completo - Orden #{pedidoDetalle.id}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Gestionado por: <span className="font-bold text-gray-800 uppercase">{pedidoDetalle.usuario_nombre || pedidoDetalle.nombre_usuario || pedidoDetalle.cajero || `Cajero #${pedidoDetalle.usuario_id || 'N/A'}`}</span>
                  </p>
                </div>
                <button onClick={() => setPedidoDetalle(null)} className="text-gray-400 hover:text-gray-700 text-lg font-bold cursor-pointer p-2">✕</button>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Desglose de Compra</h4>
                {!(pedidoDetalle.lineas || pedidoDetalle.items) || (pedidoDetalle.lineas || pedidoDetalle.items).length === 0 ? (
                  <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-red-600 text-xs font-bold">
                    El backend no devolvió el arreglo de productos para esta orden.
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-2xl p-3 space-y-2 border border-gray-100 max-h-[150px] overflow-y-auto">
                    {(pedidoDetalle.lineas || pedidoDetalle.items).map((l, idx) => (
                      <div key={idx} className="flex flex-col text-xs text-gray-800">
                        <div className="flex justify-between">
                          <span>
                            <strong className="text-gray-900">{l.cantidad}x</strong> {l.nombre_producto || l.producto || l.nombre || 'Producto'}
                          </span>
                          <span className="font-mono font-bold shrink-0">${Number(l.subtotal || (l.precio_unitario * l.cantidad) || 0).toFixed(2)}</span>
                        </div>
                        {l.notas && <span className="italic text-gray-500 pl-4 mt-0.5">↳ {l.notas}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {tieneExtras(pedidoDetalle) && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider"> Adicionales Facturados</h4>
                  <div className="bg-amber-50/60 rounded-2xl p-3 border border-amber-200 text-amber-950 text-xs font-medium flex justify-between">
                    <span>{pedidoDetalle.descripcion_extras || pedidoDetalle.extras_descripcion || 'Sin descripción detallada'}</span>
                    <span className="font-mono font-bold">+${Number(pedidoDetalle.total_extras || pedidoDetalle.extras_total || 0).toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t border-gray-100 font-bold text-sm">
                <span className="text-gray-600">Total cobrado ({pedidoDetalle.tipo_pago || 'N/A'})</span>
                <span className="text-[#5C4033] text-lg">${Number(pedidoDetalle.total || 0).toFixed(2)}</span>
              </div>

              <button onClick={() => setPedidoDetalle(null)} className="w-full bg-[#4A3B32] text-white py-3 rounded-2xl font-bold text-xs shadow-sm hover:bg-[#382c25] cursor-pointer transition-colors">
                Cerrar Detalle
              </button>
           </div>
         </div>
      )}
    </div>
  );
}