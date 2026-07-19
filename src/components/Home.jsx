import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Package, ShoppingCart, TrendingUp, Shield } from 'lucide-react';

const Home = () => {
  const { companySettings } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <img src={companySettings.logo} alt={companySettings.name}
            className="h-24 w-24 object-contain mx-auto mb-4"
            onError={(e) => { e.target.style.display = 'none'; }} />
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">{companySettings.name}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">Sistema de Gestión de Inventario</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">RIF: {companySettings.rif}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { icon: Package, color: 'text-blue-600', title: 'Gestión de Productos', desc: 'Control completo de tu inventario' },
            { icon: ShoppingCart, color: 'text-green-600', title: 'Ventas en Tiempo Real', desc: 'Registra y monitorea tus ventas' },
            { icon: TrendingUp, color: 'text-purple-600', title: 'Reportes Detallados', desc: 'Análisis y estadísticas completas' },
            { icon: Shield, color: 'text-red-600', title: 'Seguro y Confiable', desc: 'Protección de tus datos' },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center transition-colors duration-200">
              <Icon className={`mx-auto mb-3 ${color} dark:opacity-80`} size={40} />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md mx-auto transition-colors duration-200">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Comienza Ahora</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
            Inicia sesión para acceder al sistema de inventario
          </p>
          <Link to="/login"
            className="block w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200 text-center">
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
