import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export default function PrediccionTab() {
  const [estadoIA, setEstadoIA] = useState({ disponible: null, motor: null });
  const [cargando, setCargando] = useState(false);
  const [datosPrediccion, setDatosPrediccion] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  const [dias, setDias] = useState(7);
  const [categoria, setCategoria] = useState('');
  const [limite, setLimite] = useState(10);

  useEffect(() => {
    verificarEstadoIA();
  }, []);

  useEffect(() => {
    cargarPredicciones();
  }, [dias, categoria, limite]);

  const verificarEstadoIA = async () => {
    try {
      const response = await api.get('/predicciones/estado');
      setEstadoIA({
        disponible: response.data.ia_disponible,
        motor: response.data.motor
      });
    } catch (error) {
      console.error("Error al verificar estado de IA:", error);
      setEstadoIA({ disponible: false, motor: null });
    }
  };

  const cargarPredicciones = async () => {
    setCargando(true);
    try {
      const params = { dias, limite };
      if (categoria) params.categoria = categoria;

      const response = await api.get('/predicciones', { params });
      setDatosPrediccion(response.data);
      
      if (response.data.productos?.length > 0) {
        setProductoSeleccionado(response.data.productos[0]);
      } else {
        setProductoSeleccionado(null);
      }
    } catch (error) {
      console.error("Error al cargar predicciones:", error);
    } finally {
      setCargando(false);
    }
  };

  const renderBadgeEstrategia = (estrategia) => {
    const badges = {
      auto_ets: { color: "bg-green-100 text-green-800", texto: "IA Estacional" },
      temporada: { color: "bg-yellow-100 text-yellow-800", texto: "Temporada corta" },
      pocos_datos: { color: "bg-gray-100 text-blue-800", texto: "En evaluación" },
      respaldo_local: { color: "bg-orange-100 text-orange-800", texto: "Estimación local" }
    };
    const badge = badges[estrategia] || { color: "bg-gray-100 text-gray-800", texto: estrategia };
    
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${badge.color}`}>
        {badge.texto}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white border border-gray-200 rounded-3xl p-5 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-[#003366]">Proyección de Demanda</h2>
          <p className="text-xs text-gray-500 mt-1">Estimación automática de ventas futuras.</p>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          {datosPrediccion?.modelo_activo === false && (
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200">
              ⚠️ Modo respaldo estadístico
            </span>
          )}
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
            {/* AQUÍ ESTABA EL ERROR SINTÁCTICO - YA ESTÁ CORREGIDO */}
            <div className={`w-2.5 h-2.5 rounded-full ${estadoIA.disponible ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
            <span className="text-xs font-bold text-gray-700">
              {estadoIA.disponible ? `Motor IA Activo: ${estadoIA.motor}` : 'Motor IA Offline'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Días a predecir</label>
          <select value={dias} onChange={(e) => setDias(Number(e.target.value))} className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-[#003366]">
            <option value={7}>Próximos 7 días</option>
            <option value={14}>Próximos 14 días</option>
            <option value={30}>Próximos 30 días</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Categoría</label>
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-[#003366]">
            <option value="">Todo el catálogo</option>
            <option value="helados">Helados</option>
            <option value="postres">Postres</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Top N Productos</label>
          <select value={limite} onChange={(e) => setLimite(Number(e.target.value))} className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-[#003366]">
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
            <option value={20}>Top 20</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-3xl p-5 shadow-sm h-[500px] overflow-y-auto">
          <h3 className="font-bold text-gray-800 mb-4 text-sm">Mayor Demanda Esperada</h3>
          {cargando ? (
             <div className="text-center text-gray-400 text-xs py-10">Calculando predicciones...</div>
          ) : (
            <div className="space-y-3">
              {datosPrediccion?.productos?.map((prod) => (
                <div 
                  key={prod.producto_id} 
                  onClick={() => setProductoSeleccionado(prod)}
                  className={`p-3 rounded-2xl cursor-pointer border transition-all ${productoSeleccionado?.producto_id === prod.producto_id ? 'border-[#003366] bg-blue-50/50' : 'border-gray-100 bg-white hover:border-gray-300'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-gray-800 text-sm">{prod.nombre_producto}</span>
                    <span className="font-extrabold text-[#003366]">{prod.total_esperado} u.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {renderBadgeEstrategia(prod.estrategia)}
                    {prod.producto_temporada && <span className="text-[10px] text-gray-500">Temp.</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm h-[500px] flex flex-col">
          {productoSeleccionado ? (
            <>
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{productoSeleccionado.nombre_producto}</h3>
                  <p className="text-xs text-gray-500">
                    Demanda esperada ({dias} días): <strong className="text-[#003366]">{productoSeleccionado.total_esperado} unidades</strong>
                  </p>
                </div>
                {renderBadgeEstrategia(productoSeleccionado.estrategia)}
              </div>
              
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={productoSeleccionado.predicciones} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: '#6B7280' }} tickFormatter={(val) => val.slice(5)} />
                    <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelFormatter={(label) => `Fecha: ${label}`}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    
                    <Area 
                      type="monotone" 
                      dataKey="maximo" 
                      stroke="none" 
                      fill="#5c7ce7" 
                      name="Rango Máximo (80%)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="minimo" 
                      stroke="none" 
                      fill="#aa83e9" 
                      name="Rango Mínimo" 
                    />
                    
                    <Line 
                      type="monotone" 
                      dataKey="cantidad_esperada" 
                      stroke="#003366" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#003366', strokeWidth: 2, stroke: '#FFF' }}
                      activeDot={{ r: 6 }}
                      name="Demanda Esperada" 
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
             <div className="h-full flex items-center justify-center text-gray-400 text-sm">
               Selecciona un producto para visualizar su proyección.
             </div>
          )}
        </div>

      </div>
    </div>
  );
}