import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, LogOut, User, Moon, Sun, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

const UserLayout = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const { theme, toggleTheme, companySettings } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => { await logout(); navigate('/login'); };
  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-colors duration-200">
        <nav className="container mx-auto px-6 h-16 flex justify-between items-center">
          <Link to="/shop" className="flex items-center space-x-3 relative">
            <img src={companySettings.logo} alt={companySettings.name} className="h-28 w-auto object-contain absolute left-0 top-1/2 -translate-y-1/2"
              onError={(e) => { e.target.style.display = 'none'; }} />
            <span className="pl-24 text-lg font-bold text-gray-800 dark:text-white hidden sm:inline">{companySettings.name}</span>
          </Link>
          <div className="flex items-center space-x-6">
            <Link to="/clients" className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors">
              <Users size={20} />
              <span className="text-sm font-medium hidden sm:inline">Clientes</span>
            </Link>
            <button onClick={toggleTheme} className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors">
              {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
            </button>
            <Link to="/cart" className="relative text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors">
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <div className="relative group">
              <button className="flex items-center text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors">
                <User size={24} />
              </button>
              <div className="absolute top-full right-0 h-2 bg-transparent w-full"></div>
              <div className="absolute right-0 top-full pt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                  <p className="font-semibold">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-700"></div>
                <button onClick={handleLogout}
                  className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <LogOut size={16} className="mr-2" /> Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </nav>
      </header>
      <main className="container mx-auto p-6"><Outlet /></main>
      <footer className="bg-white dark:bg-gray-800 mt-12 py-6 transition-colors duration-200">
        <div className="container mx-auto text-center text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} {companySettings.name}. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
};

export default UserLayout;
