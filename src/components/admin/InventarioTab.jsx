import React, { useState, useEffect } from 'react';
import { productoService } from '../../services/productoService';
import { cloudinaryService } from '../../services/cloudinaryService';

export default function InventarioTab() {
  const [productos, setProductos] = useState([]);
  const [inactivosCache, setInactivosCache] = useState([]); 
  
  const [verInactivos, setVerInactivos] = useState(false);
  const [cargando, setCargando] = useState(false);
  
  // Estados del Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [modoReactivacion, setModoReactivacion] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [alertaDuplicado, setAlertaDuplicado] = useState(null); 

  // Estados de Imagen (Cloudinary)
  const [imagenFile, setImagenFile] = useState(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    categoria: 'Ice cream',
    descripcion: '',
    imagen_url: '',
    precio: '',
    stock: '',
    disponible: true,
    producto_temporada: false,
  });

  useEffect(() => {
    cargarDatos();
  }, [verInactivos]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const data = verInactivos 
        ? await productoService.obtenerInactivos() 
        : await productoService.obtenerTodos(); 
      
      setProductos(Array.isArray(data) ? data : []);

      // Caché de inactivos para la validación del Punto 8
      if (!verInactivos) {
        const inactivos = await productoService.obtenerInactivos();
        setInactivosCache(Array.isArray(inactivos) ? inactivos : []);
      }
    } catch (error) {
      console.error('Error al cargar inventario:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleAbrirCrear = () => {
    setFormData({ nombre: '', categoria: 'Ice cream', descripcion: '', imagen_url: '', precio: '', stock: '', disponible: true, producto_temporada: false });
    setEditingId(null);
    setModoReactivacion(false);
    setAlertaDuplicado(null);
    setFormError('');
    setImagenFile(null);
    setIsModalOpen(true);
  };

  const handleAbrirEditar = (prod) => {
    setFormData({
      nombre: prod.nombre,
      categoria: prod.categoria || 'Ice cream',
      descripcion: prod.descripcion || '',
      imagen_url: prod.imagen_url || '',
      precio: prod.precio,
      stock: prod.stock,
      disponible: Boolean(prod.disponible),
      producto_temporada: Boolean(prod.producto_temporada),
    });
    setEditingId(prod.id);
    setModoReactivacion(false);
    setAlertaDuplicado(null);
    setFormError('');
    setImagenFile(null);
    setIsModalOpen(true);
  };

  // PUNTO 7: Edición previa a la reactivación
  const handleAbrirReactivar = (prod) => {
    setFormData({
      nombre: prod.nombre,
      categoria: prod.categoria || 'Ice cream',
      descripcion: prod.descripcion || '',
      imagen_url: prod.imagen_url || '',
      precio: prod.precio,
      stock: prod.stock,
      disponible: true, 
      producto_temporada: Boolean(prod.producto_temporada),
    });
    setEditingId(prod.id);
    setModoReactivacion(true);
    setAlertaDuplicado(null);
    setFormError('');
    setImagenFile(null);
    setIsModalOpen(true);
  };

  // PUNTO 8: Validación en tiempo real al escribir (Duplicados)
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    if (formError) setFormError('');

    if (name === 'nombre' && !editingId && !modoReactivacion) {
      const nombreLimpio = value.toLowerCase().trim();
      if (nombreLimpio.length > 2) {
        const coincidencia = inactivosCache.find(p => p.nombre.toLowerCase().trim() === nombreLimpio);
        setAlertaDuplicado(coincidencia || null);
      } else {
        setAlertaDuplicado(null);
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenFile(file);
      if (formError) setFormError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (alertaDuplicado) return; 
    setFormError('');

    try {
      setSubiendoImagen(true);
      let finalImageUrl = formData.imagen_url;

      // Integración Cloudinary: Si hay un archivo seleccionado, lo subimos primero
      if (imagenFile) {
        finalImageUrl = await cloudinaryService.subirImagen(imagenFile);
      }

      const payload = {
        nombre: formData.nombre.trim(),
        categoria: formData.categoria,
        descripcion: formData.descripcion.trim(),
        imagen_url: finalImageUrl || 'https://ciocolatto.com/imagenes/helado.png',
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock, 10),
        disponible: formData.disponible,
        producto_temporada: formData.producto_temporada,
      };

      if (modoReactivacion) {
        await productoService.crearOReactivar(payload); 
      } else if (editingId) {
        await productoService.actualizar(editingId, payload);
      } else {
        await productoService.crearOReactivar(payload);
      }

      setIsModalOpen(false);
      setImagenFile(null);
      cargarDatos();
    } catch (error) {
      setFormError(error.message || 'Error al procesar la solicitud en el servidor.');
      console.error(error);
    } finally {
      setSubiendoImagen(false);
    }
  };

  const handleDesactivar = async (id) => {
    if (!confirm('¿Deseas dar de baja este producto del catálogo?')) return;
    try {
      await productoService.eliminarLogico(id);
      cargarDatos();
    } catch (error) {
      alert('Error al desactivar el producto.');
    }
  };

  return (
    <div className="space-y-4 font-montserrat">
      {/* CABECERA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#003366]">Control y Registro de Inventario</h2>
          <p className="text-xs text-gray-500">Gestión de catálogo, existencias y estados lógicos del sistema.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-[#F8F9FA] p-1 rounded-xl text-xs">
            <button onClick={() => setVerInactivos(false)} className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${!verInactivos ? 'bg-[#003366] text-white shadow-2xs' : 'text-[#333333] hover:text-[#003366]'}`}>
              Activos en Catálogo
            </button>
            <button onClick={() => setVerInactivos(true)} className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${verInactivos ? 'bg-[#003366] text-white shadow-2xs' : 'text-[#333333] hover:text-[#003366]'}`}>
              Papelera / Inactivos
            </button>
          </div>

          {!verInactivos && (
            <button onClick={handleAbrirCrear} className="bg-[#003366] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#002244] cursor-pointer shadow-2xs">
              + Nuevo Producto
            </button>
          )}
        </div>
      </div>

      {/* TABLA */}
      <div className="overflow-x-auto rounded-xl border border-[#F8F9FA]">
        <table className="w-full text-left border-collapse bg-white">
          <thead className="bg-[#F8F9FA]">
            <tr className="border-b border-[#F8F9FA] text-xs text-[#333333] uppercase tracking-wider">
              <th className="py-3 px-4 font-semibold">Producto</th>
              <th className="py-3 px-4 font-semibold">Categoría</th>
              <th className="py-3 px-4 font-semibold">Stock Actual</th>
              <th className="py-3 px-4 font-semibold">Precio</th>
              <th className="py-3 px-4 font-semibold">Estado</th>
              <th className="py-3 px-4 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F8F9FA] text-sm">
            {cargando ? (
              <tr><td colSpan="6" className="text-center py-8 text-gray-400">Cargando datos...</td></tr>
            ) : productos.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-8 text-gray-400">No hay productos en esta sección.</td></tr>
            ) : (
              productos.map((item) => (
                <tr key={item.id} className="hover:bg-[#F8F9FA] transition-colors">
                  <td className="py-4 px-4 font-bold text-[#003366]">
                    <div className="flex items-center space-x-3">
                      {item.imagen_url && <img src={item.imagen_url} alt={item.nombre} className="w-8 h-8 rounded-md object-cover border border-gray-100" />}
                      <div>
                        <div>{item.nombre}</div>
                        <span className="text-xs text-gray-400 font-normal truncate block max-w-[180px]">{item.descripcion}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-[#333333] text-xs font-medium uppercase">{item.categoria || 'N/A'}</td>
                  <td className="py-4 px-4 font-mono font-bold text-[#333333]">{item.stock} u.</td>
                  <td className="py-4 px-4 font-bold text-[#003366]">${Number(item.precio).toFixed(2)}</td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#F8F9FA] text-[#003366] border border-gray-200">
                      {item.activo ? (item.disponible ? 'Disponible' : 'Agotado') : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right space-x-3">
                    {verInactivos ? (
                      <button onClick={() => handleAbrirReactivar(item)} className="text-[#003366] hover:text-[#002244] underline-offset-2 hover:underline text-xs font-bold cursor-pointer">
                        Reactivar y Editar
                      </button>
                    ) : (
                      <>
                        <button onClick={() => handleAbrirEditar(item)} className="text-[#333333] hover:text-[#003366] underline-offset-2 hover:underline text-xs font-bold cursor-pointer">Editar</button>
                        <button onClick={() => handleDesactivar(item.id)} className="text-red-600 hover:text-red-800 underline-offset-2 hover:underline text-xs font-bold cursor-pointer">Desactivar</button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PUNTO 6: REDISEÑO DEL MODAL CON CLOUDINARY */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl p-6 shadow-xl border border-gray-200 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-xl font-bold text-[#003366]">
                {modoReactivacion ? 'Reactivar Producto' : editingId ? 'Editar Producto' : 'Registrar Nuevo Producto'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 text-xl font-bold cursor-pointer">✕</button>
            </div>

            {formError && <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">{formError}</div>}

            {/* PUNTO 8: Alerta de Duplicado */}
            {alertaDuplicado && (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-amber-900"> Este producto fue dado de baja anteriormente.</p>
                  <p className="text-[11px] text-amber-700 mt-0.5">Te sugerimos reactivarlo para conservar el historial de ventas.</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => handleAbrirReactivar(alertaDuplicado)}
                  className="bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-700 cursor-pointer shrink-0"
                >
                  Ir a Reactivar
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Sección 1: Datos Generales e Imagen */}
              <div className="bg-[#F8F9FA] p-4 rounded-2xl border border-gray-100 space-y-3">
                <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">1. Datos Generales</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#333333] mb-1">Nombre</label>
                    <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required className="w-full border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:border-[#003366]" placeholder="Ej. Copa Duraznos" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#333333] mb-1">Categoría</label>
                    <select name="categoria" value={formData.categoria} onChange={handleInputChange} className="w-full border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:border-[#003366] bg-white cursor-pointer">
                      <option value="Ice cream">Ice cream</option>
                      <option value="Frutas">Frutas</option>
                      <option value="Bebidas">Bebidas</option>
                      <option value="Postres">Postres</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#333333] mb-1">Descripción / Ingredientes</label>
                  <input type="text" name="descripcion" value={formData.descripcion} onChange={handleInputChange} required className="w-full border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:border-[#003366]" placeholder="Ej. Duraznos, crema, helado..." />
                </div>
                
                {/* Integración Cloudinary Input File */}
                <div>
                  <label className="block text-xs font-bold text-[#333333] mb-1">Fotografía del Producto</label>
                  <div className="flex items-center gap-3">
                    <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#003366] file:text-white hover:file:bg-[#002244] cursor-pointer" />
                    {formData.imagen_url && !imagenFile && (
                       <img src={formData.imagen_url} alt="Actual" className="w-10 h-10 rounded object-cover border border-gray-200" title="Imagen guardada actualmente" />
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Selecciona una imagen desde tu dispositivo. Se subirá automáticamente al servidor seguro.</p>
                </div>
              </div>

              {/* Sección 2: Inventario y Precio */}
              <div className="bg-[#F8F9FA] p-4 rounded-2xl border border-gray-100 space-y-3">
                <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">2. Inventario y Comercialización</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#333333] mb-1">Precio ($)</label>
                    <input type="number" step="0.01" name="precio" value={formData.precio} onChange={handleInputChange} required className="w-full border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:border-[#003366]" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#333333] mb-1">Stock Actual</label>
                    <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} required className="w-full border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:border-[#003366]" placeholder="0" />
                  </div>
                </div>

                <div className="flex items-center space-x-6 pt-2">
                  <label className="flex items-center space-x-2 text-xs font-bold text-[#333333] cursor-pointer">
                    <input type="checkbox" name="disponible" checked={formData.disponible} onChange={handleInputChange} className="w-4 h-4 accent-[#003366] cursor-pointer" />
                    <span>Disponible en Caja</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs font-bold text-[#333333] cursor-pointer">
                    <input type="checkbox" name="producto_temporada" checked={formData.producto_temporada} onChange={handleInputChange} className="w-4 h-4 accent-[#003366] cursor-pointer" />
                    <span>Item de Temporada</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-xs font-bold text-[#333333] bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer" disabled={subiendoImagen}>
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={alertaDuplicado !== null || subiendoImagen}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-[#003366] hover:bg-[#002244] rounded-xl transition-colors cursor-pointer shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {subiendoImagen ? 'Procesando imagen...' : modoReactivacion ? 'Guardar y Reactivar' : editingId ? 'Actualizar Producto' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}