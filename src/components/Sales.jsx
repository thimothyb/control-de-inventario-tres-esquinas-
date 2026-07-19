import React, { useState, useEffect, useMemo } from 'react';
import { Plus, ShoppingCart, Package, Users, TrendingUp, Clock, Eye, X } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axios';
import SaleFormModal from './SaleFormModal';

const METODO_LABELS = {
  efectivo: 'Efectivo',
  punto_de_venta: 'Punto de Venta',
  transferencia: 'Transferencia',
  pago_movil: 'Pago Móvil',
  credito: 'Crédito',
  biopago: 'Biopago',
};

const METODO_COLORS = {
  efectivo: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  punto_de_venta: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  transferencia: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  pago_movil: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  credito: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  biopago: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
};

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [detailSale, setDetailSale] = useState(null);
  const [viewMode, setViewMode] = useState('hoy'); // 'hoy' | 'todas'

  const fetchSales = async () => {
    try {
      const res = await axiosInstance.get('/sales');
      setSales(res.data?.data ?? res.data ?? []);
    } catch { toast.error('Error al cargar ventas'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSales(); }, []);

  const hoy = new Date().toLocaleDateString('es-VE');

  const ventasHoy = useMemo(() =>
    sales.filter((s) => new Date(s.created_at ?? s.createdAt).toLocaleDateString('es-VE') === hoy),
  [sales, hoy]);

  const displaySales = viewMode === 'hoy' ? ventasHoy : sales;

  // Summary stats
  const stats = useMemo(() => {
    const list = ventasHoy;
    const totalUsd = list.reduce((sum, s) => sum + (s.total_venta ?? 0), 0);
    const totalBs = list.reduce((sum, s) => sum + (s.total_venta_bs ?? 0), 0);
    const totalArticulos = list.reduce((sum, s) => sum + (s.products?.reduce((ps, p) => ps + (p.pivot_quantity ?? p.quantity ?? 1), 0) ?? 0), 0);

    // Desglose por método
    const porMetodo = {};
    list.forEach((s) => {
      const m = s.metodo_pago ?? 'efectivo';
      porMetodo[m] = (porMetodo[m] ?? 0) + (s.total_venta ?? 0);
    });

    return { count: list.length, totalUsd, totalBs, totalArticulos, porMetodo };
  }, [ventasHoy]);

  const formatHora = (dateStr) => {
    const d = new Date(dateStr);
    return isNaN(d) ? '—' : d.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
  };

  const formatFecha = (dateStr) => {
    const d = new Date(dateStr);
    return isNaN(d) ? '—' : d.toLocaleDateString('es-VE');
  };

  const getProductNames = (sale) => {
    if (!sale.products || sale.products.length === 0) return '—';
    return sale.products.map((p) => {
      const qty = p.pivot_quantity ?? p.quantity ?? 1;
      return `${p.name} (x${qty})`;
    }).join(', ');
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Ventas</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Registro operativo — qué se vendió, cuánto y a quién</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-2">
            <Plus size={18} /> Nueva Venta
          </button>
        </div>

        {/* Summary cards — Ventas de hoy */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 flex items-center gap-4">
            <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-xl">
              <ShoppingCart size={22} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Ventas Hoy</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.count}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
              <TrendingUp size={22} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Total Hoy</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">${stats.totalUsd.toFixed(2)}</p>
              {stats.totalBs > 0 && <p className="text-xs text-green-600 dark:text-green-400 font-semibold">Bs {stats.totalBs.toFixed(2)}</p>}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl">
              <Package size={22} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Artículos Vendidos</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalArticulos}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mb-2">Por Método de Pago</p>
            {Object.keys(stats.porMetodo).length === 0 ? (
              <p className="text-sm text-gray-400">Sin ventas hoy</p>
            ) : (
              <div className="space-y-1">
                {Object.entries(stats.porMetodo).map(([m, total]) => (
                  <div key={m} className="flex items-center justify-between text-xs">
                    <span className={`px-1.5 py-0.5 rounded-full font-medium ${METODO_COLORS[m] ?? ''}`}>
                      {METODO_LABELS[m] ?? m}
                    </span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">${total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* View toggle */}
        <div className="flex gap-2">
          <button onClick={() => setViewMode('hoy')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${viewMode === 'hoy' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
            Ventas de Hoy ({ventasHoy.length})
          </button>
          <button onClick={() => setViewMode('todas')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${viewMode === 'todas' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
            Todas ({sales.length})
          </button>
        </div>

        {/* Sales table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-colors duration-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    {[viewMode === 'hoy' ? 'Hora' : 'Fecha', 'Productos Vendidos', 'Cant.', 'Cliente', 'Método Pago', 'Total ($)', 'Total (Bs)', ''].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {displaySales.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-10 text-center text-gray-500 dark:text-gray-400">
                        {viewMode === 'hoy' ? 'No hay ventas hoy todavía.' : 'No se encontraron ventas.'}
                      </td>
                    </tr>
                  ) : displaySales.map((s) => {
                    const totalItems = s.products?.reduce((sum, p) => sum + (p.pivot_quantity ?? p.quantity ?? 1), 0) ?? 0;
                    return (
                      <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                        <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Clock size={14} className="text-gray-400" />
                            {viewMode === 'hoy' ? formatHora(s.created_at ?? s.createdAt) : formatFecha(s.created_at ?? s.createdAt)}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-800 dark:text-white max-w-xs truncate" title={getProductNames(s)}>
                          {s.products?.length > 0
                            ? s.products.slice(0, 2).map((p) => p.name).join(', ') + (s.products.length > 2 ? ` +${s.products.length - 2} más` : '')
                            : '—'}
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300 text-center">
                          {totalItems}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-800 dark:text-white">
                          {s.client?.nombre ?? s.user?.name ?? '—'}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${METODO_COLORS[s.metodo_pago] ?? METODO_COLORS.efectivo}`}>
                            {METODO_LABELS[s.metodo_pago] ?? 'Efectivo'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm font-bold text-gray-800 dark:text-white">
                          ${parseFloat(s.total_venta ?? 0).toFixed(2)}
                        </td>
                        <td className="px-5 py-4 text-sm font-bold text-green-600 dark:text-green-400">
                          {s.total_venta_bs ? `Bs ${parseFloat(s.total_venta_bs).toFixed(2)}` : '—'}
                        </td>
                        <td className="px-5 py-4">
                          <button onClick={() => setDetailSale(s)}
                            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Ver detalle">
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
              Mostrando {displaySales.length} venta(s)
            </div>
          </div>
        )}

        <SaleFormModal isOpen={showModal} onClose={() => setShowModal(false)} onSaved={fetchSales} />
      </div>

      {/* Sale detail modal */}
      {detailSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Detalle de Venta</h3>
              <button onClick={() => setDetailSale(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Fecha / Hora</p>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {formatFecha(detailSale.created_at ?? detailSale.createdAt)} — {formatHora(detailSale.created_at ?? detailSale.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Cliente</p>
                  <p className="font-medium text-gray-800 dark:text-white">{detailSale.client?.nombre ?? detailSale.user?.name ?? '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Método de Pago</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${METODO_COLORS[detailSale.metodo_pago] ?? ''}`}>
                    {METODO_LABELS[detailSale.metodo_pago] ?? 'Efectivo'}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Vendedor</p>
                  <p className="font-medium text-gray-800 dark:text-white">{detailSale.user?.name ?? '—'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Productos</p>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-600">
                  {(detailSale.products ?? []).map((p, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3 text-sm">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">{p.name}</p>
                        {p.codigo && <p className="text-xs text-gray-400 font-mono">{p.codigo}</p>}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800 dark:text-white">x{p.pivot_quantity ?? p.quantity ?? 1}</p>
                        <p className="text-xs text-gray-500">${parseFloat(p.pivot_price ?? p.price ?? 0).toFixed(2)} c/u</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Total USD</span>
                  <span className="text-lg font-bold text-gray-800 dark:text-white">${parseFloat(detailSale.total_venta ?? 0).toFixed(2)}</span>
                </div>
                {detailSale.total_venta_bs > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Total Bs (Tasa: {detailSale.tasa_bcv ?? '—'})</span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">Bs {parseFloat(detailSale.total_venta_bs).toFixed(2)}</span>
                  </div>
                )}
              </div>

              {detailSale.observaciones && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Observaciones</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{detailSale.observaciones}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sales;
