export interface Ingrediente {
  id: number;
  nombre: string;
  unidad_medida: string;
  stock_actual: number;
  stock_minimo: number;
  created_at: string;
}

export interface IngredienteCreate {
  nombre: string;
  unidad_medida: string;
  stock_actual: number;
  stock_minimo: number;
}

export interface IngredienteUpdate {
  nombre: string;
  unidad_medida: string;
  stock_actual: number;
  stock_minimo: number;
}
