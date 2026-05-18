import { useState } from 'react';
import type { CategoriaCreate, CategoriaUpdate, Categoria } from '../../types';
import { CategoriaForm } from './CategoriaForm';

interface Props {
  onClose: () => void;
  onSubmit: (data: CategoriaCreate | CategoriaUpdate) => Promise<void>;
  initialData?: Categoria;
}

export const CategoriaModal = ({ onClose, onSubmit, initialData }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (data: CategoriaCreate | CategoriaUpdate) => {
    try {
      setIsLoading(true);
      setError('');
      await onSubmit(data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 shadow-xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">
            {initialData ? 'Editar Categoría' : 'Nueva Categoría'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <CategoriaForm
            onSubmit={handleSubmit}
            initialData={initialData}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};
