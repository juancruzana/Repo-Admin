export interface CategoriaSimple {
  id: number;
  nombre: string;
  descripcion: string | null;
  parent_id: number | null;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  parent_id: number | null;
  created_at: string;
  subcategorias: CategoriaSimple[];
}

export interface CategoriaCreate {
  nombre: string;
  descripcion?: string;
  parent_id?: number | null;
}

export interface CategoriaUpdate {
  nombre: string;
  descripcion?: string;
  parent_id?: number | null;
}
