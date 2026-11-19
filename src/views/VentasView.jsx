import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { productoService } from '../services/productoService';
import { pedidoService } from '../services/pedidoService';
import { ticketService } from '../services/ticketService';
import { authService } from '../services/authService';
import imgLupa from '../assets/lupa.png';

// Componentes modulares
import OrderProgressBar from '../components/ventas/OrderProgressBar';
import CategoryFilter from '../components/ventas/CategoryFilter';
import ProductGrid from '../components/ventas/ProductGrid';
import OrderSidebar from '../components/ventas/OrderSidebar';
import RecentOrdersModal from '../components/ventas/RecentOrdersModal';


const socketHost =
  (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '') || window.location.origin;

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

  // Extras opcionales (incluirá el empaque automático de $0.50 si es para llevar)
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
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');

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
      console.warn(' Error de conexión Socket en Ventas:', err.message);
    });

    socket.on('ticket_actualizado', (data) => {
      console.log(' [Caja] Evento ticket_actualizado recibido:', data);

      if (!data) return;

      const pedidoIdRecibido = data.pedido_id ? Number(data.pedido_id) : null;
      const ticketIdRecibido = (data.ticket_id || data.id) ? Number(data.ticket_id || data.id) : null;
      const estadoActualizado = (data.estado || data.nuevoEstado || '').toLowerCase().trim();

      if (!estadoActualizado) return;

      setUltimoPedido((prev) => {
        if (!prev) return prev;
        const coincide =
          (pedidoIdRecibido && Number(prev.id) === pedidoIdRecibido) ||
          (ticketIdRecibido && Number(prev.ticket_id) === ticketIdRecibido) ||
          (Number(prev.id) === ticketIdRecibido);

        return coincide ? { ...prev, estado: estadoActualizado } : prev;
      });

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

  // 3. Recargo automático de $0.50 al seleccionar "Para llevar"
  const handleOrderTypeChange = (type) => {
    setOrderType(type);
    if (type === "para-llevar") {
      if (!extrasList.find((e) => e.id === 'empaque-llevar')) {
        setExtrasList((prev) => [
          ...prev,
          { id: 'empaque-llevar', nombre: 'Tarrina / Empaque (Para llevar)', precio: 0.50 }
        ]);
      }
    } else {
      setExtrasList((prev) => prev.filter((e) => e.id !== 'empaque-llevar'));
    }
  };

  // Manejo de Carrito
  const handleAddToCart = (product) => {
    if (!product.disponible) {
      alert("Este producto se encuentra agotado temporalmente.");
      return;
    }

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

  // Manejo de Extras Adicionales Manuales
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

  // Confirmar Pedido a Cocina: POST /api/pedidos
  const handleSendToKitchen = async () => {
    if (cart.length === 0) {
      alert("La orden está vacía. Añade al menos un producto.");
      return;
    }

    setEnviando(true);
    const tieneExtras = extrasList.length > 0;

    const payload = {
      items: cart.map((item) => ({
        producto_id: item.producto_id || item.id,
        cantidad: item.cantidad || item.qty,
        notas: item.notas || ''
      })),
      extras: tieneExtras,
      total_extras: tieneExtras ? parseFloat(totalExtras.toFixed(2)) : 0,
      descripcion_extras: tieneExtras ? descripcionExtras : "",
      tipo_pago: tipoPago,
      notas: `${orderType === 'comer-aqui' ? '[Comer aquí]' : '[Para llevar]'} ${kitchenNote}`.trim(),
    };

    try {
      const response = await pedidoService.crearPedido(payload);

      const pedidoGuardado = {
        id: response.id,
        estado: 'pendiente',
        total: totalGeneral,
        tipo: orderType,
        itemsCount: totalItems,
      };

      setUltimoPedido(pedidoGuardado);
      setCart([]);
      setExtrasList([]);
      setKitchenNote('');
      setOrderType('comer-aqui');
    } catch (error) {
      console.error('Error al registrar pedido:', error.response?.data);
      alert('Error al conectar con la API de pedidos.');
    } finally {
      setEnviando(false);
    }
  };

  // Consultar Órdenes Recientes cruzando con el endpoint de TICKETS
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

      const [pedidosData, ticketsActivos, ticketsDespachados] = await Promise.all([
        pedidoService.obtenerPedidosPorUsuario(userId).catch(() => []),
        ticketService.obtenerTicketsActivos().catch(() => []),
        ticketService.obtenerTicketsDespachados().catch(() => [])
      ]);

      const todosLosTickets = [
        ...(Array.isArray(ticketsActivos) ? ticketsActivos : []),
        ...(Array.isArray(ticketsDespachados) ? ticketsDespachados : [])
      ];

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
            <span> Órdenes Recientes</span>
          </button>
        </div>

        {/* Monitor en vivo de la última orden enviada */}
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

        <CategoryFilter
          categories={["Todos", "Helados", "Postres", "Temporada"]}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <ProductGrid
          cargando={cargando}
          products={filteredProducts}
          onAddToCart={handleAddToCart}
        />
      </div>

      {/* Columna Derecha: Orden Actual / Carrito */}
      <OrderSidebar
        tipoPago={tipoPago}
        setTipoPago={setTipoPago}
        orderType={orderType}
        onOrderTypeChange={handleOrderTypeChange}
        cart={cart}
        totalItems={totalItems}
        onRemoveItem={handleRemoveItem}
        onUpdateQty={handleUpdateQty}
        onUpdateItemNote={handleUpdateItemNote}
        extrasList={extrasList}
        mostrarFormExtra={mostrarFormExtra}
        setMostrarFormExtra={setMostrarFormExtra}
        nuevoExtraNombre={nuevoExtraNombre}
        setNuevoExtraNombre={setNuevoExtraNombre}
        nuevoExtraPrecio={nuevoExtraPrecio}
        setNuevoExtraPrecio={setNuevoExtraPrecio}
        onAgregarExtra={handleAgregarExtra}
        onEliminarExtra={handleEliminarExtra}
        kitchenNote={kitchenNote}
        setKitchenNote={setKitchenNote}
        subtotalProductos={subtotalProductos}
        totalExtras={totalExtras}
        totalGeneral={totalGeneral}
        enviando={enviando}
        onSendToKitchen={handleSendToKitchen}
      />

      {/* Modal de Historial de Órdenes */}
      <RecentOrdersModal
        isOpen={modalOrdenesOpen}
        onClose={() => setModalOrdenesOpen(false)}
        cargandoOrdenes={cargandoOrdenes}
        ordenesRecientes={ordenesRecientes}
      />
    </div>
  );
}