import { apiClient } from '../../../api/client';
import type { Pago } from '../types';

export async function getPagoDePedido(pedidoId: number): Promise<Pago> {
  const { data } = await apiClient.get<Pago>(`/v1/pagos/pedido/${pedidoId}`);
  return data;
}
