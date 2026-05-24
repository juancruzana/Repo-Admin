import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { queryKeys } from '../api/queryKeys';
import type { Pedido } from '../types';

interface PedidoFiltros {
  estado_codigo?: string;
  usuario_id?: number;
  page?: number;
  size?: number;
}

export const usePedidos = (filtros: PedidoFiltros = {}) => {
  return useQuery<Pedido[]>({
    queryKey: queryKeys.pedidos.list(filtros),
    queryFn: async () => {
      const { data } = await apiClient.get<Pedido[]>('/v1/pedidos', {
        params: filtros,
      });
      return data;
    },
  });
};

export const usePedido = (id: number) => {
  return useQuery<Pedido>({
    queryKey: queryKeys.pedidos.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<Pedido>(`/v1/pedidos/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

// Avanza al siguiente estado según el orden definido en el backend — requiere ADMIN o PEDIDOS
export const useAvanzarEstado = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient.post<Pedido>(`/v1/pedidos/${id}/avanzar`);
      return data;
    },
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: queryKeys.pedidos.list({}) });
      qc.invalidateQueries({ queryKey: queryKeys.pedidos.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.pedidos.historial(id) });
    },
  });
};

// Cancela el pedido — disponible para cualquier usuario autenticado (cliente cancela el suyo)
export const useCancelarPedido = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient.post<Pedido>(`/v1/pedidos/${id}/cancelar`);
      return data;
    },
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: queryKeys.pedidos.list({}) });
      qc.invalidateQueries({ queryKey: queryKeys.pedidos.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.pedidos.historial(id) });
    },
  });
};
