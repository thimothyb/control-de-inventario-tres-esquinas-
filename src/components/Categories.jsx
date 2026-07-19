import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axios';
import DataTable from './DataTable';
import ConfirmDialog from './ConfirmDialog';

const schema = z.object({ nombre: z.string().min(1, 'El nombre es requerido') });

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get('/categories');
      setCategories(res.data?.data ?? res.data ?? []);
    } catch { toast.error('Error al cargar categorías'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openNew = () => { setEditing(null); reset({ nombre: '' }); setShowModal(true); };
  const openEdit = (cat) => { setEditing(cat); reset({ nombre: cat.nombre }); setShowModal(true); };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editing) {
        await axiosInstance.put(`/categories/${editing.id}`, data);
        toast.success('Categoría actualizada');
      } else {
        await axiosInstance.post('/categories', data);
        toast.success('Categoría creada');
      }
      setShowModal(false);
      fetchCategories();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Error al guardar');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await axiosInstance.delete(`/categories/${deleting.id}`);
      toast.success('Categoría eliminada');
      setDeleting(null);
      fetchCategories();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Error al eliminar');
    } finally { setSaving(false); }
  };

  const columns = useMemo(() => [
    { accessorKey: 'id', header: 'ID', size: 80 },
    { accessorKey: 'nombre', header: 'Nombre' },
    {
      id: 'actions', header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(row.original)}
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
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Categorías</h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <DataTable
            columns={columns} data={categories} searchPlaceholder="Buscar categorías..."
            actions={
              <button onClick={openNew} className="btn btn-primary flex items-center gap-2">
                <Plus size={18} /> Nueva Categoría
              </button>
            }
          />
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md transition-colors duration-200">
              <div className="flex items-center p-6 border-b border-gray-200 dark:border-gray-700">
                <Tag size={24} className="text-primary-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {editing ? 'Editar Categoría' : 'Nueva Categoría'}
                </h2>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                  <input {...register('nombre')} className="form-control" placeholder="Nombre de la categoría" />
                  {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre.message}</p>}
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="btn bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">
                    Cancelar
                  </button>
                  <button type="submit" disabled={saving} className="btn btn-primary disabled:opacity-50 flex items-center gap-2">
                    {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                    {editing ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <ConfirmDialog isOpen={!!deleting} title="Eliminar Categoría"
          message={`¿Estás seguro de que deseas eliminar "${deleting?.nombre}"?`}
          onConfirm={handleDelete} onCancel={() => setDeleting(null)} loading={saving} />
      </div>
    </>
  );
};

export default Categories;
