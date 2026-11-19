import React from 'react';

export default function StockModal({
  isOpen,
  onClose,
  cargando,
  productos,
  onToggleDisponibilidad,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl border border-gray-200 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Disponibilidad Rápida en Cocina</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-lg font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-gray-500">
          Marca los productos sin insumos para deshabilitarlos al instante en el catálogo de caja.
        </p>

        <div className="max-h-[350px] overflow-y-auto space-y-2">
          {cargando ? (
            <p className="text-center text-xs text-gray-400 py-4">Cargando productos...</p>
          ) : (
            productos.map((prod) => (
              <div
                key={prod.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100"
              >
                <div>
                  <h4 className="text-xs font-bold text-gray-900">{prod.nombre}</h4>
                  <span className="text-[11px] text-gray-400">Stock: {prod.stock} u.</span>
                </div>

                <button
                  onClick={() => onToggleDisponibilidad(prod)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    prod.disponible
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                  }`}
                >
                  ● {prod.disponible ? 'Disponible' : 'Agotado'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}