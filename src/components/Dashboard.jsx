import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Package, ShoppingCart, Wallet, TrendingUp, Users, Tag, Truck, DollarSign } from 'lucide-react';
import axiosInstance from '../api/axios';


const StatCard = ({ title, value, icon: Icon, color, bg }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex items-center transition-colors duration-200">
    <div className={`p-3 rounded-full ${bg} mr-4`}>
      <Icon className={color} size={24} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-800 dark:text-white">{value ?? '...'}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, salesRes] = await Promise.all([
          axiosInstance.get('/reports/statistics'),
          axiosInstance.get('/sales'),
        ]);
        setStats(statsRes.data);
        const salesData = salesRes.data?.data ?? salesRes.data ?? [];
        const monthly = {};
        salesData.forEach((s) => {
          const d = new Date(s.created_at ?? s.createdAt);
          if (!isNaN(d)) {
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            monthly[key] = (monthly[key] || 0) + (s.total_venta || 0);
          }
        });
        const chartData = Object.entries(monthly)
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(-6)
          .map(([month, total]) => ({ month, total: parseFloat(total.toFixed(2)) }));
        setSales(chartData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const cards = [
    { title: 'Total Productos', value: stats?.total_products, icon: Package, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900' },
    { title: 'Stock Total', value: stats?.total_stock, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900' },
    { title: 'Total Ventas', value: stats?.total_sales, icon: ShoppingCart, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900' },
    { title: 'Ingresos', value: stats?.total_sales_amount ? `$${parseFloat(stats.total_sales_amount).toFixed(2)}` : null, icon: DollarSign, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900' },
    { title: 'Total Deudas', value: stats?.total_debts, icon: Wallet, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900' },
    { title: 'Monto Deudas', value: stats?.total_debt_amount ? `$${parseFloat(stats.total_debt_amount).toFixed(2)}` : null, icon: DollarSign, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900' },
    { title: 'Categorías', value: stats?.total_categories, icon: Tag, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900' },
    { title: 'Proveedores', value: stats?.total_providers, icon: Truck, color: 'text-teal-600', bg: 'bg-teal-100 dark:bg-teal-900' },
  ];

  return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {cards.map((c) => <StatCard key={c.title} {...c} />)}
            </div>

            {sales.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors duration-200">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Ventas Mensuales</h2>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={sales}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-600" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v) => [`$${v}`, 'Total']} />
                      <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors duration-200">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Tendencia de Ingresos</h2>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={sales}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-600" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v) => [`$${v}`, 'Total']} />
                      <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}
      </div>
  );
};

export default Dashboard;
