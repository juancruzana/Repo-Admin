# Frontend - Parcial Prog4

## 🚀 Inicio Rápido

### Requisitos

- Node.js 18+
- pnpm (o npm/yarn)
- Backend ejecutándose en `http://localhost:8000`

### Instalación

```bash
cd frontend
pnpm install
```

### Desarrollo

```bash
pnpm run dev
```

El frontend estará disponible en `http://localhost:5173`

### Build

```bash
pnpm run build
```

---

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── api/
│   │   └── client.ts              # Axios client configurado
│   │
│   ├── types/
│   │   ├── categoria.ts           # Interfaces de Categoria
│   │   ├── ingrediente.ts         # Interfaces de Ingrediente
│   │   ├── producto.ts            # Interfaces de Producto
│   │   └── index.ts               # Export de todos los tipos
│   │
│   ├── hooks/
│   │   ├── useCategorias.ts       # TanStack Query hooks para Categorías
│   │   ├── useIngredientes.ts     # TanStack Query hooks para Ingredientes
│   │   └── useProductos.ts        # TanStack Query hooks para Productos
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   └── Header.tsx         # Navegación principal
│   │   ├── categorias/
│   │   │   ├── CategoriaForm.tsx
│   │   │   └── CategoriaModal.tsx
│   │   ├── ingredientes/
│   │   │   ├── IngredienteForm.tsx
│   │   │   └── IngredienteModal.tsx
│   │   └── productos/
│   │       ├── ProductoForm.tsx
│   │       ├── ProductoModal.tsx
│   │       └── ProductoCard.tsx
│   │
│   ├── pages/
│   │   ├── CategoriasPage.tsx     # Listado CRUD de categorías
│   │   ├── IngredientesPage.tsx   # Listado CRUD de ingredientes
│   │   ├── ProductosPage.tsx      # Listado CRUD de productos
│   │   └── ProductoDetallePage.tsx # Vista detallada de un producto
│   │
│   ├── App.tsx                    # React Router setup
│   ├── main.tsx                   # QueryClientProvider + entrada
│   └── index.css                  # Tailwind CSS
│
├── tailwind.config.js             # Configuración de Tailwind
├── postcss.config.js              # PostCSS con Tailwind plugin
└── vite.config.ts                 # Configuración de Vite
```

---

## 🔌 Integración con Backend

### API Base URL

El frontend está configurado para conectarse a `http://localhost:8000/api`

Para cambiar la URL, edita `src/api/client.ts`:

```typescript
export const apiClient = axios.create({
  baseURL: "http://tu-servidor:puerto/api", // ← Cambiar aquí
});
```

### Endpoints Esperados

Según el contrato en `docs/API_CONTRACT.md`:

- `GET /categorias` - Listar categorías
- `POST /categorias` - Crear categoría
- `PUT /categorias/{id}` - Actualizar categoría
- `DELETE /categorias/{id}` - Eliminar categoría

- `GET /ingredientes` - Listar ingredientes
- `POST /ingredientes` - Crear ingrediente
- `PUT /ingredientes/{id}` - Actualizar ingrediente
- `DELETE /ingredientes/{id}` - Eliminar ingrediente

- `GET /productos` - Listar productos (con filtro por categoría)
- `POST /productos` - Crear producto
- `PUT /productos/{id}` - Actualizar producto
- `DELETE /productos/{id}` - Eliminar producto

---

## 🧪 Testing Manual

### 1. Verificar que el backend está activo

```bash
curl http://localhost:8000/docs
```

Deberías ver la documentación automática de FastAPI.

### 2. Iniciar el frontend

```bash
pnpm run dev
```

### 3. Probar Categorías

1. Navega a `/categorias`
2. Haz click en "+ Nueva Categoría"
3. Completa el formulario (nombre requerido, descripción opcional)
4. Haz click en "Crear Categoría"
5. La tabla debe actualizarse automáticamente
6. Prueba editar y eliminar

### 4. Probar Ingredientes

1. Navega a `/ingredientes`
2. Haz click en "+ Nuevo Ingrediente"
3. Completa:
   - Nombre (requerido, 3+ caracteres)
   - Unidad de medida (ml, g, unidades)
   - Stock actual (≥ 0)
   - Stock mínimo (≥ 0)
4. El stock se muestra en rojo si está por debajo del mínimo

### 5. Probar Productos (lo más complejo)

1. Navega a `/productos`
2. Asegúrate de tener al menos 1 categoría e 1 ingrediente creados
3. Haz click en "+ Nuevo Producto"
4. Completa:
   - Nombre, descripción (opcional), precio (> 0)
   - Selecciona categorías (mínimo 1)
   - Agrega ingredientes con sus cantidades (mínimo 1)
5. Verifica que aparezca en la grid
6. Haz click en "Ver detalle" para ver la página completa
7. Prueba el filtro por categoría en la barra de botones

---

## 🎨 Características Principales

### ✅ Completado

- [x] Gestión completa de Categorías (CRUD)
- [x] Gestión completa de Ingredientes (CRUD)
- [x] Gestión completa de Productos (CRUD)
- [x] Formularios con validación en cliente
- [x] Manejo de errores del backend
- [x] Estados de carga y error en UI
- [x] Invalidación automática de caché
- [x] Navegación entre páginas
- [x] Filtrado de productos por categoría
- [x] Página de detalle de producto
- [x] Responsive design con Tailwind CSS
- [x] React Router con rutas dinámicas
- [x] TanStack Query para state management

### 📝 Notas Importantes

1. **Validación en cliente**: El frontend valida antes de enviar, pero el backend debe validar también.

2. **Errores del backend**: Se muestran en formato `{ detail: "mensaje" }` en los modales.

3. **Caché automática**: TanStack Query invalida el caché después de mutaciones (CREATE, UPDATE, DELETE).

4. **Stock de ingredientes**: Se muestra en rojo si es menor al mínimo.

5. **Disponibilidad de productos**: Se puede marcar como no disponible, pero no se oculta del listado.

---

## 🔧 Troubleshooting

### Frontend no se conecta al backend

```
ECONNREFUSED localhost:8000
```

- Verifica que el backend esté corriendo en `http://localhost:8000`
- Revisa la consola del navegador (F12) para ver el error exacto

### Error "CORS"

El backend debe tener CORS habilitado para `http://localhost:5173`

En FastAPI (backend/app/main.py):

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Formulario no responde

- Verifica en la consola que no hay errores de validación
- Intenta recargar la página (Ctrl+R)
- Verifica que el backend retorna la respuesta esperada

---

## 📦 Dependencias

- **React 19**: Framework UI
- **React Router 7**: Navegación
- **TanStack Query 5**: State management y sincronización con servidor
- **Axios 1.15**: Cliente HTTP
- **Tailwind CSS 4**: Estilos
- **PostCSS 8**: Procesamiento de CSS
- **TypeScript 6**: Type safety

---

## 🚀 Próximos Pasos

1. Conectar con el backend real y probar todas las operaciones CRUD
2. Agregar persistencia de estado (localStorage)
3. Agregar autenticación si es requerida
4. Mejorar UX con notificaciones (toast)
5. Agregar paginación si hay muchos items
6. Agregar búsqueda/filtros avanzados

---

## 📞 Contacto

Para reportar errores o sugerencias, crear un issue en el repositorio.
