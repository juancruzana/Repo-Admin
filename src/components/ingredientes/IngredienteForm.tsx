import { useState } from 'react';
import type { IngredienteCreate, IngredienteUpdate, Ingrediente } from '../../types';

interface Props {
  onSubmit: (data: IngredienteCreate | IngredienteUpdate) => void;
  initialData?: Ingrediente;
  isLoading?: boolean;
}

export const IngredienteForm = ({ onSubmit, initialData, isLoading = false }: Props) => {
  const [nombre, setNombre] = useState(initialData?.nombre || '');
  const [unidad_medida, setUnidadMedida] = useState(initialData?.unidad_medida || 'g');
  const [stock_actual, setStockActual] = useState(initialData?.stock_actual || 0);
  const [stock_minimo, setStockMinimo] = useState(initialData?.stock_minimo || 0);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (nombre.trim().length < 3) {
      setError('El nombre debe tener al menos 3 caracteres');
      return;
    }

    if (!['ml', 'g', 'unidades'].includes(unidad_medida)) {
      setError('Unidad de medida no válida');
      return;
    }

    if (stock_actual < 0) {
      setError('El stock actual no puede ser negativo');
      return;
    }

    if (stock_minimo < 0) {
      setError('El stock mínimo no puede ser negativo');
      return;
    }

    onSubmit({
      nombre: nombre.trim(),
      unidad_medida,
      stock_actual,
      stock_minimo,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre
        </label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Leche"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Unidad de Medida
        </label>
        <select
          value={unidad_medida}
          onChange={(e) => setUnidadMedida(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          <option value="ml">ml (mililitros)</option>
          <option value="g">g (gramos)</option>
          <option value="unidades">unidades</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Stock Actual
        </label>
        <input
          type="number"
          value={stock_actual}
          onChange={(e) => setStockActual(parseFloat(e.target.value))}
          min="0"
          step="0.01"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Stock Mínimo
        </label>
        <input
          type="number"
          value={stock_minimo}
          onChange={(e) => setStockMinimo(parseFloat(e.target.value))}
          min="0"
          step="0.01"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
      >
        {isLoading ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear Ingrediente'}
      </button>
    </form>
  );
};
