import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axios';

const schema = z.object({
  user_id: z.string().min(1, 'El usuario es requerido'),
  description: z.string().min(1, 'La descripción es requerida'),
  monto: z.coerce.number().min(0.01, 'El monto debe ser mayor a 0'),
  pagada: z.boolean().optional(),
});

const DebtFormModal = ({ isOpen, onClose, editing, onSaved }) => {
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState([]);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    axiosInstance.get('/users').then((r) => setUsers(r.data?.data ?? r.data ?? [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (editing) {
        reset({
          user_id: String(editing.user_id ?? editing.user?.id ?? ''),
          description: editing.description,
          monto: editing.monto,
          pagada: editing.pagada ?? false,
        });
      } else {
        reset({ user_id: '', description: '', monto: 0, pagada: false });
      }
    }
  }, [isOpen, editing, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editing) {
        await axiosInstance.put(`/debts/${editing.id}`, data);
        toast.success('Deuda actualizada');
      } else {
        await axiosInstance.post('/debts', data);
        toast.success('Deuda creada');
      }
      onClose();
      onSaved();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Error al guardar');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md transition-colors duration-200">
        <div className="flex items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <Wallet size={24} className="text-primary-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {editing ? 'Editar Deuda' : 'Nueva Deuda'}
          </h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Usuario *</label>
            <select {...register('user_id')} className="form-control">
              <option value="">Seleccionar usuario</option>
              {users.map((u) => <option key={u.id} value={String(u.id)}>{u.name} — {u.email}</option>)}
            </select>
            {errors.user_id && <p className="mt-1 text-xs text-red-500">{errors.user_id.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción *</label>
            <textarea {...register('description')} rows={3} className="form-control resize-none" placeholder="Descripción de la deuda" />
            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto *</label>
            <input {...register('monto')} type="number" step="0.01" min="0" className="form-control" />
            {errors.monto && <p className="mt-1 text-xs text-red-500">{errors.monto.message}</p>}
          </div>

          {editing && (
            <div className="flex items-center gap-2">
              <input {...register('pagada')} type="checkbox" id="pagada" className="w-4 h-4 text-primary-600 rounded" />
              <label htmlFor="pagada" className="text-sm font-medium text-gray-700 dark:text-gray-300">Marcar como pagada</label>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
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
  );
};

export default DebtFormModal;
