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
  pedidos: {
    list: (filtros: object) => ['pedidos', 'list', filtros] as const,
    detail: (id: number) => ['pedidos', 'detail', id] as const,
    historial: (id: number) => ['pedidos', 'historial', id] as const,
  },
  pagos: {
    pedido: (pedidoId: number) => ['pagos', 'pedido', pedidoId] as const,
  },
  usuarios: {
    list: (filtros: object) => ['usuarios', 'list', filtros] as const,
    detail: (id: number) => ['usuarios', 'detail', id] as const,
  },
};
