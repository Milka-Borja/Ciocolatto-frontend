import React from 'react';

export default function ProductCard({ product, onAddToCart }) {
  // Verificamos disponibilidad y stock real de la base de datos
  const isAvailable = product.disponible !== false && Number(product.stock) > 0;
  const isLowStock = Number(product.stock) > 0 && Number(product.stock) <= 5;

  return (
    <div className={`bg-white border border-gray-200 rounded-2xl p-4 flex flex-col justify-between shadow-2xs hover:shadow-md transition-shadow font-montserrat ${
      !isAvailable ? 'opacity-70 bg-gray-50/50' : ''
    }`}>
      <div>
        {/* Imagen del producto desde la API */}
        <div className="relative h-40 rounded-xl overflow-hidden mb-3 bg-gray-100">
          <img 
            src={product.imagen_url || 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500'} 
            alt={product.nombre} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500';
            }}
          />
          <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md text-gray-700 shadow-2xs">
            {product.categoria || 'Helados'}
          </span>
          {product.producto_temporada && (
            <span className="absolute top-3 right-3 bg-amber-500 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-md shadow-2xs">
              Temporada
            </span>
          )}
        </div>

        {/* Nombre y estado de existencias */}
        <div className="flex justify-between items-start mb-1">
          <h4 className="font-bold text-gray-900 text-base">{product.nombre}</h4>
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
            !isAvailable
              ? 'bg-red-50 text-red-600'
              : isLowStock 
              ? 'bg-amber-50 text-amber-700' 
              : 'bg-emerald-50 text-emerald-700'
          }`}>
            ● {!isAvailable ? 'Agotado' : isLowStock ? `Stock bajo (${product.stock})` : `En stock (${product.stock})`}
          </span>
        </div>

        {/* Descripción de ingredientes */}
        <p className="text-xs text-gray-500 line-clamp-1 mb-4">{product.descripcion}</p>
      </div>

      {/* Precio y botón de agregar */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-lg font-bold text-gray-900">${Number(product.precio).toFixed(2)}</span>
        <button 
          onClick={() => onAddToCart(product)}
          disabled={!isAvailable}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            isAvailable 
              ? 'bg-[#F5EBE6] text-[#5C4033] hover:bg-[#5C4033] hover:text-white' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isAvailable ? '+ Add' : 'Agotado'}
        </button>
      </div>
    </div>
  );
}