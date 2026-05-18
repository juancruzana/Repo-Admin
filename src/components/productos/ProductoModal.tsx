import { useState } from 'react';
import type { ProductoCreate, ProductoUpdate, Producto } from '../../types';
import { ProductoForm } from './ProductoForm';

interface Props {
  onClose: () => void;
  onSubmit: (data: ProductoCreate | ProductoUpdate) => Promise<void>;
  initialData?: Producto;
}

export const ProductoModal = ({ onClose, onSubmit, initialData }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (data: ProductoCreate | ProductoUpdate) => {
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold">
            {initialData ? 'Editar Producto' : 'Nuevo Producto'}
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
          <ProductoForm
            onSubmit={handleSubmit}
            initialData={initialData}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};
