import React, { useState, useEffect } from 'react';
import { productoService } from '../../services/productoService';
import { cloudinaryService } from '../../services/cloudinaryService';

export default function InventarioTab() {
  const [productos, setProductos] = useState([]);
  const [verInactivos, setVerInactivos] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',
    categoria: 'helados',
    descripcion: '',
    imagen_url: '',
    precio: '',
    stock: '',
    disponible: true,
    producto_temporada: false,
  });

  const cargarProductos = async () => {
    setCargando(true);
    try {
      const data = verInactivos
        ? await productoService.obtenerInactivos()
        : await productoService.obtenerTodos();
      setProductos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar inventario:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, [verInactivos]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    if (formError) setFormError('');
  };

  // Manejo de la subida a Cloudinary
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validación de tipo de archivo
    if (!file.type.startsWith('image/')) {
      setFormError('El archivo seleccionado debe ser una imagen (JPG, PNG, WebP).');
      return;
    }

    setSubiendoImagen(true);
    setFormError('');

    try {
      const urlCloudinary = await cloudinaryService.subirImagen(file);
      setFormData((prev) => ({
        ...prev,
        imagen_url: urlCloudinary,
      }));
    } catch (err) {
      console.error('Error al subir a Cloudinary:', err);
      setFormError('No se pudo subir la imagen a Cloudinary. Verifica las credenciales.');
    } finally {
      setSubiendoImagen(false);
    }
  };

  const handleOpenCrearModal = () => {
    setEditingId(null);
    setFormData({
      nombre: '',
      categoria: 'helados',
      descripcion: '',
      imagen_url: '',
      precio: '',
      stock: '',
      disponible: true,
      producto_temporada: false,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditarModal = (item) => {
    setEditingId(item.id);
    setFormError('');
    setFormData({
      nombre: item.nombre || '',
      categoria: (item.categoria || 'helados').toLowerCase(),
      descripcion: item.descripcion || '',
      imagen_url: item.imagen_url || '',
      precio: item.precio !== undefined ? item.precio : '',
      stock: item.stock !== undefined ? item.stock : '',
      disponible: Boolean(item.disponible),
      producto_temporada: Boolean(item.producto_temporada),
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormError('');

    if (formData.nombre.trim().length < 3) {
      setFormError('El nombre debe tener al menos 3 caracteres.');
      return;
    }
    if (Number(formData.precio) <= 0) {
      setFormError('El precio debe ser mayor a 0.');
      return;
    }
    if (Number(formData.stock) < 0) {
      setFormError('El stock no puede ser negativo.');
      return;
    }

    setGuardando(true);

    const payload = {
      nombre: formData.nombre.trim(),
      categoria: formData.categoria.toLowerCase(),
      descripcion: formData.descripcion.trim() || formData.nombre.trim(),
      imagen_url: formData.imagen_url.trim() || 'https://ciocolatto.com/imagenes/helado.png',
      precio: parseFloat(formData.precio),
      stock: parseInt(formData.stock, 10),
      disponible: Boolean(formData.disponible),
      producto_temporada: Boolean(formData.producto_temporada),
    };

    try {
      if (editingId) {
        await productoService.actualizar(editingId, payload);
        alert('¡Producto actualizado exitosamente con la nueva imagen!');
      } else {
        await productoService.crear(payload);
        alert('¡Producto registrado con éxito en la base de datos!');
      }

      setIsModalOpen(false);
      await cargarProductos();
    } catch (error) {
      console.error('Error al guardar producto:', error.response?.data);
      const backendMsg =
        error.response?.data?.error ||
        error.response?.data?.mensaje ||
        'Error al procesar la solicitud en el servidor.';
      setFormError(backendMsg);
    } finally {
      setGuardando(false);
    }
  };

  const handleToggleDisponibilidad = async (item) => {
    const nuevoEstado = !item.disponible;
    try {
      await productoService.cambiarDisponibilidad(item.id, nuevoEstado);
      setProductos((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, disponible: nuevoEstado } : p))
      );
    } catch (error) {
      alert('Error al cambiar disponibilidad.');
      console.error(error);
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Deseas dar de baja este producto del catálogo?')) return;
    try {
      await productoService.eliminarLogico(id);
      await cargarProductos();
    } catch (error) {
      alert('Error al desactivar el producto.');
      console.error(error);
    }
  };

  const handleReactivar = async (prod) => {
    try {
      await productoService.reactivar({
        nombre: prod.nombre,
        categoria: (prod.categoria || 'helados').toLowerCase(),
        descripcion: prod.descripcion,
        imagen_url: prod.imagen_url,
        precio: parseFloat(prod.precio),
        stock: parseInt(prod.stock, 10),
        disponible: true,
        producto_temporada: Boolean(prod.producto_temporada),
      });
      await cargarProductos();
    } catch (error) {
      alert('Error al reactivar el producto.');
      console.error(error);
    }
  };

  return (
    <div className="space-y-4 font-montserrat">
      {/* Barra superior */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Control y Registro de Inventario</h2>
          <p className="text-xs text-gray-500">Catálogo general, existencias y estados del sistema.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setVerInactivos(false)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                !verInactivos ? 'bg-white shadow-2xs text-gray-900' : 'text-gray-500'
              }`}
            >
              Activos
            </button>
            <button
              onClick={() => setVerInactivos(true)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                verInactivos ? 'bg-white shadow-2xs text-gray-900' : 'text-gray-500'
              }`}
            >
              Papelera / Inactivos
            </button>
          </div>

          {!verInactivos && (
            <button
              onClick={handleOpenCrearModal}
              className="bg-[#5C4033] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#4A3B32] cursor-pointer transition-colors shadow-2xs"
            >
              + Nuevo Producto
            </button>
          )}
        </div>
      </div>

      {/* Tabla de Inventario */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-left border-collapse bg-white">
          <thead className="bg-gray-50">
            <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
              <th className="py-3 px-4 font-semibold">ID</th>
              <th className="py-3 px-4 font-semibold">Foto</th>
              <th className="py-3 px-4 font-semibold">Producto</th>
              <th className="py-3 px-4 font-semibold">Categoría</th>
              <th className="py-3 px-4 font-semibold">Stock</th>
              <th className="py-3 px-4 font-semibold">Precio</th>
              <th className="py-3 px-4 font-semibold">Disponibilidad</th>
              <th className="py-3 px-4 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {cargando ? (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-400">
                  Cargando productos desde la base de datos...
                </td>
              </tr>
            ) : productos.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-400">
                  No hay productos registrados en esta sección.
                </td>
              </tr>
            ) : (
              productos.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 font-mono text-xs text-gray-400">#{item.id}</td>
                  <td className="py-4 px-4">
                    <img
                      src={item.imagen_url || 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500'}
                      alt={item.nombre}
                      className="w-10 h-10 rounded-lg object-cover border border-gray-200 bg-gray-50"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500';
                      }}
                    />
                  </td>
                  <td className="py-4 px-4 font-bold text-gray-900">
                    <div>{item.nombre}</div>
                    <span className="text-xs text-gray-400 font-normal">{item.descripcion}</span>
                  </td>
                  <td className="py-4 px-4 text-gray-600 text-xs capitalize font-medium">
                    {item.categoria || 'Helados'}
                  </td>
                  <td className="py-4 px-4 font-mono font-medium text-gray-700">{item.stock} u.</td>
                  <td className="py-4 px-4 font-bold text-gray-900">${Number(item.precio).toFixed(2)}</td>

                  <td className="py-4 px-4">
                    {!verInactivos ? (
                      <button
                        onClick={() => handleToggleDisponibilidad(item)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                          item.disponible
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                        }`}
                      >
                        ● {item.disponible ? 'Disponible' : 'Agotado'}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">Inactivo</span>
                    )}
                  </td>

                  <td className="py-4 px-4 text-right space-x-3">
                    {verInactivos ? (
                      <button
                        onClick={() => handleReactivar(item)}
                        className="text-emerald-700 hover:text-emerald-900 underline text-xs font-bold cursor-pointer"
                      >
                        Reactivar
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleOpenEditarModal(item)}
                          className="text-gray-500 hover:text-gray-900 underline text-xs font-bold cursor-pointer"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleEliminar(item.id)}
                          className="text-gray-500 hover:text-gray-900 underline text-xs font-bold cursor-pointer"
                        >
                          Desactivar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Crear / Editar con Cloudinary */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-gray-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {editingId ? `Editar Producto #${editingId}` : 'Registrar Nuevo Producto'}
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

            <form onSubmit={handleSubmitForm} className="space-y-3">
              {/* Sección de Carga de Imagen con Cloudinary */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Foto del Producto (Cloudinary)
                </label>
                <div className="flex items-center gap-3">
                  {formData.imagen_url ? (
                    <img
                      src={formData.imagen_url}
                      alt="Vista previa"
                      className="w-14 h-14 rounded-xl object-cover border border-gray-200 shadow-2xs"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400">
                      Sin foto
                    </div>
                  )}

                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={subiendoImagen}
                      className="block w-full text-xs text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#F5EBE6] file:text-[#5C4033] hover:file:bg-[#5C4033] hover:file:text-white cursor-pointer"
                    />
                    {subiendoImagen && (
                      <p className="text-[11px] text-amber-700 font-medium mt-1 animate-pulse">
                        Subiendo imagen a Cloudinary...
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  placeholder="Ej. Copa de Duraznos"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-gray-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Categoría</label>
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-gray-900 outline-none bg-white cursor-pointer"
                  >
                    <option value="helados">Helados</option>
                    <option value="postres">Postres</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    placeholder="25"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-gray-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Descripción</label>
                <input
                  type="text"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  placeholder="Ej. Duraznos, crema y helado artesanal"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-gray-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Precio ($)</label>
                <input
                  type="number"
                  step="0.01"
                  name="precio"
                  value={formData.precio}
                  onChange={handleInputChange}
                  required
                  placeholder="2.50"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-gray-900 outline-none"
                />
              </div>

              <div className="flex items-center space-x-4 pt-1">
                <label className="flex items-center space-x-2 text-xs font-bold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    name="disponible"
                    checked={formData.disponible}
                    onChange={handleInputChange}
                    className="rounded text-gray-900"
                  />
                  <span>Disponible</span>
                </label>
                <label className="flex items-center space-x-2 text-xs font-bold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    name="producto_temporada"
                    checked={formData.producto_temporada}
                    onChange={handleInputChange}
                    className="rounded text-gray-900"
                  />
                  <span>Temporada</span>
                </label>
              </div>

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
                  disabled={guardando || subiendoImagen}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#5C4033] hover:bg-[#4A3B32] rounded-xl transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                >
                  {subiendoImagen
                    ? 'Subiendo imagen...'
                    : guardando
                    ? 'Guardando en BD...'
                    : editingId
                    ? 'Guardar Cambios'
                    : 'Guardar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}