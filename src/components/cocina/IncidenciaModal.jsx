import React from 'react';

export default function IncidenciaModal({
  isOpen,
  onClose,
  descripcion,
  onChangeDescripcion,
  enviando,
  onEnviar,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl border border-gray-200 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Reportar Incidente en Cocina</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-lg font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-gray-500">
          Describe el problema (ej. faltante de insumos, rotura de vajilla, fallas en equipos) para que quede registrado y el administrador sea notificado.
        </p>

        <textarea
          className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
          rows="4"
          placeholder="Ej: Se rompieron 3 copas de vidrio grandes durante el lavado..."
          value={descripcion}
          onChange={(e) => onChangeDescripcion(e.target.value)}
          disabled={enviando}
        ></textarea>

        <div className="flex justify-end space-x-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-bold cursor-pointer transition-colors"
            disabled={enviando}
          >
            Cancelar
          </button>
          <button
            onClick={onEnviar}
            className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-xl text-sm font-bold shadow-sm cursor-pointer transition-colors disabled:opacity-50"
            disabled={enviando}
          >
            {enviando ? 'Enviando...' : 'Enviar Reporte'}
          </button>
        </div>
      </div>
    </div>
  );
}