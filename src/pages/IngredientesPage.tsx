import { useState } from 'react';
import { useIngredientes } from '../hooks/useIngredientes';
import { IngredienteModal } from '../components/ingredientes/IngredienteModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Toast } from '../components/ui/Toast';
import type { IngredienteCreate, IngredienteUpdate } from '../types';

export const IngredientesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIngredienteId, setSelectedIngredienteId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const { list, create, update, remove } = useIngredientes();
  const { data: ingredientes, isLoading, error } = list;

  const selectedIngrediente = ingredientes?.find((i) => i.id === selectedIngredienteId);

  const handleCreate = async (formData: IngredienteCreate | IngredienteUpdate) => {
    if (selectedIngredienteId) {
      await update.mutateAsync({ id: selectedIngredienteId, data: formData as IngredienteUpdate });
    } else {
      await create.mutateAsync(formData as IngredienteCreate);
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

  const handleOpenModal = (id?: number) => { setSelectedIngredienteId(id || null); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); setSelectedIngredienteId(null); };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error: {error instanceof Error ? error.message : 'Error desconocido'}
        </div>
      </div>
    );
  }

  const bajosDeStock = ingredientes?.filter(i => i.stock_actual < i.stock_minimo).length ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ingredientes</h1>
          <div className="flex items-center gap-3 mt-0.5">
            <p className="text-sm text-gray-500">
              {ingredientes ? `${ingredientes.length} ingrediente${ingredientes.length !== 1 ? 's' : ''}` : 'Cargando...'}
            </p>
            {bajosDeStock > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                ⚠ {bajosDeStock} bajo stock
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium shadow-sm text-sm"
        >
          <span className="text-lg leading-none">+</span>
          Nuevo Ingrediente
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : ingredientes && ingredientes.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Unidad</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock actual</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mínimo</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ingredientes.map((ingrediente) => {
                  const bajo = ingrediente.stock_actual < ingrediente.stock_minimo;
                  return (
                    <tr key={ingrediente.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-4 py-3 text-gray-400 text-xs font-mono">#{ingrediente.id}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{ingrediente.nombre}</td>
                      <td className="px-4 py-3 text-gray-500">{ingrediente.unidad_medida}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          bajo ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
                        }`}>
                          {bajo && <span>⚠</span>}
                          {ingrediente.stock_actual}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{ingrediente.stock_minimo}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenModal(ingrediente.id)}
                            className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => setConfirmId(ingrediente.id)}
                            className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No hay ingredientes todavía</p>
          <p className="text-gray-400 text-sm mt-1">Agregá los ingredientes que usás en tus productos.</p>
          <button onClick={() => handleOpenModal()} className="mt-4 text-sm text-blue-600 hover:underline font-medium">
            + Nuevo Ingrediente
          </button>
        </div>
      )}

      {isModalOpen && <IngredienteModal onClose={handleCloseModal} onSubmit={handleCreate} initialData={selectedIngrediente} />}
      {confirmId && <ConfirmDialog message="¿Estás seguro de que deseas eliminar este ingrediente?" onConfirm={handleDeleteConfirm} onCancel={() => setConfirmId(null)} isPending={remove.isPending} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
