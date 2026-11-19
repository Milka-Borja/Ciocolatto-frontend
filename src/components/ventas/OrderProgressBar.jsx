import React from 'react';

export default function OrderProgressBar({ estado }) {
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