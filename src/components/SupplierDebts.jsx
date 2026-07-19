import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, AlertTriangle, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axios';
import DataTable from './DataTable';
import ConfirmDialog from './ConfirmDialog';
import SupplierDebtFormModal from './SupplierDebtFormModal';

const dueBadge = (dias) => {
  if (dias === null || dias === undefined) return null;
  if (dias < 0)
    return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">Vencida ({Math.abs(dias)}d)</span>;
  if (dias <= 7)
    return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">Vence en {dias}d</span>;
  return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">{dias}d restantes</span>;
};

const SupplierDebts = () => {
  const [debts, setDebts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  const fetchDebts = async () => {
    try {
      const [debtsRes, alertsRes] = await Promise.all([
        axiosInstance.get('/supplier-debts'),
        axiosInstance.get('/supplier-debts/alerts?days=7'),
      ]);
      setDebts(debtsRes.data?.data ?? debtsRes.data ?? []);
      setAlerts(alertsRes.data?.data ?? alertsRes.data ?? []);
    } catch { toast.error('Error al cargar cuentas por pagar'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDebts(); }, []);

  const handleDelete = async () => {
    setDeletingLoading(true);
    try {
      await axiosInstance.delete(`/supplier-debts/${deleting.id}`);
      toast.success('Cuenta eliminada');
      setDeleting(null);
      fetchDebts();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Error al eliminar');
    } finally { setDeletingLoading(false); }
  };

  const togglePaid = async (debt) => {
    try {
      await axiosInstance.put(`/supplier-debts/${debt.id}`, { pagada: !debt.pagada });
      toast.success(debt.pagada ? 'Marcada como pendiente' : 'Marcada como pagada');
      fetchDebts();
    } catch { toast.error('Error al actualizar'); }
  };

  const columns = useMemo(() => [
    { accessorFn: (r) => r.provider?.name ?? '—', id: 'provider', header: 'Proveedor' },
    { accessorKey: 'monto', header: 'Monto',
      cell: ({ getValue }) => `$${parseFloat(getValue() ?? 0).toFixed(2)}` },
    { accessorKey: 'numero_factura', header: 'Nº Factura', cell: ({ getValue }) => getValue() || '—' },
    { accessorKey: 'fecha_vencimiento', header: 'Vencimiento',
      cell: ({ row }) => {
        const d = row.original.fecha_vencimiento;
        return d ? new Date(d).toLocaleDateString('es-VE') : '—';
      },
    },
    { id: 'dias', header: 'Días',
      cell: ({ row }) => row.original.pagada ? '—' : dueBadge(row.original.dias_restantes),
    },
    {
      accessorKey: 'pagada', header: 'Estado',
      cell: ({ row }) => (
        <button onClick={() => togglePaid(row.original)}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
            row.original.pagada
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 hover:bg-green-200'
              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 hover:bg-red-200'
          }`}>
          {row.original.pagada ? 'Pagada' : 'Pendiente'}
        </button>
      ),
    },
    {
      id: 'actions', header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button onClick={() => { setEditing(row.original); setShowModal(true); }}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors">
            <Edit2 size={16} />
          </button>
          <button onClick={() => setDeleting(row.original)}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ], []);

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Wallet size={28} className="text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Cuentas por Pagar</h1>
        </div>

        {alerts.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={20} className="text-yellow-600" />
              <span className="font-semibold text-yellow-800 dark:text-yellow-300">
                {alerts.length} deuda{alerts.length > 1 ? 's' : ''} próxima{alerts.length > 1 ? 's' : ''} a vencer o vencida{alerts.length > 1 ? 's' : ''}
              </span>
            </div>
            <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
              {alerts.slice(0, 5).map((a) => (
                <li key={a.id}>
                  {a.provider?.name ?? 'Proveedor'} — ${parseFloat(a.monto).toFixed(2)} — {dueBadge(a.dias_restantes)}
                </li>
              ))}
              {alerts.length > 5 && <li className="italic">y {alerts.length - 5} más...</li>}
            </ul>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <DataTable
            columns={columns} data={debts} searchPlaceholder="Buscar cuentas por pagar..."
            actions={
              <button onClick={() => { setEditing(null); setShowModal(true); }} className="btn btn-primary flex items-center gap-2">
                <Plus size={18} /> Nueva Cuenta
              </button>
            }
          />
        )}

        <SupplierDebtFormModal isOpen={showModal} onClose={() => setShowModal(false)}
          editing={editing} onSaved={fetchDebts} />

        <ConfirmDialog isOpen={!!deleting} title="Eliminar Cuenta por Pagar"
          message={`¿Estás seguro de que deseas eliminar esta cuenta?`}
          onConfirm={handleDelete} onCancel={() => setDeleting(null)} loading={deletingLoading} />
      </div>
    </>
  );
};

export default SupplierDebts;
