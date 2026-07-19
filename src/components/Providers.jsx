import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axios';
import DataTable from './DataTable';
import ConfirmDialog from './ConfirmDialog';
import ProviderFormModal from './ProviderFormModal';

const Providers = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleting_loading, setDeletingLoading] = useState(false);

  const fetchProviders = async () => {
    try {
      const res = await axiosInstance.get('/providers');
      setProviders(res.data?.data ?? res.data ?? []);
    } catch { toast.error('Error al cargar proveedores'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProviders(); }, []);

  const handleDelete = async () => {
    setDeletingLoading(true);
    try {
      await axiosInstance.delete(`/providers/${deleting.id}`);
      toast.success('Proveedor eliminado');
      setDeleting(null);
      fetchProviders();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Error al eliminar');
    } finally { setDeletingLoading(false); }
  };

  const columns = useMemo(() => [
    { accessorKey: 'id', header: 'ID', size: 80 },
    { accessorKey: 'name', header: 'Nombre' },
    { accessorKey: 'phone', header: 'Teléfono' },
    { accessorKey: 'email', header: 'Correo' },
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
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Proveedores</h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <DataTable
            columns={columns} data={providers} searchPlaceholder="Buscar proveedores..."
            actions={
              <button onClick={() => { setEditing(null); setShowModal(true); }} className="btn btn-primary flex items-center gap-2">
                <Plus size={18} /> Nuevo Proveedor
              </button>
            }
          />
        )}

        <ProviderFormModal isOpen={showModal} onClose={() => setShowModal(false)}
          editing={editing} onSaved={fetchProviders} />

        <ConfirmDialog isOpen={!!deleting} title="Eliminar Proveedor"
          message={`¿Estás seguro de que deseas eliminar "${deleting?.name}"?`}
          onConfirm={handleDelete} onCancel={() => setDeleting(null)} loading={deleting_loading} />
      </div>
    </>
  );
};

export default Providers;
