import { useNavigate } from 'react-router-dom';
import { usePedidos } from '../hooks/usePedidos';
import type { EstadoCodigo, Pedido } from '../types';

const COLUMNAS: {
  codigo: EstadoCodigo;
  label: string;
  headerBg: string;
  headerText: string;
  borderColor: string;
  dotColor: string;
}[] = [
  { codigo: 'PENDIENTE',  label: 'Pendiente',      headerBg: 'bg-yellow-50',  headerText: 'text-yellow-700', borderColor: 'border-yellow-200', dotColor: 'bg-yellow-400' },
  { codigo: 'CONFIRMADO', label: 'Confirmado',     headerBg: 'bg-blue-50',    headerText: 'text-blue-700',   borderColor: 'border-blue-200',   dotColor: 'bg-blue-500' },
  { codigo: 'EN_PREP',    label: 'En preparación', headerBg: 'bg-orange-50',  headerText: 'text-orange-700', borderColor: 'border-orange-200', dotColor: 'bg-orange-400' },
  { codigo: 'EN_CAMINO',  label: 'En camino',      headerBg: 'bg-purple-50',  headerText: 'text-purple-700', borderColor: 'border-purple-200', dotColor: 'bg-purple-500' },
  { codigo: 'ENTREGADO',  label: 'Entregado',      headerBg: 'bg-green-50',   headerText: 'text-green-700',  borderColor: 'border-green-200',  dotColor: 'bg-green-500' },
  { codigo: 'CANCELADO',  label: 'Cancelado',      headerBg: 'bg-gray-100',   headerText: 'text-gray-500',   borderColor: 'border-gray-200',   dotColor: 'bg-gray-400' },
];

const PedidoCard = ({ pedido, onClick }: { pedido: Pedido; onClick: () => void }) => (
  <div
    onClick={onClick}
    className="bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all"
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-mono text-gray-400">#{pedido.id}</span>
      <span className="text-sm font-bold text-gray-900">${parseFloat(pedido.total).toFixed(2)}</span>
    </div>
    <p className="text-xs text-gray-500 mb-1">
      {pedido.items.length} ítem{pedido.items.length !== 1 ? 's' : ''}
      {' · '}{pedido.forma_pago.nombre}
    </p>
    <p className="text-xs text-gray-400">
      {new Date(pedido.fecha_creacion).toLocaleDateString('es-AR', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
      })}
    </p>
    {pedido.observaciones && (
      <p className="text-xs text-gray-400 italic mt-1 truncate">"{pedido.observaciones}"</p>
    )}
  </div>
);

export const PedidosPage = () => {
  const navigate = useNavigate();
  const { data: pedidos, isLoading, error } = usePedidos();

  if (error) {
    return (
      <div className="px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error: {error instanceof Error ? error.message : 'Error desconocido'}
        </div>
      </div>
    );
  }

  const porEstado = (codigo: EstadoCodigo): Pedido[] =>
    pedidos?.filter((p) => p.estado.codigo === codigo) ?? [];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {pedidos ? `${pedidos.length} pedido${pedidos.length !== 1 ? 's' : ''} en total` : 'Cargando...'}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNAS.map((col) => {
            const items = porEstado(col.codigo);
            return (
              <div key={col.codigo} className="flex-shrink-0 w-56">
                {/* Header de columna */}
                <div className={`flex items-center gap-2 px-3 py-2 rounded-t-lg border ${col.borderColor} ${col.headerBg} mb-2`}>
                  <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                  <span className={`text-xs font-semibold uppercase tracking-wider ${col.headerText}`}>
                    {col.label}
                  </span>
                  <span className={`ml-auto text-xs font-bold ${col.headerText} opacity-70`}>
                    {items.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-2 min-h-[120px]">
                  {items.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                      <p className="text-xs text-gray-400">Sin pedidos</p>
                    </div>
                  ) : (
                    items.map((pedido) => (
                      <PedidoCard
                        key={pedido.id}
                        pedido={pedido}
                        onClick={() => navigate(`/pedidos/${pedido.id}`)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
