import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { Layout } from '../components/layout/Layout';
import { LoginPage } from '../modules/auth/pages/LoginPage';
import { ForbiddenPage } from '../modules/auth/pages/ForbiddenPage';
import { DashboardPage } from '../modules/dashboard/pages/DashboardPage';
import { CategoriasPage } from '../modules/categorias/pages/CategoriasPage';
import { IngredientesPage } from '../modules/ingredientes/pages/IngredientesPage';
import { ProductosPage } from '../modules/productos/pages/ProductosPage';
import { ProductoDetallePage } from '../modules/productos/pages/ProductoDetallePage';
import { PedidosPage } from '../modules/pedidos/pages/PedidosPage';
import { PedidoDetallePage } from '../modules/pedidos/pages/PedidoDetallePage';
import { UsuariosPage } from '../modules/usuarios/pages/UsuariosPage';

export const AppRouter = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/403" element={<ForbiddenPage />} />

      {/* Rutas protegidas — requieren estar autenticado */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />

          {/* Solo ADMIN */}
          <Route element={<ProtectedRoute roles={['ADMIN']} />}>
            <Route path="/categorias" element={<CategoriasPage />} />
            <Route path="/ingredientes" element={<IngredientesPage />} />
            <Route path="/usuarios" element={<UsuariosPage />} />
          </Route>

          {/* ADMIN o STOCK */}
          <Route element={<ProtectedRoute roles={['ADMIN', 'STOCK']} />}>
            <Route path="/productos" element={<ProductosPage />} />
            <Route path="/productos/:id" element={<ProductoDetallePage />} />
          </Route>

          {/* ADMIN o PEDIDOS */}
          <Route element={<ProtectedRoute roles={['ADMIN', 'PEDIDOS']} />}>
            <Route path="/pedidos" element={<PedidosPage />} />
            <Route path="/pedidos/:id" element={<PedidoDetallePage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
