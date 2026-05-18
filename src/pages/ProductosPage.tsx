import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductos } from '../hooks/useProductos';
import { useCategorias } from '../hooks/useCategorias';
import { ProductoModal } from '../components/productos/ProductoModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Toast } from '../components/ui/Toast';
import type { ProductoCreate, ProductoUpdate } from '../types';

export const ProductosPage = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductoId, setSelectedProductoId] = useState<number | null>(null);
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<number | undefined>();
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const { list: productosList, create, update, remove } = useProductos(selectedCategoriaId);
  const { list: categoriasList } = useCategorias();
  const { data: productos, isLoading, error } = productosList;
  const { data: categorias } = categoriasList;

  const selectedProducto = productos?.find((p) => p.id === selectedProductoId);

  const handleCreate = async (formData: ProductoCreate | ProductoUpdate) => {
    if (selectedProductoId) {
      await update.mutateAsync({ id: selectedProductoId, data: formData as ProductoUpdate });
    } else {
      await create.mutateAsync(formData as ProductoCreate);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmId) return;
    try {
      await remove.mutateAsync(confirmId);
      setConfirmId(null);
    } catch (err) {
      setConfirmId(null);
      setToast({ message: err instanceof Error ? err.message : 'Error desconocido', type: 'error' });
    }
  };

  const handleOpenModal = (id?: number) => { setSelectedProductoId(id || null); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); setSelectedProductoId(null); };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error: {error instanceof Error ? error.message : 'Error desconocido'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {productos ? `${productos.length} producto${productos.length !== 1 ? 's' : ''}` : 'Cargando...'}
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium shadow-sm text-sm"
        >
          <span className="text-lg leading-none">+</span>
          Nuevo Producto
        </button>
      </div>

      {/* Filtro de categorías */}
      {categorias && categorias.length > 0 && (
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategoriaId(undefined)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap border ${
              selectedCategoriaId === undefined
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            Todos
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoriaId(cat.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap border ${
                selectedCategoriaId === cat.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : productos && productos.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Precio</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Categorías</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ingredientes</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {productos.map((producto) => (
                  <tr key={producto.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3 text-gray-400 text-xs font-mono">#{producto.id}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{producto.nombre}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      ${Number(producto.precio).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        producto.disponible
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-gray-50 text-gray-500 border-gray-200'
                      }`}>
                        {producto.disponible ? '● Disponible' : '○ No disponible'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {producto.categorias.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {producto.categorias.map((c) => (
                            <span key={c.id} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-md font-medium">
                              {c.nombre}
                            </span>
                          ))}
                        </div>
                      ) : <span className="text-gray-300 italic text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-50 text-purple-700 text-xs font-bold">
                        {producto.ingredientes.length}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/productos/${producto.id}`)}
                          className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => handleOpenModal(producto.id)}
                          className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setConfirmId(producto.id)}
                          className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No hay productos todavía</p>
          <p className="text-gray-400 text-sm mt-1">
            {selectedCategoriaId ? 'No hay productos en esta categoría.' : 'Creá tu primer producto para empezar.'}
          </p>
          <button onClick={() => handleOpenModal()} className="mt-4 text-sm text-blue-600 hover:underline font-medium">
            + Nuevo Producto
          </button>
        </div>
      )}

      {isModalOpen && <ProductoModal onClose={handleCloseModal} onSubmit={handleCreate} initialData={selectedProducto} />}
      {confirmId && <ConfirmDialog message="¿Estás seguro de que deseas eliminar este producto?" onConfirm={handleDeleteConfirm} onCancel={() => setConfirmId(null)} isPending={remove.isPending} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
