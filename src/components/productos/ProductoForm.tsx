import { useState } from 'react';
import { useIngredientes } from '../../hooks/useIngredientes';
import { useCategorias } from '../../hooks/useCategorias';
import type { ProductoCreate, ProductoUpdate, Producto, ProductoIngredienteInput } from '../../types';

interface Props {
  onSubmit: (data: ProductoCreate | ProductoUpdate) => void;
  initialData?: Producto;
  isLoading?: boolean;
}

export const ProductoForm = ({ onSubmit, initialData, isLoading = false }: Props) => {
  const { list: ingredientesList } = useIngredientes();
  const { list: categoriasList } = useCategorias();
  const { data: ingredientesData } = ingredientesList;
  const { data: categoriasData } = categoriasList;

  const [nombre, setNombre] = useState(initialData?.nombre || '');
  const [descripcion, setDescripcion] = useState(initialData?.descripcion || '');
  const [precio, setPrecio] = useState(
    initialData?.precio ? Number(initialData.precio) : 0
  );
  const [disponible, setDisponible] = useState(initialData?.disponible ?? true);
  const [selectedCategorias, setSelectedCategorias] = useState<number[]>(
    initialData?.categorias.map(c => c.id) || []
  );
  const [ingredientes, setIngredientes] = useState<ProductoIngredienteInput[]>(
    initialData?.ingredientes.map(i => ({
      ingrediente_id: i.ingrediente_id,
      cantidad: i.cantidad,
    })) || []
  );
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

    if (!precio || precio <= 0) {
      setError('El precio debe ser mayor a 0');
      return;
    }

    if (selectedCategorias.length === 0) {
      setError('Debes seleccionar al menos una categoría');
      return;
    }

    if (ingredientes.length === 0) {
      setError('Debes agregar al menos un ingrediente');
      return;
    }

    onSubmit({
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || undefined,
      precio: Number(precio),
      disponible,
      categoria_ids: selectedCategorias,
      ingredientes,
    });
  };

  const handleAddIngrediente = () => {
    if (ingredientesData && ingredientesData.length > 0) {
      setIngredientes([
        ...ingredientes,
        { ingrediente_id: ingredientesData[0].id, cantidad: 1 },
      ]);
    }
  };

  const handleRemoveIngrediente = (index: number) => {
    setIngredientes(ingredientes.filter((_, i) => i !== index));
  };

  const handleUpdateIngrediente = (index: number, field: 'ingrediente_id' | 'cantidad', value: number) => {
    const newIngredientes = [...ingredientes];
    if (field === 'ingrediente_id') {
      newIngredientes[index].ingrediente_id = value;
    } else {
      newIngredientes[index].cantidad = value;
    }
    setIngredientes(newIngredientes);
  };

  const toggleCategoria = (categoriaId: number) => {
    setSelectedCategorias((prev) =>
      prev.includes(categoriaId)
        ? prev.filter((id) => id !== categoriaId)
        : [...prev, categoriaId]
    );
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
          placeholder="Ej: Cappuccino"
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
          placeholder="Ej: Café con leche espumosa"
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Precio
        </label>
        <input
          type="number"
          value={precio}
          onChange={(e) => setPrecio(parseFloat(e.target.value))}
          min="0.01"
          step="0.01"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={disponible}
            onChange={(e) => setDisponible(e.target.checked)}
            disabled={isLoading}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm font-medium text-gray-700">Disponible</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Categorías
        </label>
        <div className="space-y-2">
          {categoriasData?.map((categoria) => (
            <label key={categoria.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedCategorias.includes(categoria.id)}
                onChange={() => toggleCategoria(categoria.id)}
                disabled={isLoading}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-gray-700">{categoria.nombre}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Ingredientes
          </label>
          <button
            type="button"
            onClick={handleAddIngrediente}
            disabled={!ingredientesData || ingredientesData.length === 0 || isLoading}
            className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:bg-gray-400 transition-colors"
          >
            + Agregar
          </button>
        </div>

        <div className="space-y-3 max-h-60 overflow-y-auto">
          {ingredientes.map((ing, index) => (
            <div key={index} className="flex gap-2 items-end">
              <select
                value={ing.ingrediente_id}
                onChange={(e) =>
                  handleUpdateIngrediente(index, 'ingrediente_id', parseInt(e.target.value))
                }
                disabled={isLoading}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ingredientesData?.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.nombre} ({i.unidad_medida})
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={ing.cantidad}
                onChange={(e) =>
                  handleUpdateIngrediente(index, 'cantidad', parseFloat(e.target.value))
                }
                min="0.01"
                step="0.01"
                placeholder="Cant."
                disabled={isLoading}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => handleRemoveIngrediente(index)}
                disabled={isLoading}
                className="text-red-600 hover:text-red-800 font-medium disabled:text-gray-400 px-2 py-2"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
      >
        {isLoading ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear Producto'}
      </button>
    </form>
  );
};
