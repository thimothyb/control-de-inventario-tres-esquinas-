import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axios';

const schema = z.object({
  provider_id: z.string().min(1, 'Selecciona un proveedor'),
  monto: z.coerce.number().min(0.01, 'El monto debe ser mayor a 0'),
  description: z.string().optional(),
  numero_factura: z.string().optional(),
  fecha_factura: z.string().optional(),
  fecha_vencimiento: z.string().min(1, 'La fecha de vencimiento es obligatoria'),
  pagada: z.boolean().optional(),
});

const SupplierDebtFormModal = ({ isOpen, onClose, editing, onSaved }) => {
  const [saving, setSaving] = useState(false);
  const [providers, setProviders] = useState([]);
  const { register, handleSubmit, reset, formState: { errors }, setError } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    axiosInstance.get('/providers').then((r) => setProviders(r.data?.data ?? r.data ?? [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (editing) {
        reset({
          provider_id: String(editing.provider_id ?? editing.provider?.id ?? ''),
          monto: editing.monto,
          description: editing.description ?? '',
          numero_factura: editing.numero_factura ?? '',
          fecha_factura: editing.fecha_factura ? editing.fecha_factura.slice(0, 10) : '',
          fecha_vencimiento: editing.fecha_vencimiento ? editing.fecha_vencimiento.slice(0, 10) : '',
          pagada: editing.pagada ?? false,
        });
      } else {
        const today = new Date().toISOString().slice(0, 10);
        reset({ provider_id: '', monto: 0, description: '', numero_factura: '', fecha_factura: today, fecha_vencimiento: '', pagada: false });
      }
    }
  }, [isOpen, editing, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editing) {
        await axiosInstance.put(`/supplier-debts/${editing.id}`, data);
        toast.success('Deuda actualizada');
      } else {
        await axiosInstance.post('/supplier-debts', data);
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg transition-colors duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <Wallet size={24} className="text-primary-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {editing ? 'Editar Cuenta por Pagar' : 'Nueva Cuenta por Pagar'}
          </h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Proveedor *</label>
            <select {...register('provider_id')} className="form-control">
              <option value="">Seleccionar proveedor</option>
              {providers.map((p) => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
            </select>
            {errors.provider_id && <p className="mt-1 text-xs text-red-500">{errors.provider_id.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto *</label>
            <input {...register('monto')} type="number" step="0.01" min="0" className="form-control" />
            {errors.monto && <p className="mt-1 text-xs text-red-500">{errors.monto.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
            <textarea {...register('description')} rows={2} className="form-control resize-none" placeholder="Detalle de la deuda" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nº Factura</label>
              <input {...register('numero_factura')} className="form-control" placeholder="FAC-001" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha Factura</label>
              <input {...register('fecha_factura')} type="date" className="form-control" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de Vencimiento *</label>
            <input {...register('fecha_vencimiento')} type="date" className="form-control" />
            {errors.fecha_vencimiento && <p className="mt-1 text-xs text-red-500">{errors.fecha_vencimiento.message}</p>}
          </div>

          {editing && (
            <div className="flex items-center gap-2">
              <input {...register('pagada')} type="checkbox" id="pagada_supplier" className="w-4 h-4 text-primary-600 rounded" />
              <label htmlFor="pagada_supplier" className="text-sm font-medium text-gray-700 dark:text-gray-300">Marcar como pagada</label>
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

export default SupplierDebtFormModal;
