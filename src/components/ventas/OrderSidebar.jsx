import React from 'react';

export default function OrderSidebar({
  tipoPago,
  setTipoPago,
  orderType,
  onOrderTypeChange,
  cart,
  totalItems,
  onRemoveItem,
  onUpdateQty,
  onUpdateItemNote,
  extrasList,
  mostrarFormExtra,
  setMostrarFormExtra,
  nuevoExtraNombre,
  setNuevoExtraNombre,
  nuevoExtraPrecio,
  setNuevoExtraPrecio,
  onAgregarExtra,
  onEliminarExtra,
  kitchenNote,
  setKitchenNote,
  subtotalProductos,
  totalExtras,
  totalGeneral,
  enviando,
  onSendToKitchen,
}) {
  return (
    <div className="lg:col-span-4 bg-white border border-gray-200 rounded-3xl p-6 flex flex-col justify-between shadow-2xs">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Orden Actual</h2>
          <span className="text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg">
            {tipoPago}
          </span>
        </div>

        {/* Selector de consumo (Conectado a la regla del recargo de $0.50) */}
        <div className="grid grid-cols-2 bg-gray-100 p-1 rounded-xl mb-4">
          <button
            onClick={() => onOrderTypeChange("comer-aqui")}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              orderType === "comer-aqui" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Comer aquí
          </button>
          <button
            onClick={() => onOrderTypeChange("para-llevar")}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              orderType === "para-llevar" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Para llevar (+ $0.50)
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
                  onClick={() => onRemoveItem(item.producto_id)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-sm font-bold cursor-pointer"
                >
                  ×
                </button>
                <h4 className="font-bold text-sm text-gray-900 pr-6">{item.nombre}</h4>
                <p className="text-[11px] text-gray-500 mb-2">{item.descripcion}</p>

                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-2 py-1 shadow-3xs">
                    <button onClick={() => onUpdateQty(item.producto_id, -1)} className="text-gray-500 hover:text-black font-bold px-1 cursor-pointer">−</button>
                    <span className="text-xs font-bold text-gray-800 w-4 text-center">{item.cantidad}</span>
                    <button onClick={() => onUpdateQty(item.producto_id, 1)} className="text-gray-500 hover:text-black font-bold px-1 cursor-pointer">+</button>
                  </div>
                  <span className="font-bold text-sm text-gray-900">${(item.precio * item.cantidad).toFixed(2)}</span>
                </div>

                <input
                  type="text"
                  placeholder="Instrucción específica (ej. en cono)"
                  value={item.notas}
                  onChange={(e) => onUpdateItemNote(item.producto_id, e.target.value)}
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
                onClick={onAgregarExtra}
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
                    {extra.id !== 'empaque-llevar' && (
                      <button
                        type="button"
                        onClick={() => onEliminarExtra(extra.id)}
                        className="text-gray-400 hover:text-red-500 font-bold ml-1 cursor-pointer"
                      >
                        ×
                      </button>
                    )}
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
            placeholder=" Nota general (ej. Cliente en mesa 4)"
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
          onClick={onSendToKitchen}
          disabled={enviando}
          className="w-full bg-[#4A3B32] hover:bg-[#382c25] text-white py-3.5 rounded-2xl font-bold text-sm shadow-md transition-colors cursor-pointer disabled:opacity-50 mt-1"
        >
          {enviando ? 'Registrando en Servidor...' : 'Confirmar y enviar a la cocina'}
        </button>
      </div>
    </div>
  );
}