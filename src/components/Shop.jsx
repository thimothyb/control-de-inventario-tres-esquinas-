import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Package, Search, Barcode, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance, { UPLOADS_URL } from '../api/axios';
import { useCart } from '../context/CartContext';
import BarcodeScanner from './BarcodeScanner';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const { addToCart } = useCart();
  const barcodeRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          axiosInstance.get('/products-for-shop'),
          axiosInstance.get('/categories'),
        ]);
        const prods = prodRes.data?.data ?? prodRes.data ?? [];
        setProducts(prods);
        setFiltered(prods);
        setCategories(catRes.data?.data ?? catRes.data ?? []);
      } catch { toast.error('Error al cargar productos'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let result = products;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        (p.codigo && p.codigo.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }
    if (selectedCategory) result = result.filter((p) => String(p.categoria_id ?? p.category?.id) === selectedCategory);
    setFiltered(result);
  }, [search, selectedCategory, products]);

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success(`${product.name} agregado al carrito`);
  };

  const addByCode = async (code) => {
    if (!code.trim()) return;

    // First try local match
    const local = products.find((p) => p.codigo === code.trim());
    if (local) {
      if (local.existencias <= 0) { toast.error('Sin stock disponible'); return; }
      handleAddToCart(local);
      return;
    }

    // Fallback: API search
    try {
      const res = await axiosInstance.get(`/products/by-codigo/${encodeURIComponent(code.trim())}`);
      const prod = res.data;
      if (prod.existencias <= 0) { toast.error('Sin stock disponible'); return; }
      handleAddToCart(prod);
    } catch {
      toast.error('Producto no encontrado con ese código');
    }
  };

  const handleBarcodeKeyDown = (e) => {
    if (e.key !== 'Enter') return;
    const code = e.target.value.trim();
    if (!code) return;
    addByCode(code);
    e.target.value = '';
  };

  const handleCameraScan = (code) => {
    setShowCamera(false);
    addByCode(code);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showCamera && <BarcodeScanner onScan={handleCameraScan} onClose={() => setShowCamera(false)} />}

      {/* Barcode scanner row */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 transition-colors duration-200">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
          <Barcode size={16} className="text-primary-600" /> Lector de Código de Barras
        </label>
        <div className="flex gap-2">
          <input
            ref={barcodeRef}
            type="text"
            className="form-control flex-1 font-mono"
            placeholder="Escanea o escribe el código y presiona Enter..."
            onKeyDown={handleBarcodeKeyDown}
          />
          <button
            type="button"
            onClick={() => setShowCamera(true)}
            className="p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title="Escanear con cámara"
          >
            <Camera size={20} />
          </button>
        </div>
        <p className="mt-1.5 text-xs text-gray-400">Compatible con lectores USB. El producto se agrega automáticamente al carrito.</p>
      </div>

      {/* Search + category filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Buscar por nombre o código..." />
        </div>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="">Todas las categorías</option>
          {categories.map((c) => <option key={c.id} value={String(c.id)}>{c.nombre}</option>)}
        </select>
      </div>

      {/* Product grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <Package size={48} className="mx-auto mb-4 opacity-50" />
          <p>No se encontraron productos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <div key={product.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
              <div className="aspect-square bg-gray-100 dark:bg-gray-700">
                {product.imagenes?.[0]?.ruta ? (
                  <img src={`${UPLOADS_URL}/${product.imagenes[0].ruta}`} alt={product.name}
                    className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={48} className="text-gray-400" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 dark:text-white line-clamp-1">{product.name}</h3>
                {product.codigo && (
                  <p className="text-xs font-mono text-gray-400 mt-0.5">{product.codigo}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{product.description || '—'}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-lg font-bold text-primary-600">${parseFloat(product.price ?? 0).toFixed(2)}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Stock: {product.existencias}</span>
                </div>
                <button onClick={() => handleAddToCart(product)}
                  disabled={product.existencias <= 0}
                  className="w-full mt-3 flex items-center justify-center gap-2 py-2 px-4 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                  <ShoppingCart size={16} />
                  {product.existencias <= 0 ? 'Sin Stock' : 'Agregar al Carrito'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Shop;
