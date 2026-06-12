import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { usePedido, usePagoPedido, useAvanzarEstado, useCancelarPedido } from '../hooks/usePedidos';
import { useAuthStore } from '../../auth/stores/useAuthStore';
import { useWSStore } from '../../ws/useWSStore';
import type { EstadoCodigo } from '../types';

const ESTADO_STYLES: Record<EstadoCodigo, string> = {
  PENDIENTE:  'bg-yellow-50 text-yellow-700 border-yellow-200',
  CONFIRMADO: 'bg-blue-50 text-blue-700 border-blue-200',
  EN_PREP:    'bg-orange-50 text-orange-700 border-orange-200',
  ENTREGADO:  'bg-green-50 text-green-700 border-green-200',
  CANCELADO:  'bg-gray-100 text-gray-500 border-gray-200',
};

// FSM v7 (5 estados): EN_PREP pasa directo a ENTREGADO
const ACCIONES: Partial<Record<EstadoCodigo, { label: string; cancel?: boolean }[]>> = {
  PENDIENTE:  [{ label: 'Confirmar' }, { label: 'Cancelar', cancel: true }],
  CONFIRMADO: [{ label: 'Marcar en preparación' }, { label: 'Cancelar', cancel: true }],
  EN_PREP:    [{ label: 'Marcar entregado' }, { label: 'Cancelar', cancel: true }],
  ENTREGADO:  [],
  CANCELADO:  [],
};

const PAGO_ESTADO_LABELS: Record<string, { label: string; style: string }> = {
  approved: { label: 'Aprobado',  style: 'bg-green-50 text-green-700 border-green-200' },
  pending:  { label: 'Pendiente', style: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  rejected: { label: 'Rechazado', style: 'bg-red-50 text-red-700 border-red-200' },
  cancelled:{ label: 'Cancelado', style: 'bg-gray-100 text-gray-500 border-gray-200' },
};

export const PedidoDetallePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const pedidoId = id ? parseInt(id) : 0;

  const hasAnyRole = useAuthStore((s) => s.hasAnyRole);
  const puedeCambiarEstado = hasAnyRole(['ADMIN', 'PEDIDOS']);

  const { data: pedido, isLoading, error } = usePedido(pedidoId);
  const esMercadoPago = pedido?.forma_pago.codigo === 'MERCADOPAGO';
  const { data: pago } = usePagoPedido(pedidoId, esMercadoPago);
  const avanzar = useAvanzarEstado();
  const cancelar = useCancelarPedido();
  const queryClient = useQueryClient();
  const connect = useWSStore((s) => s.connect);
  const disconnect = useWSStore((s) => s.disconnect);

  // tiempo real: refrescar el detalle si este pedido cambia de estado
  useEffect(() => {
    connect((evento) => {
      if (evento.event === 'PEDIDO_ACTUALIZADO' && evento.data?.pedido_id === pedidoId) {
        queryClient.invalidateQueries({ queryKey: ['pedidos'] });
        queryClient.invalidateQueries({ queryKey: ['pagos'] });
      }
    });
    return () => disconnect();
  }, [connect, disconnect, queryClient, pedidoId]);

  const onCancelar = () => {
    // RN-05: el motivo de cancelación es obligatorio
    const motivo = window.prompt('Motivo de la cancelación (obligatorio):');
    if (!motivo?.trim()) return;
    cancelar.mutate({ id: pedidoId, motivo: motivo.trim() });
  };

  const isPending = avanzar.isPending || cancelar.isPending;

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

  if (!pedido) return null;

  const acciones = ACCIONES[pedido.estado.codigo] ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/pedidos')}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-6 group"
      >
        <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver a Pedidos
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pedido #{pedido.id}</h1>
            <p className="text-sm text-gray-400 mt-1">
              {new Date(pedido.fecha_creacion).toLocaleString('es-AR')}
            </p>
            {pedido.observaciones && (
              <p className="text-sm text-gray-600 mt-2 italic">"{pedido.observaciones}"</p>
            )}
          </div>
          <span className={`self-start inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border whitespace-nowrap ${ESTADO_STYLES[pedido.estado.codigo]}`}>
            {pedido.estado.nombre}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-3 bg-blue-50 rounded-xl">
            <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-1">Total</p>
            <p className="text-xl font-bold text-blue-700">${parseFloat(pedido.total).toFixed(2)}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Forma de pago</p>
            <p className="text-sm font-bold text-gray-700">{pedido.forma_pago.nombre}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Dirección</p>
            <p className="text-sm font-bold text-gray-700 truncate">{pedido.direccion_entrega.alias}</p>
            <p className="text-xs text-gray-400 truncate">{pedido.direccion_entrega.calle} {pedido.direccion_entrega.numero}</p>
          </div>
        </div>

        {esMercadoPago && (
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Pago MercadoPago
            </p>
            {pago ? (
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                  (PAGO_ESTADO_LABELS[pago.mp_status] ?? PAGO_ESTADO_LABELS.pending).style
                }`}>
                  {(PAGO_ESTADO_LABELS[pago.mp_status] ?? { label: pago.mp_status }).label}
                </span>
                <span className="text-sm text-gray-600">
                  ${parseFloat(pago.transaction_amount).toFixed(2)} {pago.currency_id}
                </span>
                {pago.mp_payment_id && (
                  <span className="text-xs font-mono text-gray-400">
                    payment_id: {pago.mp_payment_id}
                  </span>
                )}
                {pago.mp_status_detail && (
                  <span className="text-xs text-gray-400">{pago.mp_status_detail}</span>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400">El pedido todavía no registra un pago.</p>
            )}
          </div>
        )}

        {puedeCambiarEstado && acciones.length > 0 && (
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Cambiar estado</p>
            <div className="flex gap-2 flex-wrap">
              {acciones.map((accion) => (
                <button
                  key={accion.label}
                  onClick={() => accion.cancel ? onCancelar() : avanzar.mutate(pedidoId)}
                  disabled={isPending}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                    accion.cancel
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {accion.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Items ({pedido.items.length})</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase pb-2">Producto</th>
                <th className="text-right text-xs font-semibold text-gray-400 uppercase pb-2">Cant.</th>
                <th className="text-right text-xs font-semibold text-gray-400 uppercase pb-2">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pedido.items.map((item) => (
                <tr key={item.producto_id}>
                  <td className="py-2.5">
                    <p className="font-medium text-gray-800">{item.producto_nombre}</p>
                    <p className="text-xs text-gray-400">${parseFloat(item.precio_unitario).toFixed(2)} c/u</p>
                  </td>
                  <td className="py-2.5 text-right text-gray-600">{item.cantidad}</td>
                  <td className="py-2.5 text-right font-semibold text-gray-900">
                    ${parseFloat(item.subtotal).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Historial</h2>
          {pedido.historial.length > 0 ? (
            <div className="border-l-2 border-gray-200 pl-4 space-y-4">
              {pedido.historial.map((h) => (
                <div key={h.id} className="relative">
                  <span className="absolute -left-[1.35rem] w-2.5 h-2.5 rounded-full bg-blue-500 top-1" />
                  <p className="text-sm font-semibold text-gray-800">
                    {h.estado_anterior?.nombre ?? '—'} → {h.estado_nuevo.nombre}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {h.usuario.nombre} · {new Date(h.fecha).toLocaleString('es-AR')}
                  </p>
                  {h.observacion && (
                    <p className="text-xs text-gray-400 italic mt-0.5">"{h.observacion}"</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Sin historial todavía</p>
          )}
        </div>
      </div>
    </div>
  );
};
