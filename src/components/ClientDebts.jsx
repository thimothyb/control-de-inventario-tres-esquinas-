import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axios';
import DataTable from './DataTable';
import ConfirmDialog from './ConfirmDialog';
import ClientDebtFormModal from './ClientDebtFormModal';

const ClientDebts = () => {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  const fetchDebts = async () => {
    try {
      const res = await axiosInstance.get('/client-debts');
      setDebts(res.data?.data ?? res.data ?? []);
    } catch { toast.error('Error al cargar cuentas por cobrar'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDebts(); }, []);

  const handleDelete = async () => {
    setDeletingLoading(true);
    try {
      await axiosInstance.delete(`/client-debts/${deleting.id}`);
      toast.success('Cuenta eliminada');
      setDeleting(null);
      fetchDebts();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Error al eliminar');
    } finally { setDeletingLoading(false); }
  };

  const togglePaid = async (debt) => {
    try {
      await axiosInstance.put(`/client-debts/${debt.id}`, { pagada: !debt.pagada });
      toast.success(debt.pagada ? 'Marcada como pendiente' : 'Marcada como cobrada');
      fetchDebts();
    } catch { toast.error('Error al actualizar'); }
  };

  const columns = useMemo(() => [
    { accessorFn: (r) => r.client?.nombre ?? '—', id: 'client', header: 'Cliente' },
    { accessorFn: (r) => r.client?.cedula_identidad ?? '—', id: 'cedula', header: 'Cédula' },
    { accessorKey: 'monto', header: 'Monto',
      cell: ({ getValue }) => `$${parseFloat(getValue() ?? 0).toFixed(2)}` },
    { accessorKey: 'description', header: 'Descripción',
      cell: ({ getValue }) => <span className="line-clamp-1">{getValue() || '—'}</span> },
    {
      accessorKey: 'pagada', header: 'Estado',
      cell: ({ row }) => (
        <button onClick={() => togglePaid(row.original)}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
            row.original.pagada
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 hover:bg-green-200'
              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 hover:bg-red-200'
          }`}>
          {row.original.pagada ? 'Cobrada' : 'Pendiente'}
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Cuentas por Cobrar</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <DataTable
            columns={columns} data={debts} searchPlaceholder="Buscar cuentas por cobrar..."
            actions={
              <button onClick={() => { setEditing(null); setShowModal(true); }} className="btn btn-primary flex items-center gap-2">
                <Plus size={18} /> Nueva Cuenta
              </button>
            }
          />
        )}

        <ClientDebtFormModal isOpen={showModal} onClose={() => setShowModal(false)}
          editing={editing} onSaved={fetchDebts} />

        <ConfirmDialog isOpen={!!deleting} title="Eliminar Cuenta por Cobrar"
          message={`¿Estás seguro de que deseas eliminar esta cuenta?`}
          onConfirm={handleDelete} onCancel={() => setDeleting(null)} loading={deletingLoading} />
      </div>
    </>
  );
};

export default ClientDebts;
