import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { queryKeys } from '../api/queryKeys';
import type { Producto, ProductoCreate, ProductoUpdate } from '../types';

export const useProductos = (categoriaId?: number, id?: number) => {
  const queryClient = useQueryClient();

  const list = useQuery<Producto[]>({
    queryKey: queryKeys.productos.list(categoriaId),
    queryFn: async () => {
      const params = categoriaId ? { categoria_id: categoriaId } : {};
      const { data } = await apiClient.get<Producto[]>('/productos', { params });
      return data;
    },
  });

  const detail = useQuery<Producto>({
    queryKey: queryKeys.productos.detail(id ?? 0),
    queryFn: async () => {
      const { data } = await apiClient.get<Producto>(`/productos/${id}`);
      return data;
    },
    enabled: !!id,
  });

  const create = useMutation({
    mutationFn: async (newProducto: ProductoCreate) => {
      const { data } = await apiClient.post<Producto>('/productos', newProducto);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.productos.list(categoriaId) });
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, data: body }: { id: number; data: ProductoUpdate }) => {
      const { data } = await apiClient.put<Producto>(`/productos/${id}`, body);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.productos.list(categoriaId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.productos.detail(variables.id) });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/productos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.productos.list(categoriaId) });
    },
  });

  return { list, detail, create, update, remove };
};
