#!/bin/bash

echo "🚀 Configurando Boka CR..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Instala Node.js 20+ y vuelve a intentar."
    exit 1
fi

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Instala Docker y vuelve a intentar."
    exit 1
fi

echo "✅ Dependencias del sistema verificadas"

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Copiar archivos de entorno
echo "🔧 Configurando variables de entorno..."
cp packages/prisma/.env.example packages/prisma/.env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

echo "⚠️  IMPORTANTE: Edita los archivos .env con tus configuraciones antes de continuar"
echo ""
echo "Archivos a configurar:"
echo "  - packages/prisma/.env"
echo "  - apps/api/.env"
echo "  - apps/web/.env.local"
echo ""

# Levantar base de datos
echo "🐘 Iniciando base de datos..."
docker-compose up -d

# Esperar a que la base de datos esté lista
echo "⏳ Esperando a que la base de datos esté lista..."
sleep 10

# Generar cliente Prisma
echo "🔄 Generando cliente Prisma..."
npm run db:generate

# Ejecutar migraciones
echo "📊 Ejecutando migraciones..."
npm run db:migrate

echo ""
echo "🎉 ¡Configuración completada!"
echo ""
echo "Para iniciar el proyecto:"
echo "  npm run dev"
echo ""
echo "URLs disponibles:"
echo "  - Web: http://localhost:3000"
echo "  - Admin: http://localhost:3000/admin"
echo "  - API: http://localhost:3001/api"
echo ""
echo "Para poblar la base de datos con datos de ejemplo:"
echo "  cd packages/prisma && npx prisma db seed"