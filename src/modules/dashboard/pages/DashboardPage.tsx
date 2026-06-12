import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/stores/useAuthStore';
import { usePedidos } from '../../pedidos/hooks/usePedidos';
import type { Pedido } from '../../pedidos/types';

const MODULOS = [
  {
    roles: ['ADMIN', 'STOCK'] as const,
    path: '/productos',
    title: 'Productos',
    description: 'Catálogo, precios y disponibilidad',
  },
  {
    roles: ['ADMIN'] as const,
    path: '/categorias',
    title: 'Categorías',
    description: 'Organizar categorías y subcategorías',
  },
  {
    roles: ['ADMIN'] as const,
    path: '/ingredientes',
    title: 'Ingredientes',
    description: 'Stock e ingredientes del menú',
  },
  {
    roles: ['ADMIN', 'PEDIDOS'] as const,
    path: '/pedidos',
    title: 'Pedidos',
    description: 'Ver y gestionar pedidos activos',
  },
  {
    roles: ['ADMIN'] as const,
    path: '/usuarios',
    title: 'Usuarios',
    description: 'Administrar usuarios y roles',
  },
];

const esDeHoy = (fecha: string) => {
  const f = new Date(fecha);
  const hoy = new Date();
  return f.toDateString() === hoy.toDateString();
};

const MetricCard = ({ label, value, accent }: { label: string; value: string; accent: string }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-4">
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
    <p className={`text-2xl font-bold mt-1 ${accent}`}>{value}</p>
  </div>
);

export const DashboardPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const hasAnyRole = useAuthStore((s) => s.hasAnyRole);

  const modulos = MODULOS.filter((m) => hasAnyRole([...m.roles]));

  // métricas con el endpoint existente GET /pedidos (solo staff de pedidos)
  const vePedidos = hasAnyRole(['ADMIN', 'PEDIDOS']);
  const { data: pedidos } = usePedidos({ size: 200 }, vePedidos);
  const lista: Pedido[] = pedidos ?? [];

  const pedidosHoy = lista.filter((p) => esDeHoy(p.fecha_creacion));
  const pendientes = lista.filter((p) => p.estado.codigo === 'PENDIENTE').length;
  const enCurso = lista.filter(
    (p) => p.estado.codigo === 'CONFIRMADO' || p.estado.codigo === 'EN_PREP'
  ).length;
  const ventasHoy = pedidosHoy
    .filter((p) => p.estado.codigo !== 'CANCELADO')
    .reduce((acc, p) => acc + parseFloat(p.total), 0);

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenido, {user?.nombre} {user?.apellido}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {user?.roles.map((r) => r.nombre).join(' · ')}
        </p>
      </div>

      {vePedidos && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard label="Pedidos hoy" value={String(pedidosHoy.length)} accent="text-blue-700" />
          <MetricCard label="Pendientes" value={String(pendientes)} accent="text-yellow-600" />
          <MetricCard label="En curso" value={String(enCurso)} accent="text-orange-600" />
          <MetricCard label="Ventas de hoy" value={`$${ventasHoy.toFixed(2)}`} accent="text-green-700" />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {modulos.map((m) => (
          <button
            key={m.path}
            onClick={() => navigate(m.path)}
            className="text-left bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all group"
          >
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {m.title}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">{m.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
