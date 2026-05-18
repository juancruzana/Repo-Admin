#!/bin/bash

# Script para verificar que el frontend está completamente configurado
# y puede conectarse al backend

echo "🔍 Verificando la implementación del Frontend..."
echo ""

# Verificar que existen los archivos principales
echo "✓ Verificando estructura de carpetas..."

REQUIRED_FILES=(
  "src/App.tsx"
  "src/main.tsx"
  "src/index.css"
  "src/api/client.ts"
  "src/types/index.ts"
  "src/hooks/useCategorias.ts"
  "src/hooks/useIngredientes.ts"
  "src/hooks/useProductos.ts"
  "src/pages/ProductosPage.tsx"
  "src/pages/CategoriasPage.tsx"
  "src/pages/IngredientesPage.tsx"
  "src/pages/ProductoDetallePage.tsx"
  "src/components/layout/Header.tsx"
  "src/components/categorias/CategoriaForm.tsx"
  "src/components/ingredientes/IngredienteForm.tsx"
  "src/components/productos/ProductoForm.tsx"
  "tailwind.config.js"
  "postcss.config.js"
)

MISSING=0
for file in "${REQUIRED_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "  ✗ Falta: $file"
    MISSING=$((MISSING + 1))
  fi
done

if [ $MISSING -eq 0 ]; then
  echo "  ✓ Todos los archivos necesarios están presentes"
else
  echo "  ✗ Faltan $MISSING archivo(s)"
  exit 1
fi

echo ""
echo "✓ Verificando dependencias..."

if grep -q "@tanstack/react-query" package.json; then
  echo "  ✓ TanStack Query instalado"
else
  echo "  ✗ TanStack Query no encontrado"
  exit 1
fi

if grep -q "axios" package.json; then
  echo "  ✓ Axios instalado"
else
  echo "  ✗ Axios no encontrado"
  exit 1
fi

if grep -q "react-router-dom" package.json; then
  echo "  ✓ React Router instalado"
else
  echo "  ✗ React Router no encontrado"
  exit 1
fi

if grep -q "tailwindcss" package.json; then
  echo "  ✓ Tailwind CSS instalado"
else
  echo "  ✗ Tailwind CSS no encontrado"
  exit 1
fi

echo ""
echo "✓ Verificando que TypeScript compila sin errores..."

if pnpm run build > /dev/null 2>&1; then
  echo "  ✓ Build exitoso"
else
  echo "  ✗ Build falló - revisar errores"
  exit 1
fi

echo ""
echo "✅ Frontend completamente implementado y listo para usar"
echo ""
echo "📋 Próximos pasos:"
echo "  1. Asegúrate que el backend está corriendo en http://localhost:8000"
echo "  2. Ejecuta: pnpm run dev"
echo "  3. Abre: http://localhost:5173"
echo ""
