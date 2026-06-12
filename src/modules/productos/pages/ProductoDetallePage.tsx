import { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProductos } from '../hooks/useProductos';
import { useAuthStore } from '../../auth/stores/useAuthStore';

export const ProductoDetallePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { detail, subirImagen } = useProductos(undefined, id ? parseInt(id) : undefined);
  const { data: producto, isLoading, error } = detail;
  const esAdmin = useAuthStore((s) => s.hasAnyRole)(['ADMIN']);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState('');

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // permite re-seleccionar el mismo archivo
    if (!file || !producto) return;
    setUploadError('');
    subirImagen.mutate(
      { id: producto.id, file },
      { onError: (err) => setUploadError(err instanceof Error ? err.message : 'Error al subir') }
    );
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error: {error instanceof Error ? error.message : 'Error desconocido'}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-gray-500 font-medium">Producto no encontrado</p>
        <button onClick={() => navigate('/productos')} className="mt-4 text-sm text-blue-600 hover:underline">
          ← Volver a Productos
        </button>
      </div>
    );
  }

  const precio = parseFloat(producto.precio);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/productos')}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-6 group"
      >
        <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver a Productos
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row gap-6 mb-2">
          <div className="flex-shrink-0">
            {producto.imagen_url ? (
              <img
                src={producto.imagen_url}
                alt={producto.nombre}
                className="w-32 h-32 object-cover rounded-xl border border-gray-200"
              />
            ) : (
              <div className="w-32 h-32 flex items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-xs text-gray-400 text-center px-2">
                Sin imagen
              </div>
            )}
            {esAdmin && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={onFileSelected}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={subirImagen.isPending}
                  className="mt-2 w-32 text-xs bg-blue-600 text-white px-2 py-1.5 rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {subirImagen.isPending ? 'Subiendo...' : 'Subir imagen'}
                </button>
                {uploadError && (
                  <p className="mt-1 w-32 text-xs text-red-600">{uploadError}</p>
                )}
              </>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{producto.nombre}</h1>
            {producto.descripcion && (
              <p className="text-gray-500 mt-2 text-base">{producto.descripcion}</p>
            )}
            <p className="text-xs text-gray-400 mt-3">
              Creado el {new Date(producto.created_at).toLocaleDateString('es-AR', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          </div>
          <span className={`self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border whitespace-nowrap ${
            producto.disponible
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-gray-50 text-gray-500 border-gray-200'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${producto.disponible ? 'bg-green-500' : 'bg-gray-400'}`} />
            {producto.disponible ? 'Disponible' : 'No disponible'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-1">Precio</p>
            <p className="text-2xl font-bold text-blue-700">${precio.toFixed(2)}</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-xl">
            <p className="text-xs font-semibold text-orange-500 uppercase tracking-wider mb-1">Stock</p>
            <p className="text-2xl font-bold text-orange-700">{producto.stock_cantidad}</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-xl">
            <p className="text-xs font-semibold text-purple-500 uppercase tracking-wider mb-1">Categoría</p>
            <p className="text-lg font-bold text-purple-700 truncate">{producto.categoria?.nombre ?? '—'}</p>
          </div>
          <div className="text-center p-4 bg-emerald-50 rounded-xl">
            <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-1">Ingredientes</p>
            <p className="text-2xl font-bold text-emerald-700">{producto.ingredientes.length}</p>
          </div>
        </div>
      </div>

      {producto.ingredientes.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Ingredientes
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-2">Ingrediente</th>
                <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider pb-2">Cantidad</th>
                <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider pb-2">Unidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {producto.ingredientes.map((ing) => (
                <tr key={ing.ingrediente_id}>
                  <td className="py-2.5 font-medium text-gray-800">{ing.nombre}</td>
                  <td className="py-2.5 text-right text-gray-600">{ing.cantidad}</td>
                  <td className="py-2.5 text-right text-gray-400">{ing.unidad_medida}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
