import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Banknote, CreditCard, Smartphone, Building2, Fingerprint, HandCoins, X, UserPlus, Plus, Search, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axios';

const METODOS = [
  { value: 'efectivo', label: 'Efectivo', icon: Banknote, color: 'green', needsRef: false },
  { value: 'punto_de_venta', label: 'Punto de Venta', icon: CreditCard, color: 'blue', needsRef: false },
  { value: 'transferencia', label: 'Transferencia', icon: Building2, color: 'purple', needsRef: true },
  { value: 'pago_movil', label: 'Pago Móvil', icon: Smartphone, color: 'orange', needsRef: true },
  { value: 'biopago', label: 'Biopago', icon: Fingerprint, color: 'teal', needsRef: false },
  { value: 'credito', label: 'Crédito', icon: HandCoins, color: 'red', needsRef: false },
];

const COLOR_MAP = {
  green: {
    border: 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    icon: 'text-green-600',
  },
  blue: {
    border: 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    icon: 'text-blue-600',
  },
  purple: {
    border: 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    icon: 'text-purple-600',
  },
  red: {
    border: 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    icon: 'text-red-600',
  },
  orange: {
    border: 'border-orange-500 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    icon: 'text-orange-600',
  },
  teal: {
    border: 'border-teal-500 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
    icon: 'text-teal-600',
  },
};

const ClientSearchBox = ({ clients, clientId, clientSearch, showDropdown, onSearchChange, onSelect, onClear, onFocus, onBlur, onNewClient }) => {
  const filtered = useMemo(() => {
    if (!clientSearch.trim()) return clients;
    const q = clientSearch.toLowerCase();
    return clients.filter((c) =>
      c.nombre.toLowerCase().includes(q) ||
      c.cedula_identidad.toLowerCase().includes(q) ||
      (c.telefono && c.telefono.includes(q))
    );
  }, [clients, clientSearch]);

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={clientSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
            className="form-control pl-9 pr-8 text-sm"
            placeholder="Buscar por nombre o cédula..."
          />
          {clientId && (
            <button type="button" onClick={onClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <XCircle size={16} />
            </button>
          )}
        </div>

        {showDropdown && !clientId && (
          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-400 text-center">Sin resultados</div>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onSelect(c.id, `${c.nombre} — ${c.cedula_identidad}`)}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors border-b border-gray-100 dark:border-gray-600 last:border-0"
                >
                  <span className="font-medium text-gray-800 dark:text-white">{c.nombre}</span>
                  <span className="text-gray-400 ml-2">{c.cedula_identidad}</span>
                  {c.telefono && <span className="text-gray-400 ml-2 text-xs">({c.telefono})</span>}
                </button>
              ))
            )}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onNewClient}
        className="btn btn-primary flex items-center gap-1 px-3"
        title="Agregar nuevo cliente"
      >
        <Plus size={16} />
      </button>
    </div>
  );
};

const CheckoutModal = ({ isOpen, onClose, onConfirm, total, totalBs, loading, clients = [], onClientsChanged }) => {
  const [selected, setSelected] = useState('');
  const [referencia, setReferencia] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [error, setError] = useState('');
  const [showNewClient, setShowNewClient] = useState(false);
  const [newClient, setNewClient] = useState({ nombre: '', cedula_identidad: '', telefono: '' });
  const [savingClient, setSavingClient] = useState(false);

  if (!isOpen) return null;

  const metodoActual = METODOS.find((m) => m.value === selected);
  const needsRef = metodoActual?.needsRef ?? false;
  const isCredito = selected === 'credito';

  const handleConfirm = () => {
    if (!selected) {
      setError('Selecciona un método de pago');
      return;
    }
    if (needsRef && !referencia.trim()) {
      setError('El número de referencia es obligatorio');
      return;
    }
    if (isCredito && !clientId) {
      setError('Debe seleccionar un cliente para ventas a crédito');
      return;
    }
    setError('');
    const obs = needsRef ? `Ref: ${referencia.trim()}` : '';
    onConfirm(selected, obs, clientId || null);
  };

  const handleSelect = (value) => {
    setSelected(value);
    setReferencia('');
    setError('');
    setShowNewClient(false);
    if (!clientId) { setClientSearch(''); setShowClientDropdown(false); }
  };

  const handleSaveNewClient = async () => {
    if (!newClient.nombre.trim() || !newClient.cedula_identidad.trim()) {
      toast.error('Nombre y cédula son obligatorios');
      return;
    }
    setSavingClient(true);
    try {
      const res = await axiosInstance.post('/clients', newClient);
      const created = res.data;
      toast.success('Cliente creado');
      if (onClientsChanged) onClientsChanged();
      setClientId(created.id);
      setClientSearch(`${created.nombre} — ${created.cedula_identidad}`);
      setShowClientDropdown(false);
      setShowNewClient(false);
      setNewClient({ nombre: '', cedula_identidad: '', telefono: '' });
    } catch (e) {
      const errs = e?.response?.data?.errors;
      if (errs) {
        const msg = Object.values(errs).flat().join(', ');
        toast.error(msg);
      } else {
        toast.error(e?.response?.data?.message || 'Error al crear cliente');
      }
    } finally { setSavingClient(false); }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md transition-colors duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <CreditCard size={22} className="text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Método de Pago</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Total */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total a pagar</p>
            <p className="text-3xl font-bold text-primary-600 mt-1">${total.toFixed(2)}</p>
            {totalBs && (
              <p className="text-lg font-semibold text-green-600 dark:text-green-400 mt-0.5">Bs {totalBs}</p>
            )}
          </div>

          {/* Payment method grid */}
          <div className="grid grid-cols-3 gap-3">
            {METODOS.map((m) => {
              const Icon = m.icon;
              const isSelected = selected === m.value;
              const colors = COLOR_MAP[m.color];

              return (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => handleSelect(m.value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? colors.border
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon size={28} className={isSelected ? colors.icon : 'text-gray-400'} />
                  <span className="text-sm font-medium text-center leading-tight">{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* Reference number input */}
          {needsRef && (
            <div className="animate-fadeIn">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Número de Referencia *
              </label>
              <input
                type="text"
                value={referencia}
                onChange={(e) => { setReferencia(e.target.value); setError(''); }}
                className="form-control font-mono"
                placeholder="Ej: 00012345678"
                autoFocus
              />
              <p className="mt-1 text-xs text-gray-400">
                {selected === 'transferencia'
                  ? 'Ingresa el número de referencia de la transferencia bancaria'
                  : 'Ingresa el número de referencia del pago móvil'}
              </p>
            </div>
          )}

          {/* Client selector — always visible, required only for crédito */}
          {selected && (
            <div className="animate-fadeIn space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cliente {isCredito ? '*' : '(opcional)'}
              </label>
              <ClientSearchBox
                clients={clients}
                clientId={clientId}
                clientSearch={clientSearch}
                showDropdown={showClientDropdown}
                onSearchChange={(v) => { setClientSearch(v); setShowClientDropdown(true); setError(''); }}
                onSelect={(id, name) => { setClientId(id); setClientSearch(name); setShowClientDropdown(false); setError(''); }}
                onClear={() => { setClientId(''); setClientSearch(''); setShowClientDropdown(false); }}
                onFocus={() => setShowClientDropdown(true)}
                onBlur={() => setTimeout(() => setShowClientDropdown(false), 150)}
                onNewClient={() => setShowNewClient(!showNewClient)}
              />
              {isCredito && (
                <p className="text-xs text-gray-400">Se generará automáticamente una cuenta por cobrar</p>
              )}

              {/* Inline new client form */}
              {showNewClient && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-3 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-2 mb-1">
                    <UserPlus size={16} className="text-primary-600" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nuevo Cliente</span>
                  </div>
                  <input
                    type="text"
                    value={newClient.nombre}
                    onChange={(e) => setNewClient({ ...newClient, nombre: e.target.value })}
                    className="form-control text-sm"
                    placeholder="Nombre *"
                  />
                  <input
                    type="text"
                    value={newClient.cedula_identidad}
                    onChange={(e) => setNewClient({ ...newClient, cedula_identidad: e.target.value })}
                    className="form-control text-sm"
                    placeholder="Cédula de identidad *"
                  />
                  <input
                    type="text"
                    value={newClient.telefono}
                    onChange={(e) => setNewClient({ ...newClient, telefono: e.target.value })}
                    className="form-control text-sm"
                    placeholder="Teléfono (opcional)"
                  />
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setShowNewClient(false)}
                      className="btn text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 px-3 py-1.5">
                      Cancelar
                    </button>
                    <button type="button" onClick={handleSaveNewClient} disabled={savingClient}
                      className="btn btn-primary text-sm px-3 py-1.5 disabled:opacity-50 flex items-center gap-1">
                      {savingClient && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                      Guardar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 text-center font-medium">{error}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 p-6 pt-0">
          <button
            type="button"
            onClick={onClose}
            className="btn bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !selected}
            className="btn btn-primary disabled:opacity-50 flex items-center gap-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {loading ? 'Procesando...' : 'Confirmar Pago'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
