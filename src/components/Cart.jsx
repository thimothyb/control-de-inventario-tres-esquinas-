import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingCart, Package, ArrowLeft, RefreshCw, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance, { UPLOADS_URL } from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CheckoutModal from './CheckoutModal';

const formatBs = (usd, tasa) => {
  if (!tasa || tasa <= 0) return null;
  return (usd * tasa).toFixed(2);
};

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [clients, setClients] = useState([]);

  // Tasa BCV
  const [tasaBcv, setTasaBcv] = useState(0);
  const [tasaInput, setTasaInput] = useState('');
  const [tasaUpdatedAt, setTasaUpdatedAt] = useState(null);
  const [tasaUpdatedBy, setTasaUpdatedBy] = useState(null);
  const [savingTasa, setSavingTasa] = useState(false);

  const fetchClients = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/clients');
      setClients(res.data?.data ?? res.data ?? []);
    } catch { /* silent */ }
  }, []);

  const fetchTasa = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/settings/tasa-bcv');
      const val = parseFloat(res.data.value) || 0;
      setTasaBcv(val);
      setTasaInput(val > 0 ? String(val) : '');
      setTasaUpdatedAt(res.data.updatedAt);
      setTasaUpdatedBy(res.data.updatedBy?.name || null);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchClients(); fetchTasa(); }, [fetchClients, fetchTasa]);

  const handleSaveTasa = async () => {
    const num = parseFloat(tasaInput);
    if (!num || num <= 0) { toast.error('La tasa debe ser mayor a 0'); return; }
    setSavingTasa(true);
    try {
      const res = await axiosInstance.put('/settings/tasa-bcv', { value: num });
      setTasaBcv(parseFloat(res.data.value));
      setTasaUpdatedAt(res.data.updatedAt);
      setTasaUpdatedBy(res.data.updatedBy?.name || null);
      toast.success('Tasa BCV actualizada');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Error al guardar tasa');
    } finally { setSavingTasa(false); }
  };

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalBs = formatBs(total, tasaBcv);

  const handleCheckout = async (metodoPago, observaciones, clientId) => {
    setLoading(true);
    try {
      const payload = {
        user_id: user.id,
        products: cartItems.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        metodo_pago: metodoPago,
        observaciones,
      };
      if (clientId) payload.client_id = clientId;
      await axiosInstance.post('/sales', payload);
      clearCart();
      setShowCheckout(false);
      toast.success('¡Compra realizada exitosamente!');
      navigate('/shop');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Error al procesar la compra');
    } finally { setLoading(false); }
  };

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingCart size={64} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Tu carrito está vacío</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Agrega productos desde la tienda</p>
        <Link to="/shop" className="btn btn-primary inline-flex items-center gap-2">
          <ArrowLeft size={18} /> Ir a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Mi Carrito</h1>
        <Link to="/shop" className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 transition-colors">
          <ArrowLeft size={16} /> Seguir comprando
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product list */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => {
            const itemBs = formatBs(item.price * item.quantity, tasaBcv);
            return (
              <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex items-center gap-4 transition-colors duration-200">
                <div className="h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                  {item.imagenes?.[0]?.ruta ? (
                    <img src={`${UPLOADS_URL}/${item.imagenes[0].ruta}`} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Package size={24} className="text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 dark:text-white line-clamp-1">{item.name}</h3>
                  <p className="text-primary-600 font-bold mt-1">${parseFloat(item.price ?? 0).toFixed(2)}</p>
                  {tasaBcv > 0 && (
                    <p className="text-xs text-gray-400">Bs {parseFloat(formatBs(item.price, tasaBcv)).toFixed(2)}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors">
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-medium text-gray-800 dark:text-white">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <Plus size={14} />
                  </button>
                </div>

                <div className="text-right">
                  <p className="font-bold text-gray-800 dark:text-white">${(item.price * item.quantity).toFixed(2)}</p>
                  {itemBs && <p className="text-xs text-gray-400">Bs {itemBs}</p>}
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-600 mt-1 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar: tasa + summary */}
        <div className="lg:col-span-1 space-y-4">
          {/* Tasa BCV card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 transition-colors duration-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tasa BCV (Bs/$)</h3>
              <RefreshCw size={14} className="text-gray-400 cursor-pointer hover:text-primary-600 transition-colors" onClick={fetchTasa} />
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                min="0"
                value={tasaInput}
                onChange={(e) => setTasaInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveTasa()}
                className="form-control text-sm flex-1"
                placeholder="Ej: 36.50"
              />
              <button
                onClick={handleSaveTasa}
                disabled={savingTasa}
                className="btn btn-primary px-3 py-2 disabled:opacity-50"
                title="Guardar tasa"
              >
                {savingTasa
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  : <Check size={16} />}
              </button>
            </div>
            {tasaUpdatedAt && (
              <p className="text-xs text-gray-400 mt-2">
                Actualizada: {new Date(tasaUpdatedAt).toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' })}
                {tasaUpdatedBy && ` por ${tasaUpdatedBy}`}
              </p>
            )}
          </div>

          {/* Order summary */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 sticky top-24 transition-colors duration-200">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Resumen del Pedido</h2>
            <div className="space-y-2 mb-4">
              {cartItems.map((item) => {
                const lineBs = formatBs(item.price * item.quantity, tasaBcv);
                return (
                  <div key={item.id} className="text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span className="line-clamp-1 flex-1 mr-2">{item.name} x{item.quantity}</span>
                      <span className="flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                    {lineBs && (
                      <div className="flex justify-end">
                        <span className="text-xs text-gray-400">Bs {lineBs}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6 space-y-1">
              <div className="flex justify-between font-bold text-gray-800 dark:text-white text-lg">
                <span>Total</span>
                <span className="text-primary-600">${total.toFixed(2)}</span>
              </div>
              {totalBs && (
                <div className="flex justify-between font-semibold text-gray-600 dark:text-gray-300">
                  <span>Total Bs</span>
                  <span className="text-green-600 dark:text-green-400">Bs {totalBs}</span>
                </div>
              )}
            </div>
            <button onClick={() => setShowCheckout(true)}
              className="w-full btn btn-primary flex items-center justify-center gap-2">
              Finalizar Compra
            </button>
          </div>
        </div>
      </div>

      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        onConfirm={handleCheckout}
        total={total}
        totalBs={totalBs}
        loading={loading}
        clients={clients}
        onClientsChanged={fetchClients}
      />
    </div>
  );
};

export default Cart;
