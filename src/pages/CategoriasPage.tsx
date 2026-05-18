import { useState } from 'react';
import { useCategorias } from '../hooks/useCategorias';
import { CategoriaModal } from '../components/categorias/CategoriaModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Toast } from '../components/ui/Toast';
import type { CategoriaCreate, CategoriaUpdate } from '../types';

export const CategoriasPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const { list, create, update, remove } = useCategorias();
  const { data: categorias, isLoading, error } = list;

  const selectedCategoria = categorias?.find((c) => c.id === selectedCategoriaId);

  const handleCreate = async (formData: CategoriaCreate | CategoriaUpdate) => {
    if (selectedCategoriaId) {
      await update.mutateAsync({ id: selectedCategoriaId, data: formData as CategoriaUpdate });
    } else {
      await create.mutateAsync(formData as CategoriaCreate);
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

  const handleOpenModal = (id?: number) => { setSelectedCategoriaId(id || null); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); setSelectedCategoriaId(null); };

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {categorias ? `${categorias.length} categoría${categorias.length !== 1 ? 's' : ''} registrada${categorias.length !== 1 ? 's' : ''}` : 'Cargando...'}
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium shadow-sm text-sm"
        >
          <span className="text-lg leading-none">+</span>
          Nueva Categoría
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : categorias && categorias.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Padre</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Subcats</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Descripción</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categorias.map((categoria) => (
                  <tr key={categoria.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3 text-gray-400 text-xs font-mono">#{categoria.id}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{categoria.nombre}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {categorias.find(c => c.id === categoria.parent_id)?.nombre ?? (
                        <span className="text-gray-300 italic text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                        {categoria.subcategorias?.length ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{categoria.descripcion || <span className="text-gray-300 italic text-xs">—</span>}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenModal(categoria.id)}
                          className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setConfirmId(categoria.id)}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No hay categorías todavía</p>
          <p className="text-gray-400 text-sm mt-1">Creá la primera para empezar a organizar tus productos.</p>
          <button onClick={() => handleOpenModal()} className="mt-4 text-sm text-blue-600 hover:underline font-medium">
            + Nueva Categoría
          </button>
        </div>
      )}

      {isModalOpen && <CategoriaModal onClose={handleCloseModal} onSubmit={handleCreate} initialData={selectedCategoria} />}
      {confirmId && <ConfirmDialog message="¿Estás seguro de que deseas eliminar esta categoría?" onConfirm={handleDeleteConfirm} onCancel={() => setConfirmId(null)} isPending={remove.isPending} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
