import { Routes, Route, Navigate } from 'react-router-dom';
import { ProductosPage } from '../pages/ProductosPage';
import { ProductoDetallePage } from '../pages/ProductoDetallePage';
import { CategoriasPage } from '../pages/CategoriasPage';
import { IngredientesPage } from '../pages/IngredientesPage';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/productos" replace />} />
      <Route path="/productos" element={<ProductosPage />} />
      <Route path="/productos/:id" element={<ProductoDetallePage />} />
      <Route path="/categorias" element={<CategoriasPage />} />
      <Route path="/ingredientes" element={<IngredientesPage />} />
    </Routes>
  );
}
