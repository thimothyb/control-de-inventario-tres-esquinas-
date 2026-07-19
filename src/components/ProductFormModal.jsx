import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Package, Upload, X, Barcode, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance, { UPLOADS_URL } from '../api/axios';
import BarcodeScanner from './BarcodeScanner';

const schema = z.object({
  codigo: z.string().optional(),
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Precio inválido'),
  existencias: z.coerce.number().int().min(0, 'Stock inválido'),
  category_id: z.string().min(1, 'La categoría es requerida'),
  provider_id: z.string().min(1, 'El proveedor es requerido'),
});

const ProductFormModal = ({ isOpen, onClose, editing, categories, providers, onSaved }) => {
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const fileRef = useRef();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (isOpen) {
      if (editing) {
        reset({
          codigo: editing.codigo ?? '',
          name: editing.name,
          description: editing.description ?? '',
          price: editing.price,
          existencias: editing.existencias,
          category_id: String(editing.categoria_id ?? editing.category?.id ?? ''),
          provider_id: String(editing.proveedor_id ?? editing.provider?.id ?? ''),
        });
        const ruta = editing.imagenes?.[0]?.ruta;
        setImagePreview(ruta ? `${UPLOADS_URL}/${ruta}` : null);
      } else {
        reset({ codigo: '', name: '', description: '', price: 0, existencias: 0, category_id: '', provider_id: '' });
        setImagePreview(null);
      }
      setImageFile(null);
    }
  }, [isOpen, editing, reset]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const generateCodigo = () => {
    const code = `PROD-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    setValue('codigo', code);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (v !== undefined && v !== null) formData.append(k, v); });
      if (imageFile) formData.append('imagenes[]', imageFile);

      if (editing) {
        formData.append('_method', 'PUT');
        await axiosInstance.post(`/products/${editing.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Producto actualizado');
      } else {
        await axiosInstance.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Producto creado');
      }
      onClose();
      onSaved();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Error al guardar');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {showCamera && <BarcodeScanner onScan={(code) => { setShowCamera(false); setValue('codigo', code); }} onClose={() => setShowCamera(false)} />}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transition-colors duration-200">
        <div className="flex items-center p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
          <Package size={24} className="text-primary-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {editing ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Código del producto */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <span className="flex items-center gap-1"><Barcode size={14} /> Código / ID del Producto</span>
              </label>
              <div className="flex gap-2">
                <input {...register('codigo')} className="form-control flex-1 font-mono"
                  placeholder="Escanea con lector o escribe el código..."
                  onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} />
                <button type="button" onClick={() => setShowCamera(true)}
                  className="p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  title="Escanear con cámara">
                  <Camera size={20} />
                </button>
                <button type="button" onClick={generateCodigo}
                  className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors whitespace-nowrap">
                  Generar
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Compatible con lectores USB de código de barras. También puedes escribirlo o escanearlo con la cámara.</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre *</label>
              <input {...register('name')} className="form-control" placeholder="Nombre del producto" />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
              <textarea {...register('description')} rows={3} className="form-control resize-none" placeholder="Descripción del producto" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Precio *</label>
              <input {...register('price')} type="number" step="0.01" min="0" className="form-control" />
              {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock *</label>
              <input {...register('existencias')} type="number" min="0" className="form-control" />
              {errors.existencias && <p className="mt-1 text-xs text-red-500">{errors.existencias.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría *</label>
              <select {...register('category_id')} className="form-control">
                <option value="">Seleccionar categoría</option>
                {categories.map((c) => <option key={c.id} value={String(c.id)}>{c.nombre}</option>)}
              </select>
              {errors.category_id && <p className="mt-1 text-xs text-red-500">{errors.category_id.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Proveedor *</label>
              <select {...register('provider_id')} className="form-control">
                <option value="">Seleccionar proveedor</option>
                {providers.map((p) => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
              </select>
              {errors.provider_id && <p className="mt-1 text-xs text-red-500">{errors.provider_id.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Imagen</label>
              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="h-20 w-20 object-cover rounded-lg border border-gray-300 dark:border-gray-600" />
                    <button type="button" onClick={() => { setImagePreview(null); setImageFile(null); fileRef.current.value = ''; }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5">
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="h-20 w-20 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                    <Package size={24} className="text-gray-400" />
                  </div>
                )}
                <button type="button" onClick={() => fileRef.current.click()}
                  className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <Upload size={16} /> Subir imagen
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>
            </div>
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

export default ProductFormModal;
