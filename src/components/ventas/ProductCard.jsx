import React from 'react';

export default function ProductCard({ product, onAddToCart }) {
  const isLowStock = product.stockStatus === 'orange';

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col justify-between shadow-2xs hover:shadow-md transition-shadow font-montserrat">
      <div>
        <div className="relative h-40 rounded-xl overflow-hidden mb-3 bg-gray-100">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md text-gray-700 shadow-2xs">
            {product.category}
          </span>
        </div>

        <div className="flex justify-between items-start mb-1">
          <h4 className="font-bold text-gray-900 text-base">{product.name}</h4>
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
            isLowStock ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
          }`}>
            ● {product.stock}
          </span>
        </div>

        <p className="text-xs text-gray-500 line-clamp-1 mb-4">{product.desc}</p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
        <button 
          onClick={() => onAddToCart(product)}
          className="bg-[#F5EBE6] text-[#5C4033] hover:bg-[#5C4033] hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
        >
          + Add
        </button>
      </div>
    </div>
  );
}