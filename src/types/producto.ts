import type { Categoria } from './categoria';

export interface ProductoIngrediente {
  ingrediente_id: number;
  nombre: string;
  cantidad: number;
  unidad_medida: string;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number | string; // Puede venir como número o string del backend
  disponible: boolean;
  created_at: string;
  categorias: Categoria[];
  ingredientes: ProductoIngrediente[];
}

export interface ProductoIngredienteInput {
  ingrediente_id: number;
  cantidad: number;
}

export interface ProductoCreate {
  nombre: string;
  descripcion?: string;
  precio: number;
  disponible: boolean;
  categoria_ids: number[];
  ingredientes: ProductoIngredienteInput[];
}

export interface ProductoUpdate {
  nombre: string;
  descripcion?: string;
  precio: number;
  disponible: boolean;
  categoria_ids: number[];
  ingredientes: ProductoIngredienteInput[];
}
