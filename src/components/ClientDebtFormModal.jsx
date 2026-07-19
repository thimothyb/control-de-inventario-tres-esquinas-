import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axios';

const schema = z.object({
  client_id: z.string().min(1, 'Selecciona un cliente'),
  monto: z.coerce.number().min(0.01, 'El monto debe ser mayor a 0'),
  description: z.string().optional(),
  pagada: z.boolean().optional(),
});

const ClientDebtFormModal = ({ isOpen, onClose, editing, onSaved }) => {
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState([]);
  const { register, handleSubmit, reset, formState: { errors }, setError } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    axiosInstance.get('/clients').then((r) => setClients(r.data?.data ?? r.data ?? [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (editing) {
        reset({
          client_id: String(editing.client_id ?? editing.client?.id ?? ''),
          monto: editing.monto,
          description: editing.description ?? '',
          pagada: editing.pagada ?? false,
        });
      } else {
        reset({ client_id: '', monto: 0, description: '', pagada: false });
      }
    }
  }, [isOpen, editing, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editing) {
        await axiosInstance.put(`/client-debts/${editing.id}`, data);
        toast.success('Deuda actualizada');
      } else {
        await axiosInstance.post('/client-debts', data);
        toast.success('Deuda registrada');
      }
      onClose();
      onSaved();
    } catch (e) {
      const errs = e?.response?.data?.errors;
      if (errs) {
        Object.entries(errs).forEach(([k, v]) => setError(k, { message: Array.isArray(v) ? v[0] : v }));
      } else {
        toast.error(e?.response?.data?.message || 'Error al guardar');
      }
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md transition-colors duration-200">
        <div className="flex items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <Wallet size={24} className="text-primary-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {editing ? 'Editar Cuenta por Cobrar' : 'Nueva Cuenta por Cobrar'}
          </h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cliente *</label>
            <select {...register('client_id')} className="form-control">
              <option value="">Seleccionar cliente</option>
              {clients.map((c) => <option key={c.id} value={String(c.id)}>{c.nombre} — {c.cedula_identidad}</option>)}
            </select>
            {errors.client_id && <p className="mt-1 text-xs text-red-500">{errors.client_id.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto *</label>
            <input {...register('monto')} type="number" step="0.01" min="0" className="form-control" />
            {errors.monto && <p className="mt-1 text-xs text-red-500">{errors.monto.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
            <textarea {...register('description')} rows={3} className="form-control resize-none" placeholder="Detalle de la deuda" />
          </div>

          {editing && (
            <div className="flex items-center gap-2">
              <input {...register('pagada')} type="checkbox" id="pagada_client" className="w-4 h-4 text-primary-600 rounded" />
              <label htmlFor="pagada_client" className="text-sm font-medium text-gray-700 dark:text-gray-300">Marcar como pagada</label>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="btn bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary disabled:opacity-50 flex items-center gap-2">
              {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              {editing ? 'Actualizar' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientDebtFormModal;
