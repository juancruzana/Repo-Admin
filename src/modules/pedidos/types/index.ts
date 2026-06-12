// FSM v7: 5 estados, sin EN_CAMINO (D-01)
export type EstadoCodigo =
  | 'PENDIENTE'
  | 'CONFIRMADO'
  | 'EN_PREP'
  | 'ENTREGADO'
  | 'CANCELADO';

export interface EstadoPedido {
  id: number;
  codigo: EstadoCodigo;
  nombre: string;
  orden: number;
}

export interface FormaPago {
  id: number;
  codigo: string;
  nombre: string;
  activa: boolean;
}

export interface DireccionEntregaResumen {
  id: number;
  alias: string;
  calle: string;
  numero: string;
  ciudad: string;
}

export interface DetallePedido {
  producto_id: number;
  producto_nombre: string;
  precio_unitario: string;
  cantidad: number;
  subtotal: string;
}

export interface HistorialEstado {
  id: number;
  estado_anterior: EstadoPedido | null;
  estado_nuevo: EstadoPedido;
  usuario: { id: number; nombre: string };
  fecha: string;
  observacion: string | null;
}

export interface Pedido {
  id: number;
  usuario_id: number;
  direccion_entrega: DireccionEntregaResumen;
  forma_pago: FormaPago;
  estado: EstadoPedido;
  total: string;
  observaciones: string | null;
  fecha_creacion: string;
  fecha_confirmacion: string | null;
  fecha_entrega: string | null;
  items: DetallePedido[];
  historial: HistorialEstado[];
}

// pago MercadoPago del pedido (read-only, GET /v1/pagos/pedido/{id})
export interface Pago {
  id: number;
  pedido_id: number;
  mp_payment_id: string | null;
  mp_preference_id: string | null;
  mp_status: string; // pending | approved | rejected | ...
  mp_status_detail: string | null;
  transaction_amount: string;
  currency_id: string;
  created_at: string;
  updated_at: string;
}
