import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { queryKeys } from '../api/queryKeys';
import type { Ingrediente, IngredienteCreate, IngredienteUpdate } from '../types';

export const useIngredientes = (id?: number) => {
  const queryClient = useQueryClient();

  const list = useQuery<Ingrediente[]>({
    queryKey: queryKeys.ingredientes.list(),
    queryFn: async () => {
      const { data } = await apiClient.get<Ingrediente[]>('/ingredientes');
      return data;
    },
  });

  const detail = useQuery<Ingrediente>({
    queryKey: queryKeys.ingredientes.detail(id ?? 0),
    queryFn: async () => {
      const { data } = await apiClient.get<Ingrediente>(`/ingredientes/${id}`);
      return data;
    },
    enabled: !!id,
  });

  const create = useMutation({
    mutationFn: async (newIngrediente: IngredienteCreate) => {
      const { data } = await apiClient.post<Ingrediente>('/ingredientes', newIngrediente);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ingredientes.list() });
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, data: body }: { id: number; data: IngredienteUpdate }) => {
      const { data } = await apiClient.put<Ingrediente>(`/ingredientes/${id}`, body);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ingredientes.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.ingredientes.detail(variables.id) });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/ingredientes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ingredientes.list() });
    },
  });

  return { list, detail, create, update, remove };
};
