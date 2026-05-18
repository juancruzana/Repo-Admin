export const queryKeys = {
  categorias: {
    list: () => ['categorias', 'list'] as const,
    detail: (id: number) => ['categorias', 'detail', id] as const,
  },
  ingredientes: {
    list: () => ['ingredientes', 'list'] as const,
    detail: (id: number) => ['ingredientes', 'detail', id] as const,
  },
  productos: {
    list: (categoriaId?: number) => ['productos', 'list', categoriaId] as const,
    detail: (id: number) => ['productos', 'detail', id] as const,
  },
} as const;
