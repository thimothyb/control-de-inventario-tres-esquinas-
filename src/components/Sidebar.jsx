import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Truck, ShoppingCart, Wallet, LogOut, Settings, FileText, Moon, Sun, Users, Receipt, UserPlus, CreditCard, HandCoins } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, companySettings } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => { await logout(); navigate('/login'); };
  const isActive = (path) => location.pathname === path;

  const links = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/products', icon: Package, label: 'Productos' },
    { to: '/admin/providers', icon: Truck, label: 'Proveedores' },
    { to: '/admin/sales', icon: ShoppingCart, label: 'Ventas' },
    { to: '/admin/clients', icon: UserPlus, label: 'Clientes' },
    { to: '/admin/supplier-debts', icon: CreditCard, label: 'Ctas por Pagar' },
    { to: '/admin/client-debts', icon: HandCoins, label: 'Ctas por Cobrar' },
    { to: '/admin/users', icon: Users, label: 'Usuarios' },
    { to: '/admin/billing', icon: Receipt, label: 'Facturación' },
    { to: '/admin/categories', icon: Settings, label: 'Categorías' },
    { to: '/admin/reports', icon: FileText, label: 'Reportes' },
  ];

  return (
    <div className="flex flex-col h-full w-64 bg-gray-900 dark:bg-gray-950 text-white transition-colors duration-200">
      <div className="relative flex items-center justify-center h-16 border-b border-gray-800">
        <img src={companySettings.logo} alt={companySettings.name} className="h-28 w-auto object-contain brightness-0 invert absolute top-1/2 -translate-y-1/2"
          onError={(e) => { e.target.style.display = 'none'; }} />
      </div>

      <nav className="flex-grow mt-2 overflow-y-auto dark-scrollbar">
        {links.map(({ to, icon: Icon, label }) => (
          <Link key={to} to={to}
            className={`flex items-center px-6 py-3 text-base transition-colors duration-200 ${
              isActive(to) ? 'bg-gray-800 dark:bg-gray-900' : 'hover:bg-gray-700 dark:hover:bg-gray-800'
            }`}
          >
            <Icon size={20} className="mr-3" /> {label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-gray-800 p-4">
        <button onClick={toggleTheme}
          className="w-full mb-4 flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-700 transition-colors duration-200">
          {theme === 'light' ? <><Moon size={16} className="mr-2" /> Modo Oscuro</> : <><Sun size={16} className="mr-2" /> Modo Claro</>}
        </button>
        <div className="flex items-center">
          <img className="h-10 w-10 rounded-full object-cover"
            src={`https://ui-avatars.com/api/?name=${user?.name}&background=random`} alt="Avatar" />
          <div className="ml-3">
            <p className="text-sm font-semibold">{user?.name}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full mt-4 flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
          <LogOut size={16} className="mr-2" /> Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
