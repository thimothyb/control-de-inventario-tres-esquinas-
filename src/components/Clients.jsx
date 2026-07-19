import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axios';
import DataTable from './DataTable';
import ConfirmDialog from './ConfirmDialog';
import ClientFormModal from './ClientFormModal';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  const fetchClients = async () => {
    try {
      const res = await axiosInstance.get('/clients');
      setClients(res.data?.data ?? res.data ?? []);
    } catch { toast.error('Error al cargar clientes'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchClients(); }, []);

  const handleDelete = async () => {
    setDeletingLoading(true);
    try {
      await axiosInstance.delete(`/clients/${deleting.id}`);
      toast.success('Cliente eliminado');
      setDeleting(null);
      fetchClients();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Error al eliminar');
    } finally { setDeletingLoading(false); }
  };

  const columns = useMemo(() => [
    { accessorKey: 'nombre', header: 'Nombre' },
    { accessorKey: 'cedula_identidad', header: 'Cédula' },
    { accessorKey: 'telefono', header: 'Teléfono', cell: ({ getValue }) => getValue() || '—' },
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
          <Users size={28} className="text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Clientes</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <DataTable
            columns={columns} data={clients} searchPlaceholder="Buscar clientes..."
            actions={
              <button onClick={() => { setEditing(null); setShowModal(true); }} className="btn btn-primary flex items-center gap-2">
                <Plus size={18} /> Nuevo Cliente
              </button>
            }
          />
        )}

        <ClientFormModal isOpen={showModal} onClose={() => setShowModal(false)}
          editing={editing} onSaved={fetchClients} />

        <ConfirmDialog isOpen={!!deleting} title="Eliminar Cliente"
          message={`¿Estás seguro de que deseas eliminar "${deleting?.nombre}"?`}
          onConfirm={handleDelete} onCancel={() => setDeleting(null)} loading={deletingLoading} />
      </div>
    </>
  );
};

export default Clients;
