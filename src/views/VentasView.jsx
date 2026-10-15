import React, { useState } from 'react';
import ProductCard from '../components/ventas/ProductCard';

// Importación de las imágenes locales desde la carpeta assets
import imgCopaDuraznos from '../assets/copaDuraznos.jpg';
import imgBandejaFrutas from '../assets/bandejaFrutas.jpg';
import imgFresasCrema from '../assets/fresasConCrema.jpg';
import imgCapuccino from '../assets/Capuccino.jpg';
import imgFresasQueso from '../assets/fresasConCremaQueso.jpg';
import imgCafeHuma from '../assets/cafeConHuma.jpg';

const PRODUCTS_DATA = [
  { id: 1, name: "Copa Duraznos", category: "Ice cream", stock: "In stock", stockStatus: "green", desc: "Duraznos - Queso - Crema - Helado", price: 2.50, image: imgCopaDuraznos },
  { id: 2, name: "Bandeja de frutas", category: "Frutas", stock: "In stock", stockStatus: "green", desc: "3 sabores de helado - Frutas - Queso - Crema", price: 2.50, image: imgBandejaFrutas },
  { id: 3, name: "Fresas con crema", category: "Frutas", stock: "Low stock - 8 left", stockStatus: "orange", desc: "Frutillas - Crema", price: 1.75, image: imgFresasCrema },
  { id: 4, name: "Capuccino", category: "Bebidas", stock: "In stock", stockStatus: "green", desc: "Café - leche - canela", price: 1.50, image: imgCapuccino },
  { id: 5, name: "Fresas con crema y queso", category: "Frutas", stock: "In stock", stockStatus: "green", desc: "Frutillas - Crema - Queso", price: 2.50, image: imgFresasQueso },
  { id: 6, name: "Café con huma", category: "Bebidas", stock: "In stock", stockStatus: "green", desc: "Café - humita", price: 2.50, image: imgCafeHuma },
];

export default function VentasView() {
  const [selectedCategory, setSelectedCategory] = useState("Todos los productos");
  const [searchQuery, setSearchQuery] = useState("");
  const [orderType, setOrderType] = useState("comer-aqui"); // 'comer-aqui' o 'para-llevar'
  
  // Estado inicial del carrito con los elementos de tu diseño
  const [cart, setCart] = useState([
    { id: 1, name: "Copa Duraznos", desc: "Duraznos - Queso - Crema - Helado", price: 2.50, qty: 2 },
    { id: 3, name: "Fresas con crema", desc: "Frutillas - Crema", price: 1.75, qty: 1 },
    { id: 4, name: "Capuccino", desc: "Café - leche - canela", price: 1.50, qty: 1 },
  ]);

  const [kitchenNote, setKitchenNote] = useState("");

  const handleAddToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item => 
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prevCart, { id: product.id, name: product.name, desc: product.desc, price: product.price, qty: 1 }];
    });
  };

  const handleUpdateQty = (id, delta) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const handleRemoveItem = (id) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const filteredProducts = PRODUCTS_DATA.filter(prod => {
    const matchesCategory = selectedCategory === "Todos los productos" || prod.category === selectedCategory;
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || prod.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);

  const handleSendToKitchen = () => {
    if (cart.length === 0) {
      alert("La orden está vacía.");
      return;
    }
    alert(`¡Orden #1048 enviada a la cocina con éxito! (${orderType === 'comer-aqui' ? 'Comer aquí' : 'Para llevar'})`);
  };

  return (
    <div className="p-6 max-w-[1440px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* Columna Izquierda: Menú y Catálogo (8 columnas) */}
      <div className="lg:col-span-8 flex flex-col space-y-6">
        
        {/* Encabezado */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-950">Ventas</h1>
            <p className="text-gray-500 text-sm mt-1">Crea una orden y mándala directo a la cocina.</p>
          </div>
          <button className="flex items-center space-x-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-2xs cursor-pointer">
            <span>📄 Órdenes Recientes</span>
          </button>
        </div>

        {/* Buscador */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">🔍</span>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar producto" 
            className="w-full pl-11 pr-12 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5C4033] shadow-2xs"
          />
          <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-xs font-mono text-gray-400 bg-gray-100 px-2 my-2 rounded-md">⌘ K</span>
        </div>

        {/* Filtros de Categorías */}
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {["Todos los productos", "Ice cream", "Frutas", "Bebidas"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                selectedCategory === cat 
                  ? "bg-[#5C4033] text-white shadow-sm" 
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Retícula de Productos */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">Menú</h3>
            <span className="text-xs text-gray-400 font-medium">{filteredProducts.length} productos disponibles</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} onAddToCart={handleAddToCart} />
            ))}
          </div>
        </div>

      </div>

      {/* Columna Derecha: Orden Actual / Carrito (4 columnas) */}
      <div className="lg:col-span-4 bg-white border border-gray-200 rounded-3xl p-6 flex flex-col justify-between shadow-2xs">
        
        <div>
          {/* Cabecera del ticket */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Orden Actual</h2>
            <span className="text-xs font-mono font-bold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg">#1048</span>
          </div>

          {/* Selector de consumo */}
          <div className="grid grid-cols-2 bg-gray-100 p-1 rounded-xl mb-6">
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

          <p className="text-xs text-gray-400 font-medium mb-4">{cart.length} products - {totalItems} items</p>

          {/* Lista de productos en el carrito */}
          <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
            {cart.map((item) => (
              <div key={item.id} className="p-3 bg-gray-50 border border-gray-100 rounded-2xl relative group">
                <button 
                  onClick={() => handleRemoveItem(item.id)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-sm font-bold cursor-pointer"
                >
                  ×
                </button>
                <h4 className="font-bold text-sm text-gray-900 pr-6">{item.name}</h4>
                <p className="text-[11px] text-gray-500 mb-3">{item.desc}</p>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-2 py-1 shadow-3xs">
                    <button onClick={() => handleUpdateQty(item.id, -1)} className="text-gray-500 hover:text-black font-bold px-1 cursor-pointer">−</button>
                    <span className="text-xs font-bold text-gray-800 w-4 text-center">{item.qty}</span>
                    <button onClick={() => handleUpdateQty(item.id, 1)} className="text-gray-500 hover:text-black font-bold px-1 cursor-pointer">+</button>
                  </div>
                  <span className="font-bold text-sm text-gray-900">${(item.price * item.qty).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Nota para la cocina */}
          <div className="mt-4">
            <input 
              type="text"
              placeholder="📝 Añadir una nota para la cocina"
              value={kitchenNote}
              onChange={(e) => setKitchenNote(e.target.value)}
              className="w-full text-xs text-gray-700 bg-gray-50 border border-gray-200 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C4033]"
            />
          </div>
        </div>

        {/* Totales y Botón de Confirmación */}
        <div className="pt-6 border-t border-gray-100 mt-6 space-y-3">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Subtotal</span>
            <span className="font-medium text-gray-800">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Descuento</span>
            <span className="font-medium text-gray-800">$0.00</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-900 pt-2">
            <span>Total</span>
            <span className="text-xl text-[#5C4033]">${subtotal.toFixed(2)}</span>
          </div>

          <button 
            onClick={handleSendToKitchen}
            className="w-full bg-[#4A3B32] hover:bg-[#382c25] text-white py-3.5 rounded-2xl font-bold text-sm shadow-md transition-colors cursor-pointer"
          >
            Confirmar y enviar a la cocina
          </button>
        </div>

      </div>

    </div>
  );
}