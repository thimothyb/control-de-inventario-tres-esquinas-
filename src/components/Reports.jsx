import React, { useState, useEffect } from 'react';
import { FileText, FileSpreadsheet, TrendingUp, Package, ShoppingCart, DollarSign, AlertTriangle } from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axios';
import { generatePDFReport } from '../utils/pdfGenerator';
import { generateExcelReport } from '../utils/excelGenerator';

const METODO_LABELS = {
  efectivo: 'Efectivo',
  punto_de_venta: 'Punto de Venta',
  transferencia: 'Transferencia',
  pago_movil: 'Pago Móvil',
  credito: 'Crédito',
  biopago: 'Biopago',
};

const PIE_COLORS = ['#2563eb', '#16a34a', '#9333ea', '#ea580c', '#dc2626', '#0d9488'];

const StatCard = ({ title, value, icon: Icon, color, bg, subtitle }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 flex items-start gap-4 transition-colors duration-200">
    <div className={`p-3 rounded-xl ${bg} flex-shrink-0`}>
      <Icon className={color} size={22} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-800 dark:text-white mt-0.5">{value ?? '...'}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

const Reports = () => {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, productsRes, salesRes] = await Promise.all([
          axiosInstance.get('/reports/statistics'),
          axiosInstance.get('/products'),
          axiosInstance.get('/sales'),
        ]);
        setStats(statsRes.data);
        setProducts(productsRes.data?.data ?? productsRes.data ?? []);
        setSales(salesRes.data?.data ?? salesRes.data ?? []);
      } catch { toast.error('Error al cargar datos'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handlePDF = async () => {
    setGenerating(true);
    try { await generatePDFReport({ stats, products, sales }); toast.success('PDF generado'); }
    catch { toast.error('Error al generar PDF'); }
    finally { setGenerating(false); }
  };

  const handleExcel = async () => {
    setGenerating(true);
    try {
      const companyName = localStorage.getItem('companyName') || 'Mi Empresa';
      const companyRif = localStorage.getItem('companyRif') || 'J-00000000-0';
      const columns = ['Nombre', 'Código', 'Categoría', 'Proveedor', 'Stock', 'Precio'];
      const data = products.map((p) => [
        p.name,
        p.codigo || '—',
        p.category?.nombre ?? '—',
        p.provider?.name ?? '—',
        p.existencias,
        `$${parseFloat(p.price ?? 0).toFixed(2)}`,
      ]);
      await generateExcelReport({
        title: 'Reporte de Inventario',
        columns,
        data,
        companySettings: { name: companyName, rif: companyRif, logo: '/logo.png' },
        fileName: `reporte-inventario-${new Date().toISOString().split('T')[0]}.xlsx`,
      });
      toast.success('Excel generado');
    } catch { toast.error('Error al generar Excel'); }
    finally { setGenerating(false); }
  };

  const pieData = (stats?.sales_by_payment ?? []).map((s) => ({
    name: METODO_LABELS[s.method] ?? s.method,
    value: s.count,
    total: s.total,
  }));

  return (
    <>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Reportes y Estadísticas</h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Total Productos" value={stats?.total_products} icon={Package}
                color="text-blue-600" bg="bg-blue-100 dark:bg-blue-900" />
              <StatCard title="Stock Total" value={stats?.total_stock} icon={TrendingUp}
                color="text-green-600" bg="bg-green-100 dark:bg-green-900" />
              <StatCard title="Total Ventas" value={stats?.total_sales} icon={ShoppingCart}
                color="text-purple-600" bg="bg-purple-100 dark:bg-purple-900" />
              <StatCard title="Ingresos Totales" value={stats?.total_sales_amount ? `$${parseFloat(stats.total_sales_amount).toFixed(2)}` : null}
                icon={DollarSign} color="text-yellow-600" bg="bg-yellow-100 dark:bg-yellow-900" />
            </div>

            {/* Export buttons */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 transition-colors duration-200">
              <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Exportar Reporte</h2>
              <div className="flex flex-wrap gap-3">
                <button onClick={handlePDF} disabled={generating}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-medium text-sm">
                  {generating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <FileText size={18} />}
                  Exportar PDF
                </button>
                <button onClick={handleExcel} disabled={generating}
                  className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium text-sm">
                  {generating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <FileSpreadsheet size={18} />}
                  Exportar Excel
                </button>
              </div>
            </div>

            {/* Charts row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly sales */}
              {(stats?.monthly_sales?.length ?? 0) > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 transition-colors duration-200">
                  <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Ventas Mensuales</h2>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={stats.monthly_sales}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-600" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v, n) => [n === 'total' ? `$${v}` : v, n === 'total' ? 'Ingresos' : 'Cant.']} />
                      <Legend />
                      <Bar dataKey="total" name="Ingresos ($)" fill="#2563eb" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="count" name="Cantidad" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Payment method pie */}
              {pieData.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 transition-colors duration-200">
                  <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Ventas por Método de Pago</h2>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v, n, p) => [`${v} ventas — $${p.payload.total}`, p.payload.name]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {pieData.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}></span>
                        <span>{d.name}: <strong>{d.value}</strong> (${d.total})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Top products & Revenue trend */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top 5 products */}
              {(stats?.top_products?.length ?? 0) > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 transition-colors duration-200">
                  <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Top 5 Productos Más Vendidos</h2>
                  <div className="space-y-3">
                    {stats.top_products.map((p, i) => {
                      const maxQty = stats.top_products[0]?.total_qty ?? 1;
                      const pct = Math.round((p.total_qty / maxQty) * 100);
                      return (
                        <div key={i}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-800 dark:text-white font-medium line-clamp-1">{p.name}</span>
                            <span className="text-gray-500 dark:text-gray-400 ml-2 whitespace-nowrap">{p.total_qty} uds — ${p.total_revenue}</span>
                          </div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-primary-500" style={{ width: `${pct}%`, transition: 'width 0.5s ease' }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Revenue trend line chart */}
              {(stats?.monthly_sales?.length ?? 0) > 1 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 transition-colors duration-200">
                  <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Tendencia de Ingresos</h2>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={stats.monthly_sales}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-600" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v) => [`$${v}`, 'Ingresos']} />
                      <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4, fill: '#2563eb' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Low stock alert */}
            {(stats?.low_stock?.length ?? 0) > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-colors duration-200">
                <div className="flex items-center gap-2 p-5 border-b border-gray-200 dark:border-gray-700">
                  <AlertTriangle size={18} className="text-yellow-500" />
                  <h2 className="text-base font-semibold text-gray-800 dark:text-white">Alerta de Stock Bajo (≤ 10 unidades)</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        {['Producto', 'Stock Actual', 'Estado'].map((h) => (
                          <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {stats.low_stock.map((p) => (
                        <tr key={p.id}>
                          <td className="px-5 py-3 font-medium text-gray-800 dark:text-white">{p.name}</td>
                          <td className="px-5 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              p.existencias === 0 ? 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                              : p.existencias <= 3 ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                            }`}>{p.existencias}</span>
                          </td>
                          <td className="px-5 py-3 text-xs font-medium text-gray-600 dark:text-gray-400">
                            {p.existencias === 0 ? 'Sin stock' : p.existencias <= 3 ? 'Crítico' : 'Bajo'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Reports;
