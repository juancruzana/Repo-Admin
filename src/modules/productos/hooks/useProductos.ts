import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../api/queryKeys';
import {
  getProductos,
  getProducto,
  createProducto,
  updateProducto,
  toggleDisponibilidadProducto,
  actualizarStockProducto,
  deleteProducto,
} from '../services/productosService';
import { uploadImagenProducto } from '../services/imageUploadService';
import type { ProductoCreate, ProductoUpdate, ProductoDisponibilidadUpdate } from '../types';

export const useProductos = (categoriaId?: number, id?: number) => {
  const queryClient = useQueryClient();

  const list = useQuery({
    queryKey: queryKeys.productos.list(categoriaId),
    queryFn: () => getProductos(categoriaId),
  });

  const detail = useQuery({
    queryKey: queryKeys.productos.detail(id ?? 0),
    queryFn: () => getProducto(id!),
    enabled: !!id,
  });

  const create = useMutation({
    mutationFn: (newProducto: ProductoCreate) => createProducto(newProducto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.productos.list(categoriaId) });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductoUpdate }) =>
      updateProducto(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.productos.list(categoriaId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.productos.detail(variables.id) });
    },
  });

  const toggleDisponibilidad = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductoDisponibilidadUpdate }) =>
      toggleDisponibilidadProducto(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.productos.list(categoriaId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.productos.detail(variables.id) });
    },
  });

  const actualizarStock = useMutation({
    mutationFn: ({ id, stock_cantidad }: { id: number; stock_cantidad: number }) =>
      actualizarStockProducto(id, stock_cantidad),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.productos.list(categoriaId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.productos.detail(variables.id) });
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteProducto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.productos.list(categoriaId) });
    },
  });

  const subirImagen = useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      uploadImagenProducto(id, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.productos.list(categoriaId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.productos.detail(variables.id) });
    },
  });

  return { list, detail, create, update, toggleDisponibilidad, actualizarStock, remove, subirImagen };
};
