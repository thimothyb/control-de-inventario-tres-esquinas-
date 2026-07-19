import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosInstance from '../../api/axios';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  password_confirmation: z.string(),
}).refine((d) => d.password === d.password_confirmation, {
  message: 'Las contraseñas no coinciden',
  path: ['password_confirmation'],
});

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    if (!token || !email) { toast.error('Enlace inválido'); return; }

    setLoading(true);
    try {
      await axiosInstance.post('/reset-password', { token, email, ...data });
      toast.success('Contraseña actualizada exitosamente');
      navigate('/login');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Error al restablecer la contraseña');
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

          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Nueva Contraseña</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Ingresa tu nueva contraseña.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {[
              { name: 'password', label: 'Nueva Contraseña', placeholder: '••••••••' },
              { name: 'password_confirmation', label: 'Confirmar Contraseña', placeholder: '••••••••' },
            ].map(({ name, label, placeholder }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input {...register(name)} type={showPassword ? 'text' : 'password'} placeholder={placeholder}
                    className="form-control pl-10 pr-10" />
                  {name === 'password' && (
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  )}
                </div>
                {errors[name] && <p className="mt-1 text-xs text-red-500">{errors[name].message}</p>}
              </div>
            ))}
            <button type="submit" disabled={loading}
              className="btn btn-primary w-full disabled:opacity-50 flex items-center justify-center">
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
              Restablecer Contraseña
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
