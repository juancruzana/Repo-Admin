import { useState } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useProductos } from '../hooks/useProductos';
import { useCategorias } from '../hooks/useCategorias';
import { useAuthStore } from '../stores/useAuthStore';
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
  const [pendingToggle, setPendingToggle] = useState<Record<number, boolean>>({});
  const [stockEditing, setStockEditing] = useState<Record<number, string>>({});
  const [savingStock, setSavingStock] = useState<Record<number, boolean>>({});

  const hasAnyRole = useAuthStore((s) => s.hasAnyRole);
  const puedeCrear = hasAnyRole(['ADMIN']);
  const puedeEditar = hasAnyRole(['ADMIN']);
  const puedeBorrar = hasAnyRole(['ADMIN']);
  const puedeCambiarDisponibilidad = hasAnyRole(['ADMIN', 'STOCK']);
  const puedeEditarStock = hasAnyRole(['ADMIN', 'STOCK']);

  const { list: productosList, create, update, toggleDisponibilidad, actualizarStock, remove } = useProductos(selectedCategoriaId);
  const { list: categoriasList } = useCategorias();
  const { data: productos, isLoading, error } = productosList;
  const { data: categorias } = categoriasList;

  const selectedProducto = productos?.find((p) => p.id === selectedProductoId);

  const getDisponible = (id: number, serverValue: boolean) =>
    pendingToggle[id] !== undefined ? pendingToggle[id] : serverValue;

  const handleSubmit = async (formData: ProductoCreate | ProductoUpdate) => {
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

  const handleToggleDisponibilidad = async (id: number, nuevoValor: boolean) => {
    flushSync(() => setPendingToggle((prev) => ({ ...prev, [id]: nuevoValor })));
    try {
      await toggleDisponibilidad.mutateAsync({ id, data: { disponible: nuevoValor } });
      setPendingToggle((prev) => { const n = { ...prev }; delete n[id]; return n; });
    } catch (err) {
      setPendingToggle((prev) => { const n = { ...prev }; delete n[id]; return n; });
      setToast({ message: err instanceof Error ? err.message : 'Error al cambiar disponibilidad', type: 'error' });
    }
  };

  const handleStockEdit = (id: number, currentValue: number) => {
    setStockEditing((prev) => ({ ...prev, [id]: String(currentValue) }));
  };

  const handleStockCancel = (id: number) => {
    setStockEditing((prev) => { const n = { ...prev }; delete n[id]; return n; });
  };

  const handleStockSave = async (id: number) => {
    const value = parseFloat(stockEditing[id]);
    if (isNaN(value) || value < 0) return;
    setSavingStock((prev) => ({ ...prev, [id]: true }));
    try {
      await actualizarStock.mutateAsync({ id, stock_cantidad: value });
      setStockEditing((prev) => { const n = { ...prev }; delete n[id]; return n; });
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Error al actualizar stock', type: 'error' });
    } finally {
      setSavingStock((prev) => { const n = { ...prev }; delete n[id]; return n; });
    }
  };

  const handleOpenModal = (id?: number) => { setSelectedProductoId(id ?? null); setIsModalOpen(true); };
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {productos ? `${productos.length} producto${productos.length !== 1 ? 's' : ''}` : 'Cargando...'}
          </p>
        </div>
        {puedeCrear && (
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm text-sm"
          >
            <span className="text-lg leading-none">+</span>
            Nuevo Producto
          </button>
        )}
      </div>

      {/* Filtro por categoría */}
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
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoría</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ingredientes</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Disponible</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {productos.map((producto) => {
                  const disponible = getDisponible(producto.id, producto.disponible);
                  const toggling = pendingToggle[producto.id] !== undefined;
                  const editingStock = stockEditing[producto.id] !== undefined;
                  return (
                    <tr key={producto.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-4 py-3 text-gray-400 text-xs font-mono">#{producto.id}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{producto.nombre}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        ${parseFloat(producto.precio).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-md font-medium">
                          {producto.categoria?.nombre ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-50 text-purple-700 text-xs font-bold">
                          {producto.ingredientes.length}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {puedeEditarStock && editingStock ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={stockEditing[producto.id]}
                              onChange={(e) => setStockEditing((prev) => ({ ...prev, [producto.id]: e.target.value }))}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleStockSave(producto.id);
                                if (e.key === 'Escape') handleStockCancel(producto.id);
                              }}
                              min="0"
                              step="1"
                              disabled={savingStock[producto.id]}
                              autoFocus
                              className="w-20 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                              onClick={() => handleStockSave(producto.id)}
                              disabled={savingStock[producto.id]}
                              className="text-green-600 hover:text-green-800 disabled:opacity-40 text-base leading-none"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => handleStockCancel(producto.id)}
                              className="text-gray-400 hover:text-gray-600 text-base leading-none"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <span
                            onClick={puedeEditarStock ? () => handleStockEdit(producto.id, producto.stock_cantidad) : undefined}
                            className={`font-medium tabular-nums ${puedeEditarStock ? 'cursor-pointer hover:text-blue-600 underline decoration-dotted' : 'text-gray-700'}`}
                            title={puedeEditarStock ? 'Click para editar stock' : undefined}
                          >
                            {producto.stock_cantidad}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {puedeCambiarDisponibilidad ? (
                          <button
                            onClick={() => !toggling && handleToggleDisponibilidad(producto.id, !disponible)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                              toggling ? 'opacity-60 cursor-wait' : 'cursor-pointer'
                            } ${disponible ? 'bg-green-500' : 'bg-gray-300'}`}
                          >
                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                              disponible ? 'translate-x-5' : 'translate-x-1'
                            }`} />
                          </button>
                        ) : (
                          <span className={`text-xs font-medium ${disponible ? 'text-green-600' : 'text-gray-400'}`}>
                            {disponible ? 'Sí' : 'No'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/productos/${producto.id}`)}
                            className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                          >
                            Ver
                          </button>
                          {puedeEditar && (
                            <button
                              onClick={() => handleOpenModal(producto.id)}
                              className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            >
                              Editar
                            </button>
                          )}
                          {puedeBorrar && (
                            <button
                              onClick={() => setConfirmId(producto.id)}
                              className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            >
                              Eliminar
                            </button>
                          )}
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
          <p className="text-gray-500 font-medium">No hay productos todavía</p>
          <p className="text-gray-400 text-sm mt-1">
            {selectedCategoriaId ? 'No hay productos en esta categoría.' : 'Creá tu primer producto para empezar.'}
          </p>
          {puedeCrear && (
            <button onClick={() => handleOpenModal()} className="mt-4 text-sm text-blue-600 hover:underline font-medium">
              + Nuevo Producto
            </button>
          )}
        </div>
      )}

      {isModalOpen && <ProductoModal onClose={handleCloseModal} onSubmit={handleSubmit} initialData={selectedProducto} />}
      {confirmId && <ConfirmDialog message="¿Estás seguro de que deseas eliminar este producto?" onConfirm={handleDeleteConfirm} onCancel={() => setConfirmId(null)} isPending={remove.isPending} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
