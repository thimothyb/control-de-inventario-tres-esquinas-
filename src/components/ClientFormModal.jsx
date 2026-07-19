import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axios';

const schema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  cedula_identidad: z.string().min(1, 'La cédula es requerida'),
  telefono: z.string().optional(),
});

const ClientFormModal = ({ isOpen, onClose, editing, onSaved }) => {
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset, formState: { errors }, setError } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (isOpen) {
      reset(editing
        ? { nombre: editing.nombre, cedula_identidad: editing.cedula_identidad ?? '', telefono: editing.telefono ?? '' }
        : { nombre: '', cedula_identidad: '', telefono: '' });
    }
  }, [isOpen, editing, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editing) {
        await axiosInstance.put(`/clients/${editing.id}`, data);
        toast.success('Cliente actualizado');
      } else {
        await axiosInstance.post('/clients', data);
        toast.success('Cliente creado');
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
          <UserPlus size={24} className="text-primary-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {editing ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {[
            { name: 'nombre', label: 'Nombre', placeholder: 'Nombre del cliente', required: true },
            { name: 'cedula_identidad', label: 'Cédula de Identidad', placeholder: 'V-12345678', required: true },
            { name: 'telefono', label: 'Teléfono', placeholder: '+58 412 000 0000' },
          ].map(({ name, label, placeholder, type = 'text' }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
              <input {...register(name)} type={type} className="form-control" placeholder={placeholder} />
              {errors[name] && <p className="mt-1 text-xs text-red-500">{errors[name].message}</p>}
            </div>
          ))}
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

export default ClientFormModal;
