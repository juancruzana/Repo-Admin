import { useEffect, useState } from 'react';
import type { CategoriaCreate, CategoriaUpdate, Categoria } from '../../types';
import { useCategorias } from '../../hooks/useCategorias';

interface Props {
  onSubmit: (data: CategoriaCreate | CategoriaUpdate) => void;
  initialData?: Categoria;
  isLoading?: boolean;
}

export const CategoriaForm = ({ onSubmit, initialData, isLoading = false }: Props) => {
  const { list } = useCategorias();
  const { data: categorias } = list;
  const [nombre, setNombre] = useState(initialData?.nombre || '');
  const [descripcion, setDescripcion] = useState(initialData?.descripcion || '');
  /** '' = categoría raíz */
  const [parentId, setParentId] = useState<number | ''>(initialData?.parent_id ?? '');
  const [error, setError] = useState('');

  useEffect(() => {
    setNombre(initialData?.nombre || '');
    setDescripcion(initialData?.descripcion || '');
    setParentId(initialData?.parent_id ?? '');
  }, [initialData]);

  const parentOptions = (categorias || []).filter((c) => c.id !== initialData?.id);

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

    onSubmit({
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || undefined,
      parent_id: parentId === '' ? null : parentId,
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
          placeholder="Ej: Bebidas"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción (opcional)
        </label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Ej: Bebidas frías y calientes"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Categoría padre (opcional)
        </label>
        <select
          value={parentId === '' ? '' : String(parentId)}
          onChange={(e) =>
            setParentId(e.target.value === '' ? '' : Number(e.target.value))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          <option value="">— Raíz (sin padre) —</option>
          {parentOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
      >
        {isLoading ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear Categoría'}
      </button>
    </form>
  );
};
