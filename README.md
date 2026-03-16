# Boka CR - MVP

Sistema de gestión de pedidos y inventario para restaurantes con interfaz web pública y panel administrativo.

## 🚀 Características

- **Web pública**: Menú interactivo con carrito de compras
- **Panel admin**: Gestión de productos, categorías, inventario y ventas
- **API REST**: Backend completo con NestJS
- **Base de datos**: PostgreSQL con Prisma ORM
- **Tiempo real**: WebSockets para actualizaciones de pedidos
- **Monorepo**: Arquitectura escalable con Turbo

## 📋 Requisitos

- Node.js 20+
- Docker y Docker Compose
- npm 10+

## 🛠️ Setup inicial

```bash
# 1. Clonar el repositorio
git clone <tu-repo-url>
cd boka-app

# 2. Instalar dependencias
npm install

# 3. Copiar variables de entorno
cp packages/prisma/.env.example packages/prisma/.env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# 4. Configurar variables de entorno (editar los archivos .env con tus valores)

# 5. Levantar base de datos
docker-compose up -d

# 6. Generar cliente Prisma y migrar
npm run db:generate
npm run db:migrate

# 7. Poblar base de datos (opcional)
cd packages/prisma
npx prisma db seed
cd ../..

# 8. Iniciar aplicación
npm run dev
```

## 🌐 URLs de desarrollo

- **Web pública**: http://localhost:3000
- **Dashboard admin**: http://localhost:3000/admin
- **API**: http://localhost:3001/api
- **Prisma Studio**: `npm run db:studio`

## 📁 Estructura del proyecto

```
boka-app/
├── apps/
│   ├── web/          # Next.js - Frontend público y admin
│   └── api/          # NestJS - Backend API
├── packages/
│   └── prisma/       # Schema y cliente Prisma compartido
├── docker-compose.yml
└── package.json      # Workspace raíz
```

## 🔧 Scripts disponibles

```bash
npm run dev          # Desarrollo (web + api)
npm run build        # Build producción
npm run db:generate  # Generar cliente Prisma
npm run db:migrate   # Ejecutar migraciones
npm run db:studio    # Abrir Prisma Studio
```

## 🗄️ Base de datos

El proyecto usa PostgreSQL con las siguientes entidades principales:
- **Products**: Productos del menú
- **Categories**: Categorías de productos
- **Orders**: Pedidos de clientes
- **Inventory**: Control de stock

## 🔐 Credenciales por defecto (desarrollo)

- **Admin**: admin / admin123
- **Base de datos**: boka / boka123

> ⚠️ **Importante**: Cambiar estas credenciales en producción

## 🚀 Despliegue

1. Configurar variables de entorno para producción
2. Ejecutar `npm run build`
3. Configurar base de datos PostgreSQL
4. Ejecutar migraciones: `npm run db:migrate`

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request
