import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosInstance from '../../api/axios';
import { Mail, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({ email: z.string().email('Correo inválido') });

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await axiosInstance.post('/forgot-password', data);
      setSent(true);
      toast.success('Correo enviado exitosamente');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Error al enviar el correo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 transition-colors duration-200">
          <Link to="/login" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6 text-sm">
            <ArrowLeft size={16} className="mr-1" /> Volver al inicio de sesión
          </Link>

          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Recuperar Contraseña</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </p>

          {sent ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="text-green-600 dark:text-green-400" size={32} />
              </div>
              <p className="text-gray-700 dark:text-gray-300 font-medium">¡Correo enviado!</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                Revisa tu bandeja de entrada y sigue las instrucciones.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input {...register('email')} type="email" placeholder="tu@correo.com" className="form-control pl-10" />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>
              <button type="submit" disabled={loading}
                className="btn btn-primary w-full disabled:opacity-50 flex items-center justify-center">
                {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
                Enviar Enlace
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
