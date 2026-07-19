import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Users } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axios';

const createSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Correo inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  role: z.enum(['admin', 'empleado']),
});

const editSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Correo inválido'),
  password: z.string().optional().or(z.literal('')),
  role: z.enum(['admin', 'empleado']),
});

const UserFormModal = ({ isOpen, onClose, editing, onSaved }) => {
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(editing ? editSchema : createSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (editing) {
        reset({
          name: editing.name,
          email: editing.email,
          password: '',
          role: editing.roles?.[0]?.name ?? editing.role ?? 'empleado',
        });
      } else {
        reset({ name: '', email: '', password: '', role: 'empleado' });
      }
    }
  }, [isOpen, editing, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = { ...data };
      if (editing && !payload.password) delete payload.password;

      if (editing) {
        await axiosInstance.put(`/users/${editing.id}`, payload);
        toast.success('Usuario actualizado');
      } else {
        await axiosInstance.post('/users', payload);
        toast.success('Usuario creado');
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
          <Users size={24} className="text-primary-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {editing ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre *</label>
            <input {...register('name')} className="form-control" placeholder="Nombre completo" />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correo *</label>
            <input {...register('email')} type="email" className="form-control" placeholder="usuario@correo.com" />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {editing ? 'Nueva Contraseña (dejar en blanco para no cambiar)' : 'Contraseña *'}
            </label>
            <input {...register('password')} type="password" className="form-control" placeholder="••••••••" />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rol *</label>
            <select {...register('role')} className="form-control">
              <option value="empleado">Empleado</option>
              <option value="admin">Administrador</option>
            </select>
            {errors.role && <p className="mt-1 text-xs text-red-500">{errors.role.message}</p>}
          </div>

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

export default UserFormModal;
