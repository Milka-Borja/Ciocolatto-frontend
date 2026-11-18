import api from './api';

export const reporteService = {
  // --- ENDPOINTS JSON (Para Tablas y Gráficas) ---

  obtenerTopProductos: async (params = {}) => {
    const response = await api.get('/reportes/top-productos', { params });
    return response.data;
  },

  obtenerVentasDiarias: async (params = {}) => {
    // Si no se envían fechas, enviamos por defecto ultimosDias = 7
    const queryParams = Object.keys(params).length === 0 ? { ultimosDias: 7 } : params;
    const response = await api.get('/reportes/ventas-diarias', { params: queryParams });
    return response.data;
  },

  obtenerProductosVendidos: async (params = {}) => {
    const response = await api.get('/reportes/productos-vendidos', { params });
    return response.data;
  },

  // --- ENDPOINTS EXCEL (Descarga de Archivos) ---

  descargarExcelGenerico: async (endpoint, nombreArchivo) => {
    try {
      const response = await api.get(endpoint, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', nombreArchivo);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Error al descargar ${nombreArchivo}:`, error);
      alert('Hubo un error al generar el archivo Excel.');
    }
  },

  descargarVentasDiariasExcel: async (params = {}) => {
    const queryParams = Object.keys(params).length === 0 ? { ultimosDias: 7 } : params;
    const queryString = new URLSearchParams(queryParams).toString();
    await reporteService.descargarExcelGenerico(`/reportes/ventas-diarias/excel?${queryString}`, 'reporte_ventas_diarias.xlsx');
  },

  descargarProductosVendidosExcel: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    await reporteService.descargarExcelGenerico(`/reportes/productos-vendidos/excel?${queryString}`, 'reporte_productos_vendidos.xlsx');
  },

  descargarPedidosExcel: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    await reporteService.descargarExcelGenerico(`/reportes/pedidos/excel?${queryString}`, 'reporte_pedidos.xlsx');
  }
};

export default reporteService;