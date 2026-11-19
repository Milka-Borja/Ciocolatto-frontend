import React from 'react';
import ProductCard from './ProductCard';

export default function ProductGrid({ cargando, products, onAddToCart }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">Menú</h3>
        <span className="text-xs text-gray-400 font-medium">
          {cargando ? 'Cargando...' : `${products.length} productos disponibles`}
        </span>
      </div>

      {cargando ? (
        <div className="p-16 text-center text-gray-400 text-sm">
          Cargando catálogo desde la base de datos...
        </div>
      ) : products.length === 0 ? (
        <div className="p-16 text-center text-gray-400 text-sm bg-white border border-gray-200 rounded-2xl">
          No hay productos que coincidan con la búsqueda.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {products.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
}