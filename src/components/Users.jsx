import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axios';
import DataTable from './DataTable';
import ConfirmDialog from './ConfirmDialog';
import UserFormModal from './UserFormModal';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get('/users');
      setUsers(res.data?.data ?? res.data ?? []);
    } catch { toast.error('Error al cargar usuarios'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async () => {
    setDeletingLoading(true);
    try {
      await axiosInstance.delete(`/users/${deleting.id}`);
      toast.success('Usuario eliminado');
      setDeleting(null);
      fetchUsers();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Error al eliminar');
    } finally { setDeletingLoading(false); }
  };

  const columns = useMemo(() => [
    { accessorKey: 'id', header: 'ID', size: 80 },
    {
      id: 'avatar', header: '',
      cell: ({ row }) => (
        <img className="h-8 w-8 rounded-full object-cover"
          src={`https://ui-avatars.com/api/?name=${row.original.name}&background=random&size=32`}
          alt={row.original.name} />
      ),
    },
    { accessorKey: 'name', header: 'Nombre' },
    { accessorKey: 'email', header: 'Correo' },
    {
      id: 'role', header: 'Rol',
      accessorFn: (r) => r.roles?.[0]?.name ?? r.role ?? '—',
      cell: ({ getValue }) => {
        const role = getValue();
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
              : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
          }`}>
            {role}
          </span>
        );
      },
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
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Usuarios</h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <DataTable
            columns={columns} data={users} searchPlaceholder="Buscar usuarios..."
            actions={
              <button onClick={() => { setEditing(null); setShowModal(true); }} className="btn btn-primary flex items-center gap-2">
                <Plus size={18} /> Nuevo Usuario
              </button>
            }
          />
        )}

        <UserFormModal isOpen={showModal} onClose={() => setShowModal(false)}
          editing={editing} onSaved={fetchUsers} />

        <ConfirmDialog isOpen={!!deleting} title="Eliminar Usuario"
          message={`¿Estás seguro de que deseas eliminar a "${deleting?.name}"?`}
          onConfirm={handleDelete} onCancel={() => setDeleting(null)} loading={deletingLoading} />
      </div>
    </>
  );
};

export default Users;
