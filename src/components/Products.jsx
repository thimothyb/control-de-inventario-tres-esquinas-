import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, Package, Barcode } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance, { UPLOADS_URL } from '../api/axios';
import DataTable from './DataTable';
import ConfirmDialog from './ConfirmDialog';
import ProductFormModal from './ProductFormModal';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  const fetchAll = async () => {
    try {
      const [prodRes, catRes, provRes] = await Promise.all([
        axiosInstance.get('/products'),
        axiosInstance.get('/categories'),
        axiosInstance.get('/providers'),
      ]);
      setProducts(prodRes.data?.data ?? prodRes.data ?? []);
      setCategories(catRes.data?.data ?? catRes.data ?? []);
      setProviders(provRes.data?.data ?? provRes.data ?? []);
    } catch { toast.error('Error al cargar productos'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDelete = async () => {
    setDeletingLoading(true);
    try {
      await axiosInstance.delete(`/products/${deleting.id}`);
      toast.success('Producto eliminado');
      setDeleting(null);
      fetchAll();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Error al eliminar');
    } finally { setDeletingLoading(false); }
  };

  const columns = useMemo(() => [
    {
      id: 'image', header: '',
      cell: ({ row }) => {
        const ruta = row.original.imagenes?.[0]?.ruta;
        return ruta ? (
          <img src={`${UPLOADS_URL}/${ruta}`} alt={row.original.name}
            className="h-10 w-10 object-cover rounded-lg" />
        ) : (
          <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <Package size={18} className="text-gray-400" />
          </div>
        );
      },
    },
    {
      id: 'codigo', header: 'Código',
      accessorFn: (r) => r.codigo || '—',
      cell: ({ getValue }) => (
        <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
          {getValue()}
        </span>
      ),
    },
    { accessorKey: 'name', header: 'Nombre' },
    { accessorFn: (r) => r.category?.nombre ?? '—', id: 'categoria', header: 'Categoría' },
    { accessorFn: (r) => r.provider?.name ?? '—', id: 'proveedor', header: 'Proveedor' },
    {
      accessorKey: 'existencias', header: 'Stock',
      cell: ({ getValue }) => {
        const v = getValue();
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            v === 0 ? 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
            : v <= 5 ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
            : v <= 10 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
            : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
          }`}>{v}</span>
        );
      },
    },
    {
      accessorKey: 'price', header: 'Precio',
      cell: ({ getValue }) => `$${parseFloat(getValue() ?? 0).toFixed(2)}`,
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
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Productos</h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <DataTable
            columns={columns} data={products} searchPlaceholder="Buscar por nombre, código..."
            actions={
              <button onClick={() => { setEditing(null); setShowModal(true); }} className="btn btn-primary flex items-center gap-2">
                <Plus size={18} /> Nuevo Producto
              </button>
            }
          />
        )}

        <ProductFormModal isOpen={showModal} onClose={() => setShowModal(false)}
          editing={editing} categories={categories} providers={providers} onSaved={fetchAll} />

        <ConfirmDialog isOpen={!!deleting} title="Eliminar Producto"
          message={`¿Estás seguro de que deseas eliminar "${deleting?.name}"?`}
          onConfirm={handleDelete} onCancel={() => setDeleting(null)} loading={deletingLoading} />
      </div>
    </>
  );
};

export default Products;
