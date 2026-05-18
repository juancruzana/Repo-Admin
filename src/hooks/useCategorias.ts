import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { queryKeys } from '../api/queryKeys';
import type { Categoria, CategoriaCreate, CategoriaUpdate } from '../types';

export const useCategorias = (id?: number) => {
  const queryClient = useQueryClient();

  const list = useQuery<Categoria[]>({
    queryKey: queryKeys.categorias.list(),
    queryFn: async () => {
      const { data } = await apiClient.get<Categoria[]>('/categorias');
      return data;
    },
  });

  const detail = useQuery<Categoria>({
    queryKey: queryKeys.categorias.detail(id ?? 0),
    queryFn: async () => {
      const { data } = await apiClient.get<Categoria>(`/categorias/${id}`);
      return data;
    },
    enabled: !!id,
  });

  const create = useMutation({
    mutationFn: async (newCategoria: CategoriaCreate) => {
      const { data } = await apiClient.post<Categoria>('/categorias', newCategoria);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categorias.list() });
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, data: body }: { id: number; data: CategoriaUpdate }) => {
      const { data } = await apiClient.put<Categoria>(`/categorias/${id}`, body);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categorias.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.categorias.detail(variables.id) });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/categorias/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categorias.list() });
    },
  });

  return { list, detail, create, update, remove };
};
