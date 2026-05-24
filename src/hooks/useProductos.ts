import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { queryKeys } from '../api/queryKeys';
import type { Producto, ProductoCreate, ProductoUpdate, ProductoDisponibilidadUpdate, PaginatedResponse } from '../types';

export const useProductos = (categoriaId?: number, id?: number) => {
  const queryClient = useQueryClient();

  const list = useQuery<Producto[]>({
    queryKey: queryKeys.productos.list(categoriaId),
    queryFn: async () => {
      const params = categoriaId ? { categoria_id: categoriaId } : {};
      const { data } = await apiClient.get<PaginatedResponse<Producto>>('/v1/productos', { params });
      return data.items;
    },
  });

  const detail = useQuery<Producto>({
    queryKey: queryKeys.productos.detail(id ?? 0),
    queryFn: async () => {
      const { data } = await apiClient.get<Producto>(`/v1/productos/${id}`);
      return data;
    },
    enabled: !!id,
  });

  const create = useMutation({
    mutationFn: async (newProducto: ProductoCreate) => {
      const { data } = await apiClient.post<Producto>('/v1/productos', newProducto);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.productos.list(categoriaId) });
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, data: body }: { id: number; data: ProductoUpdate }) => {
      const { data } = await apiClient.put<Producto>(`/v1/productos/${id}`, body);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.productos.list(categoriaId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.productos.detail(variables.id) });
    },
  });

  const toggleDisponibilidad = useMutation({
    mutationFn: async ({ id, data: body }: { id: number; data: ProductoDisponibilidadUpdate }) => {
      const { data } = await apiClient.patch<Producto>(`/v1/productos/${id}/disponibilidad`, body);
      return data;
    },
    onSuccess: (productoActualizado, variables) => {
      const productoFinal = { ...productoActualizado, disponible: variables.data.disponible };
      queryClient.setQueryData<Producto[]>(queryKeys.productos.list(categoriaId), (old) =>
        old?.map((p) => (p.id === variables.id ? productoFinal : p))
      );
      queryClient.setQueryData(queryKeys.productos.detail(variables.id), productoFinal);
    },
  });

  const actualizarStock = useMutation({
    mutationFn: async ({ id, stock_cantidad }: { id: number; stock_cantidad: number }) => {
      const { data } = await apiClient.patch<Producto>(`/v1/productos/${id}/stock`, { stock_cantidad });
      return data;
    },
    onSuccess: (productoActualizado, variables) => {
      const productoFinal = { ...productoActualizado, stock_cantidad: variables.stock_cantidad };
      queryClient.setQueryData<Producto[]>(queryKeys.productos.list(categoriaId), (old) =>
        old?.map((p) => (p.id === variables.id ? productoFinal : p))
      );
      queryClient.setQueryData(queryKeys.productos.detail(variables.id), productoFinal);
    },
  });

  const remove = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/v1/productos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.productos.list(categoriaId) });
    },
  });

  return { list, detail, create, update, toggleDisponibilidad, actualizarStock, remove };
};
