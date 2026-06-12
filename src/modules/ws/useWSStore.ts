import { create } from 'zustand';

// mismo contrato que store-app (CONVENCIONES.md §6)
export interface WSEvento {
  event: 'PEDIDO_ACTUALIZADO' | 'ping';
  data?: {
    pedido_id: number;
    estado_nuevo: string;
    timestamp: string;
  };
}

const WS_URL =
  (import.meta as unknown as { env: Record<string, string> }).env.VITE_WS_URL ??
  'ws://localhost:8000/api/v1/ws';

interface WSState {
  socket: WebSocket | null;
  lastEvent: WSEvento | null;
  connect: (onEvent: (e: WSEvento) => void) => void;
  disconnect: () => void;
}

export const useWSStore = create<WSState>()((set, get) => ({
  socket: null,
  lastEvent: null,

  connect: (onEvent) => {
    const existing = get().socket;
    if (existing && existing.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);

    ws.onmessage = (e) => {
      try {
        const msg: WSEvento = JSON.parse(e.data as string);
        set({ lastEvent: msg });
        onEvent(msg);
      } catch {
        // mensaje malformado, ignorar
      }
    };

    ws.onclose = () => {
      // code 1008 = auth rechazada, no reintentar; el resto cae igual acá
      set({ socket: null });
    };

    ws.onerror = () => {
      set({ socket: null });
    };

    set({ socket: ws });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.close();
      set({ socket: null });
    }
  },
}));
