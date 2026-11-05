import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import ProductCard from '../components/ventas/ProductCard';
import { productoService } from '../services/productoService';
import { pedidoService } from '../services/pedidoService';
import { ticketService } from '../services/ticketService';
import { authService } from '../services/authService';
import imgLupa from '../assets/lupa.png';

// Host dinámico del socket para desarrollo o producción en Azure
const socketHost =
  (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '') || window.location.origin;

// Barra visual de progreso para los 3 estados del pedido
function OrderProgressBar({ estado }) {
  const raw = (estado || 'pendiente')
    .toLowerCase()
    .replace('ó', 'o')
    .replace(' ', '_')
    .trim();

  let pasoActivo = 1;
  let colorFondo = 'bg-amber-500';
  let anchoBarra = '33%';

  if (raw === 'en_preparacion' || raw.includes('preparaci')) {
    pasoActivo = 2;
    colorFondo = 'bg-blue-600';
    anchoBarra = '66%';
  } else if (raw === 'listo' || raw === 'entregado' || raw.includes('list')) {
    pasoActivo = 3;
    colorFondo = 'bg-emerald-600';
    anchoBarra = '100%';
  }

  return (
    <div className="w-full space-y-1.5 py-1">
      <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden relative">
        <div
          className={`h-full transition-all duration-700 ease-out rounded-full ${colorFondo}`}
          style={{ width: anchoBarra }}
        ></div>
      </div>

      <div className="flex justify-between text-[11px] font-bold">
        <span className={pasoActivo >= 1 ? 'text-amber-700 font-extrabold' : 'text-gray-400'}>
          ● Pendiente
        </span>
        <span className={pasoActivo >= 2 ? 'text-blue-700 font-extrabold' : 'text-gray-400'}>
          ● En preparación
        </span>
        <span className={pasoActivo >= 3 ? 'text-emerald-700 font-extrabold' : 'text-gray-400'}>
          ● Listo
        </span>
      </div>
    </div>
  );
}

export default function VentasView() {
  const [productsData, setProductsData] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [orderType, setOrderType] = useState("comer-aqui");
  const [tipoPago, setTipoPago] = useState("Efectivo");
  const [cart, setCart] = useState([]);
  const [kitchenNote, setKitchenNote] = useState("");

  // Extras opcionales
  const [extrasList, setExtrasList] = useState([]);
  const [mostrarFormExtra, setMostrarFormExtra] = useState(false);
  const [nuevoExtraNombre, setNuevoExtraNombre] = useState('');
  const [nuevoExtraPrecio, setNuevoExtraPrecio] = useState('');

  // Modal y monitoreo
  const [modalOrdenesOpen, setModalOrdenesOpen] = useState(false);
  const [ordenesRecientes, setOrdenesRecientes] = useState([]);
  const [cargandoOrdenes, setCargandoOrdenes] = useState(false);
  const [ultimoPedido, setUltimoPedido] = useState(null);

  // 1. Cargar catálogo de productos
  const fetchProductos = async () => {
    setCargando(true);
    try {
      const data = productoService.obtenerTodos 
        ? await productoService.obtenerTodos() 
        : await productoService.obtenerActivos();
      setProductsData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar catálogo de productos:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  // 2. Conexión WebSocket para sincronización en tiempo real con Cocina
  useEffect(() => {
    const token = sessionStorage.getItem('token') 

    const socket = io(socketHost, {
      auth: { token },
      transports: ['polling', 'websocket'],
      upgrade: true,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log(' Socket conectado en Caja/Ventas con ID:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('Error de conexión Socket en Ventas:', err.message);
    });

    // Escuchar cuando Cocina actualiza el estado de una comanda
    socket.on('ticket_actualizado', (data) => {
      console.log('[Caja] Evento ticket_actualizado recibido:', data);

      if (!data) return;

      const pedidoIdRecibido = data.pedido_id ? Number(data.pedido_id) : null;
      const ticketIdRecibido = (data.ticket_id || data.id) ? Number(data.ticket_id || data.id) : null;
      const estadoActualizado = (data.estado || data.nuevoEstado || '').toLowerCase().trim();

      if (!estadoActualizado) return;

      // Actualizar tarjeta del último pedido en pantalla
      setUltimoPedido((prev) => {
        if (!prev) return prev;

        const coincide =
          (pedidoIdRecibido && Number(prev.id) === pedidoIdRecibido) ||
          (ticketIdRecibido && Number(prev.ticket_id) === ticketIdRecibido) ||
          (Number(prev.id) === ticketIdRecibido);

        if (coincide) {
          return { ...prev, estado: estadoActualizado };
        }
        return prev;
      });

      // Actualizar la lista en el modal de órdenes recientes
      setOrdenesRecientes((prevList) =>
        prevList.map((ord) => {
          const match =
            (pedidoIdRecibido && Number(ord.id) === pedidoIdRecibido) ||
            (ticketIdRecibido && Number(ord.ticket_id) === ticketIdRecibido) ||
            (Number(ord.id) === ticketIdRecibido);

          return match ? { ...ord, estado: estadoActualizado } : ord;
        })
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Manejo de Carrito
  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.producto_id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.producto_id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [
        ...prevCart,
        {
          producto_id: product.id,
          nombre: product.nombre || product.name,
          descripcion: product.descripcion || product.desc || '',
          precio: Number(product.precio || 0),
          cantidad: 1,
          notas: '',
        },
      ];
    });
  };

  const handleUpdateQty = (producto_id, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.producto_id === producto_id) {
            const nuevaCantidad = item.cantidad + delta;
            return nuevaCantidad > 0 ? { ...item, cantidad: nuevaCantidad } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const handleUpdateItemNote = (producto_id, notas) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.producto_id === producto_id ? { ...item, notas } : item
      )
    );
  };

  const handleRemoveItem = (producto_id) => {
    setCart((prevCart) => prevCart.filter((item) => item.producto_id !== producto_id));
  };

  // Manejo de Extras Adicionales
  const handleAgregarExtra = (e) => {
    e.preventDefault();
    if (!nuevoExtraNombre.trim()) {
      alert("Por favor ingresa la descripción del extra.");
      return;
    }
    const precioNum = parseFloat(nuevoExtraPrecio);
    if (isNaN(precioNum) || precioNum < 0) {
      alert("Ingresa un precio válido mayor o igual a 0.");
      return;
    }

    setExtrasList([
      ...extrasList,
      {
        id: Date.now(),
        nombre: nuevoExtraNombre.trim(),
        precio: precioNum,
      },
    ]);

    setNuevoExtraNombre('');
    setNuevoExtraPrecio('');
    setMostrarFormExtra(false);
  };

  const handleEliminarExtra = (id) => {
    setExtrasList(extrasList.filter((item) => item.id !== id));
  };

  // Filtrado del catálogo
  const filteredProducts = productsData.filter((prod) => {
    const nombre = (prod.nombre || prod.name || '').toLowerCase();
    const desc = (prod.descripcion || prod.desc || '').toLowerCase();
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || nombre.includes(query) || desc.includes(query);

    const cat = (prod.categoria || prod.categoría || '').toLowerCase().trim();
    let matchesCategory = true;

    if (selectedCategory === "Temporada") {
      matchesCategory = Boolean(prod.producto_temporada);
    } else if (selectedCategory === "Helados") {
      matchesCategory = cat.includes("helad");
    } else if (selectedCategory === "Postres") {
      matchesCategory = cat.includes("postr");
    }

    return matchesSearch && matchesCategory;
  });

  const subtotalProductos = cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const totalExtras = extrasList.reduce((acc, item) => acc + item.precio, 0);
  const descripcionExtras = extrasList.map((ex) => `${ex.nombre} ($${ex.precio.toFixed(2)})`).join(', ');
  const totalGeneral = subtotalProductos + totalExtras;
  const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);

  // 3. Confirmar Pedido y mandarlo a Cocina: POST /api/pedidos
  const handleSendToKitchen = async () => {
    if (cart.length === 0) {
      alert("La orden está vacía. Añade al menos un producto.");
      return;
    }

    setEnviando(true);

    const payload = {
      items: cart.map((item) => ({
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        notas: item.notas || '',
      })),
      total_extras: parseFloat(totalExtras.toFixed(2)),
      descripcion_extras: descripcionExtras || (orderType === 'para-llevar' ? 'Para llevar' : 'Sin extras'),
      tipo_pago: tipoPago,
      notas: `${orderType === 'comer-aqui' ? '[Comer aquí]' : '[Para llevar]'} ${kitchenNote}`.trim(),
    };

    try {
      const response = await pedidoService.crearPedido(payload);
      
      const nuevoPedido = {
        id: response.id,
        estado: 'pendiente',
        total: totalGeneral,
        tipo: orderType,
        itemsCount: totalItems,
      };
      setUltimoPedido(nuevoPedido);
      setOrdenesRecientes((prev) => [nuevoPedido, ...prev]);

      setCart([]);
      setExtrasList([]);
      setKitchenNote('');
    } catch (error) {
      console.error('Error al registrar pedido:', error.response?.data);
      const msg = error.response?.data?.error || error.response?.data?.mensaje || 'Error al conectar con la API de pedidos.';
      alert(msg);
    } finally {
      setEnviando(false);
    }
  };

  // 4. Consultar Órdenes Recientes cruzando con el endpoint de TICKETS
  const handleAbrirOrdenesRecientes = async () => {
    setModalOrdenesOpen(true);
    setCargandoOrdenes(true);
    try {
      const usuario = authService.getUsuarioActual();
      const userId = usuario?.id || usuario?.usuario_id;

      if (!userId) {
        setOrdenesRecientes([]);
        return;
      }

      // Consultar pedidos y tickets en paralelo
      const [pedidosData, ticketsActivos, ticketsDespachados] = await Promise.all([
        pedidoService.obtenerPedidosPorUsuario(userId).catch(() => []),
        ticketService.obtenerTicketsActivos().catch(() => []),
        ticketService.obtenerTicketsDespachados().catch(() => [])
      ]);

      const todosLosTickets = [
        ...(Array.isArray(ticketsActivos) ? ticketsActivos : []),
        ...(Array.isArray(ticketsDespachados) ? ticketsDespachados : [])
      ];

      // Cruzar el pedido con el estado de su ticket correspondiente
      const pedidosConEstadoReal = (Array.isArray(pedidosData) ? pedidosData : []).map((ped) => {
        const ticketAsociado = todosLosTickets.find(
          (t) => Number(t.pedido_id) === Number(ped.id)
        );

        return {
          ...ped,
          ticket_id: ticketAsociado?.ticket_id || ticketAsociado?.id,
          estado: ticketAsociado ? ticketAsociado.estado : 'pendiente'
        };
      });

      setOrdenesRecientes(pedidosConEstadoReal);

      // Si existe un último pedido registrado en la vista, actualizar también su estado
      setUltimoPedido((prev) => {
        if (!prev) return prev;
        const ticketDelUltimo = todosLosTickets.find(
          (t) => Number(t.pedido_id) === Number(prev.id)
        );
        return ticketDelUltimo ? { ...prev, estado: ticketDelUltimo.estado } : prev;
      });

    } catch (error) {
      console.error('Error al sincronizar historial y estado de pedidos:', error);
    } finally {
      setCargandoOrdenes(false);
    }
  };

  return (
    <div className="p-6 max-w-[1440px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 font-montserrat">
      {/* Columna Izquierda: Menú y Catálogo */}
      <div className="lg:col-span-8 flex flex-col space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-950">Ventas</h1>
            <p className="text-gray-500 text-sm mt-1">Crea una orden y mándala directo a la cocina.</p>
          </div>
          <button 
            onClick={handleAbrirOrdenesRecientes}
            className="flex items-center space-x-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-2xs cursor-pointer"
          >
            <span>📄 Órdenes Recientes</span>
          </button>
        </div>

        {/* MONITOR EN VIVO DE LA ÚLTIMA ORDEN ENVIADA */}
        {ultimoPedido && (
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-gray-900">
                Seguimiento en vivo: Pedido #{ultimoPedido.id}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                ultimoPedido.estado === 'listo' || ultimoPedido.estado === 'entregado'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse'
                  : ultimoPedido.estado === 'en_preparacion'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {ultimoPedido.estado || 'Pendiente'}
              </span>
            </div>
            <OrderProgressBar estado={ultimoPedido.estado} />
          </div>
        )}

        {/* Buscador */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <img src={imgLupa} alt="Buscar" className="w-4 h-4 object-contain opacity-50" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar producto..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5C4033] shadow-2xs font-montserrat"
          />
        </div>

        {/* Filtros de Categorías */}
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {["Todos", "Helados", "Postres", "Temporada"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer capitalize ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? "bg-[#5C4033] text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {cat === "Temporada" ? "Temporada" : cat}
            </button>
          ))}
        </div>

        {/* Retícula de Productos */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">Menú</h3>
            <span className="text-xs text-gray-400 font-medium">
              {cargando ? 'Cargando...' : `${filteredProducts.length} productos disponibles`}
            </span>
          </div>

          {cargando ? (
            <div className="p-16 text-center text-gray-400 text-sm">
              Cargando catálogo desde la base de datos...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-16 text-center text-gray-400 text-sm bg-white border border-gray-200 rounded-2xl">
              No hay productos que coincidan con la búsqueda.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredProducts.map((prod) => (
                <ProductCard 
                  key={prod.id} 
                  product={prod} 
                  onAddToCart={handleAddToCart} 
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Columna Derecha: Orden Actual / Carrito */}
      <div className="lg:col-span-4 bg-white border border-gray-200 rounded-3xl p-6 flex flex-col justify-between shadow-2xs">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Orden Actual</h2>
            <span className="text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg">
              {tipoPago}
            </span>
          </div>

          {/* Selector de consumo */}
          <div className="grid grid-cols-2 bg-gray-100 p-1 rounded-xl mb-4">
            <button
              onClick={() => setOrderType("comer-aqui")}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                orderType === "comer-aqui" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Comer aquí
            </button>
            <button
              onClick={() => setOrderType("para-llevar")}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                orderType === "para-llevar" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Para llevar
            </button>
          </div>

          {/* Selector de Método de Pago */}
          <div className="mb-4">
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Método de Pago
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Efectivo', 'Transferencia', 'Tarjeta'].map((metodo) => (
                <button
                  key={metodo}
                  type="button"
                  onClick={() => setTipoPago(metodo)}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    tipoPago === metodo
                      ? 'bg-[#5C4033] text-white border-[#5C4033]'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {metodo}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-400 font-medium mb-3">{cart.length} productos - {totalItems} ítems</p>

          {/* Lista de productos en el carrito */}
          <div className="space-y-3 max-h-[230px] overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-xs">
                Selecciona productos del menú para armar la orden.
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.producto_id} className="p-3 bg-gray-50 border border-gray-100 rounded-2xl relative group">
                  <button
                    onClick={() => handleRemoveItem(item.producto_id)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-sm font-bold cursor-pointer"
                  >
                    ×
                  </button>
                  <h4 className="font-bold text-sm text-gray-900 pr-6">{item.nombre}</h4>
                  <p className="text-[11px] text-gray-500 mb-2">{item.descripcion}</p>

                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-2 py-1 shadow-3xs">
                      <button onClick={() => handleUpdateQty(item.producto_id, -1)} className="text-gray-500 hover:text-black font-bold px-1 cursor-pointer">−</button>
                      <span className="text-xs font-bold text-gray-800 w-4 text-center">{item.cantidad}</span>
                      <button onClick={() => handleUpdateQty(item.producto_id, 1)} className="text-gray-500 hover:text-black font-bold px-1 cursor-pointer">+</button>
                    </div>
                    <span className="font-bold text-sm text-gray-900">${(item.precio * item.cantidad).toFixed(2)}</span>
                  </div>

                  <input
                    type="text"
                    placeholder="Instrucción específica (ej. en cono)"
                    value={item.notas}
                    onChange={(e) => handleUpdateItemNote(item.producto_id, e.target.value)}
                    className="w-full text-[11px] bg-white border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-gray-400"
                  />
                </div>
              ))
            )}
          </div>

          {/* Extras Opcionales */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                Adicionales / Extras
              </span>
              <button
                type="button"
                onClick={() => setMostrarFormExtra(!mostrarFormExtra)}
                className="text-xs font-bold text-[#5C4033] hover:underline cursor-pointer"
              >
                {mostrarFormExtra ? '✕ Cerrar' : '+ Agregar Extra'}
              </button>
            </div>

            {mostrarFormExtra && (
              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 space-y-2 mb-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ej. Extra queso, cono waffle"
                    value={nuevoExtraNombre}
                    onChange={(e) => setNuevoExtraNombre(e.target.value)}
                    className="flex-1 text-xs bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-gray-800"
                  />
                  <input
                    type="number"
                    step="0.05"
                    placeholder="$0.50"
                    value={nuevoExtraPrecio}
                    onChange={(e) => setNuevoExtraPrecio(e.target.value)}
                    className="w-20 text-xs bg-white border border-gray-300 rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-gray-800"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAgregarExtra}
                  className="w-full bg-[#5C4033] text-white text-xs font-bold py-1.5 rounded-lg hover:bg-[#4A3B32] transition-colors cursor-pointer"
                >
                  Confirmar Adicional
                </button>
              </div>
            )}

            {extrasList.length > 0 && (
              <div className="space-y-1.5 max-h-[100px] overflow-y-auto">
                {extrasList.map((extra) => (
                  <div
                    key={extra.id}
                    className="flex justify-between items-center text-xs bg-amber-50/70 border border-amber-200/80 px-2.5 py-1 rounded-lg"
                  >
                    <span className="text-amber-950 font-medium"> {extra.nombre}</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-amber-900">+${extra.precio.toFixed(2)}</span>
                      <button
                        type="button"
                        onClick={() => handleEliminarExtra(extra.id)}
                        className="text-gray-400 hover:text-red-500 font-bold ml-1 cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Nota general de la comanda */}
          <div className="mt-3">
            <input
              type="text"
              placeholder="📝 Nota general (ej. Cliente en mesa 4)"
              value={kitchenNote}
              onChange={(e) => setKitchenNote(e.target.value)}
              className="w-full text-xs text-gray-700 bg-gray-50 border border-gray-200 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C4033] font-montserrat"
            />
          </div>
        </div>

        {/* Resumen de Totales y Envío */}
        <div className="pt-4 border-t border-gray-100 mt-4 space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Subtotal productos</span>
            <span className="font-medium text-gray-800">${subtotalProductos.toFixed(2)}</span>
          </div>

          {totalExtras > 0 && (
            <div className="flex justify-between text-xs text-amber-800 font-medium">
              <span>Extras ({extrasList.length})</span>
              <span className="font-bold">+${totalExtras.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-lg font-bold text-gray-900 pt-1 border-t border-gray-100">
            <span>Total</span>
            <span className="text-xl text-[#5C4033]">${totalGeneral.toFixed(2)}</span>
          </div>

          <button
            onClick={handleSendToKitchen}
            disabled={enviando}
            className="w-full bg-[#4A3B32] hover:bg-[#382c25] text-white py-3.5 rounded-2xl font-bold text-sm shadow-md transition-colors cursor-pointer disabled:opacity-50 mt-1"
          >
            {enviando ? 'Registrando en Servidor...' : 'Confirmar y enviar a la cocina'}
          </button>
        </div>
      </div>

      {/* Modal de Historial de Órdenes */}
      {modalOrdenesOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-xl border border-gray-200 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Historial y Estado de Órdenes</h3>
              <button
                onClick={() => setModalOrdenesOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[440px] overflow-y-auto space-y-3">
              {cargandoOrdenes ? (
                <p className="text-center py-6 text-gray-400 text-sm">Consultando pedidos...</p>
              ) : ordenesRecientes.length === 0 ? (
                <p className="text-center py-6 text-gray-400 text-sm">No se encontraron pedidos recientes registrados.</p>
              ) : (
                ordenesRecientes.map((ped) => (
                  <div key={ped.id} className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-900">Pedido #{ped.id}</span>
                      <span className="text-gray-500 font-mono">
                        {ped.fecha_creacion
                          ? new Date(ped.fecha_creacion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : ''}
                      </span>
                    </div>

                    {/* Barra de progreso con el estado real obtenido del ticket */}
                    <OrderProgressBar estado={ped.estado} />

                    <div className="text-xs text-gray-600">
                      {ped.lineas?.map((l) => (
                        <div key={l.id} className="flex justify-between">
                          <span>{l.cantidad}x {l.nombre_producto} {l.notas ? `(${l.notas})` : ''}</span>
                          <span className="font-mono">${Number(l.subtotal).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {ped.total_extras > 0 && (
                      <div className="text-[11px] text-amber-700 font-medium">
                        Adicionales: {ped.descripcion_extras} (+${Number(ped.total_extras).toFixed(2)})
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-xs font-bold">
                      <span className="text-gray-600">Pago: {ped.tipo_pago}</span>
                      <span className="text-[#5C4033] text-sm">${Number(ped.total).toFixed(2)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}