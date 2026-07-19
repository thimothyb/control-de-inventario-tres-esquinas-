import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Camera, Barcode, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axios';
import BarcodeScanner from './BarcodeScanner';

const METODOS_PAGO = [
  { value: 'efectivo',        label: 'Efectivo',          icon: '💵' },
  { value: 'punto_de_venta',  label: 'Punto de Venta',    icon: '💳' },
  { value: 'transferencia',   label: 'Transferencia',      icon: '🏦' },
  { value: 'pago_movil',      label: 'Pago Móvil',        icon: '📱' },
  { value: 'credito',         label: 'Crédito',            icon: '💰' },
  { value: 'biopago',         label: 'Biopago',            icon: '🖐️' },
];

const SaleFormModal = ({ isOpen, onClose, onSaved }) => {
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [observaciones, setObservaciones] = useState('');
  const [saving, setSaving] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const barcodeInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      axiosInstance.get('/products').then((r) => setProducts(r.data?.data ?? r.data ?? [])).catch(() => {});
      axiosInstance.get('/users').then((r) => setUsers(r.data?.data ?? r.data ?? [])).catch(() => {});
      setCart([]);
      setSelectedUser('');
      setSelectedProduct('');
      setMetodoPago('efectivo');
      setObservaciones('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const addProductById = (id) => {
    const prod = products.find((p) => String(p.id) === String(id));
    if (!prod) return false;
    const existing = cart.find((c) => String(c.id) === String(id));
    if (existing) {
      if (existing.quantity >= prod.existencias) { toast.error('No hay suficiente stock'); return false; }
      setCart(cart.map((c) => String(c.id) === String(id) ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      if (prod.existencias === 0) { toast.error('Sin stock disponible'); return false; }
      setCart((prev) => [...prev, { ...prod, quantity: 1 }]);
    }
    return true;
  };

  const handleBarcodeKeyDown = async (e) => {
    if (e.key !== 'Enter') return;
    const code = e.target.value.trim();
    if (!code) return;

    // Search by codigo first
    try {
      const res = await axiosInstance.get(`/products/by-codigo/${encodeURIComponent(code)}`);
      const prod = res.data;
      const ok = addProductById(prod.id);
      if (ok) toast.success(`${prod.name} agregado`);
    } catch {
      // fallback: search by name
      const match = products.find((p) =>
        p.codigo === code || p.name.toLowerCase().includes(code.toLowerCase())
      );
      if (match) {
        addProductById(match.id);
        toast.success(`${match.name} agregado`);
      } else {
        toast.error('Producto no encontrado');
      }
    }
    e.target.value = '';
  };

  const handleCameraScan = (code) => {
    setShowCamera(false);
    if (barcodeInputRef.current) {
      barcodeInputRef.current.value = code;
      barcodeInputRef.current.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    }
  };

  const addProduct = () => {
    if (!selectedProduct) return;
    addProductById(selectedProduct);
    setSelectedProduct('');
  };

  const updateQty = (id, delta) => {
    setCart(cart.map((c) => {
      if (String(c.id) !== String(id)) return c;
      const newQty = c.quantity + delta;
      if (newQty < 1) return c;
      const prod = products.find((p) => String(p.id) === String(id));
      if (delta > 0 && prod && newQty > prod.existencias) { toast.error('Sin stock suficiente'); return c; }
      return { ...c, quantity: newQty };
    }));
  };

  const total = cart.reduce((sum, c) => sum + (c.price * c.quantity), 0);
  const iva = total * 0.16;
  const totalConIva = total + iva;

  const handleSubmit = async () => {
    if (!selectedUser) { toast.error('Selecciona un cliente'); return; }
    if (cart.length === 0) { toast.error('Agrega al menos un producto'); return; }
    setSaving(true);
    try {
      await axiosInstance.post('/sales', {
        user_id: selectedUser,
        products: cart.map((c) => ({ product_id: c.id, quantity: c.quantity, price: c.price })),
        metodo_pago: metodoPago,
        observaciones,
      });
      toast.success('Venta registrada exitosamente');
      onClose();
      onSaved();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Error al registrar venta');
    } finally { setSaving(false); }
  };

  return (
    <>
      {showCamera && <BarcodeScanner onScan={handleCameraScan} onClose={() => setShowCamera(false)} />}

      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transition-colors duration-200">
          <div className="flex items-center p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
            <ShoppingCart size={24} className="text-primary-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Nueva Venta — Punto de Venta</h2>
          </div>

          <div className="p-6 space-y-5">
            {/* Barcode scanner row */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                <Barcode size={14} /> Escanear / Buscar por Código
              </label>
              <div className="flex gap-2">
                <input
                  ref={barcodeInputRef}
                  type="text"
                  className="form-control flex-1 font-mono"
                  placeholder="Escanea o escribe el código y presiona Enter..."
                  onKeyDown={handleBarcodeKeyDown}
                />
                <button type="button" onClick={() => setShowCamera(true)}
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  title="Usar cámara">
                  <Camera size={20} />
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-400">Compatible con lectores USB. Presiona Enter para agregar.</p>
            </div>

            {/* Select product */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Agregar desde lista</label>
              <div className="flex gap-2">
                <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className="form-control flex-1">
                  <option value="">Seleccionar producto...</option>
                  {products.filter((p) => p.existencias > 0).map((p) => (
                    <option key={p.id} value={String(p.id)}>
                      {p.codigo ? `[${p.codigo}] ` : ''}{p.name} — Stock: {p.existencias} — ${parseFloat(p.price).toFixed(2)}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={addProduct} className="btn btn-primary whitespace-nowrap flex items-center gap-1">
                  <Plus size={16} /> Agregar
                </button>
              </div>
            </div>

            {/* Client */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cliente *</label>
              <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="form-control">
                <option value="">Seleccionar cliente...</option>
                {users.map((u) => <option key={u.id} value={String(u.id)}>{u.name} — {u.email}</option>)}
              </select>
            </div>

            {/* Payment method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                <CreditCard size={14} /> Método de Pago
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {METODOS_PAGO.map((m) => (
                  <button key={m.value} type="button" onClick={() => setMetodoPago(m.value)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-xs font-medium ${
                      metodoPago === m.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}>
                    <span className="text-lg">{m.icon}</span>
                    <span className="text-center leading-tight">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cart table */}
            {cart.length > 0 && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      {['Producto', 'Precio', 'Cant.', 'Subtotal', ''].map((h) => (
                        <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {cart.map((item) => (
                      <tr key={item.id}>
                        <td className="px-3 py-2 text-gray-800 dark:text-white">
                          <p className="font-medium line-clamp-1">{item.name}</p>
                          {item.codigo && <p className="font-mono text-xs text-gray-400">{item.codigo}</p>}
                        </td>
                        <td className="px-3 py-2 text-gray-600 dark:text-gray-400">${parseFloat(item.price).toFixed(2)}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1">
                            <button onClick={() => updateQty(item.id, -1)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
                              <Minus size={12} />
                            </button>
                            <span className="w-7 text-center text-gray-800 dark:text-white text-sm font-medium">{item.quantity}</span>
                            <button onClick={() => updateQty(item.id, 1)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
                              <Plus size={12} />
                            </button>
                          </div>
                        </td>
                        <td className="px-3 py-2 font-medium text-gray-800 dark:text-white">${(item.price * item.quantity).toFixed(2)}</td>
                        <td className="px-3 py-2">
                          <button onClick={() => setCart(cart.filter((c) => String(c.id) !== String(item.id)))}
                            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 space-y-1">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Subtotal:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>IVA (16%):</span>
                    <span>${iva.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-800 dark:text-white text-base border-t border-gray-200 dark:border-gray-600 pt-1 mt-1">
                    <span>Total:</span>
                    <span className="text-primary-600">${totalConIva.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Observations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Observaciones</label>
              <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)}
                rows={2} className="form-control resize-none" placeholder="Notas adicionales..." />
            </div>
          </div>

          <div className="flex justify-end gap-3 p-6 pt-0">
            <button type="button" onClick={onClose}
              className="btn bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">
              Cancelar
            </button>
            <button onClick={handleSubmit} disabled={saving || cart.length === 0 || !selectedUser}
              className="btn btn-primary disabled:opacity-50 flex items-center gap-2">
              {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              Registrar Venta
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SaleFormModal;
