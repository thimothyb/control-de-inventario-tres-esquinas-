import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Download, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axios';
import InvoiceModal from './InvoiceModal';

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

const Billing = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invoiceSale, setInvoiceSale] = useState(null);
  const [search, setSearch] = useState('');
  const [filterMetodo, setFilterMetodo] = useState('');
  const [filterFechaDesde, setFilterFechaDesde] = useState('');
  const [filterFechaHasta, setFilterFechaHasta] = useState('');

  useEffect(() => {
    axiosInstance.get('/sales')
      .then((r) => setSales(r.data?.data ?? r.data ?? []))
      .catch(() => toast.error('Error al cargar facturas'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = sales;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((s) =>
        s.user?.name?.toLowerCase().includes(q) ||
        String(s.numero_factura ?? '').includes(q)
      );
    }
    if (filterMetodo) list = list.filter((s) => s.metodo_pago === filterMetodo);
    if (filterFechaDesde) list = list.filter((s) => new Date(s.created_at ?? s.createdAt) >= new Date(filterFechaDesde));
    if (filterFechaHasta) list = list.filter((s) => new Date(s.created_at ?? s.createdAt) <= new Date(filterFechaHasta + 'T23:59:59'));
    return list;
  }, [sales, search, filterMetodo, filterFechaDesde, filterFechaHasta]);

  const totalFiltrado = filtered.reduce((s, v) => s + (v.total_venta ?? 0), 0);
  const totalFiltradoBs = filtered.reduce((s, v) => s + (v.total_venta_bs ?? 0), 0);

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Facturación</h1>
          <div className="bg-white dark:bg-gray-800 rounded-xl px-4 py-2 shadow-sm text-sm flex items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400">Total filtrado:</span>
            <span className="font-bold text-primary-600">${totalFiltrado.toFixed(2)}</span>
            {totalFiltradoBs > 0 && (
              <span className="font-bold text-green-600 dark:text-green-400">/ Bs {totalFiltradoBs.toFixed(2)}</span>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 transition-colors duration-200">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtros</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                className="form-control pl-9 text-sm" placeholder="Buscar por cliente o N° factura..." />
            </div>
            <select value={filterMetodo} onChange={(e) => setFilterMetodo(e.target.value)} className="form-control text-sm">
              <option value="">Todos los métodos de pago</option>
              {Object.entries(METODO_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <input type="date" value={filterFechaDesde} onChange={(e) => setFilterFechaDesde(e.target.value)}
              className="form-control text-sm" placeholder="Desde" />
            <input type="date" value={filterFechaHasta} onChange={(e) => setFilterFechaHasta(e.target.value)}
              className="form-control text-sm" placeholder="Hasta" />
          </div>
          {(search || filterMetodo || filterFechaDesde || filterFechaHasta) && (
            <button onClick={() => { setSearch(''); setFilterMetodo(''); setFilterFechaDesde(''); setFilterFechaHasta(''); }}
              className="mt-2 text-xs text-primary-600 hover:text-primary-700 transition-colors">
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Table */}
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
                    {['N° Factura', 'Fecha', 'Cliente', 'Productos', 'Método Pago', 'Total ($)', 'Total (Bs)', 'Acciones'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-10 text-center text-gray-500 dark:text-gray-400">
                        No se encontraron facturas.
                      </td>
                    </tr>
                  ) : filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-mono text-sm font-bold text-primary-600 dark:text-primary-400">
                          FAC-{String(s.numero_factura ?? '').padStart(6, '0')}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(s.created_at ?? s.createdAt).toLocaleDateString('es-VE')}
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white">
                        {s.user?.name ?? '—'}
                        {s.user?.email && <p className="text-xs text-gray-400 font-normal">{s.user.email}</p>}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {s.products?.length ?? 0} ítem(s)
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
                        <button onClick={() => setInvoiceSale(s)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-600 border border-primary-200 dark:border-primary-700 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900 transition-colors">
                          <FileText size={14} /> Ver / PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
              Mostrando {filtered.length} de {sales.length} facturas
            </div>
          </div>
        )}

        <InvoiceModal sale={invoiceSale} onClose={() => setInvoiceSale(null)} />
      </div>
    </>
  );
};

export default Billing;
