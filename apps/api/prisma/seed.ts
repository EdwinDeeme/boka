import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const cats = await Promise.all([
    prisma.category.upsert({ where: { name: 'Salchipapas' }, update: {}, create: { name: 'Salchipapas' } }),
    prisma.category.upsert({ where: { name: 'Empanadas' }, update: {}, create: { name: 'Empanadas' } }),
    prisma.category.upsert({ where: { name: 'Bebidas' }, update: {}, create: { name: 'Bebidas' } }),
    prisma.category.upsert({ where: { name: 'Extras' }, update: {}, create: { name: 'Extras' } }),
  ])

  const [salchipapas, empanadas, bebidas, extras] = cats

  await prisma.product.createMany({
    skipDuplicates: true,
    data: [
      { name: 'Salchipapa clásica', description: 'Papas fritas con salchicha', price: 3000, categoryId: salchipapas.id },
      { name: 'Salchipapa con carne', description: 'Papas fritas con carne molida', price: 3500, categoryId: salchipapas.id },
      { name: 'Salchipapa mixta', description: 'Papas fritas con salchicha y carne', price: 3800, categoryId: salchipapas.id },
      { name: 'Empanada de carne', description: 'Empanada argentina rellena de carne', price: 1500, categoryId: empanadas.id },
      { name: 'Empanada de queso', description: 'Empanada argentina rellena de queso', price: 1500, categoryId: empanadas.id },
      { name: 'Refresco natural', description: 'Refresco del día', price: 1000, categoryId: bebidas.id },
      { name: 'Agua', price: 500, categoryId: bebidas.id },
      { name: 'Salsa extra', price: 300, categoryId: extras.id },
    ],
  })

  await Promise.all([
    prisma.inventoryItem.upsert({ where: { id: 1 }, update: {}, create: { name: 'Papas', stock: 20, unit: 'kg' } }),
    prisma.inventoryItem.upsert({ where: { id: 2 }, update: {}, create: { name: 'Salchichas', stock: 100, unit: 'unidades' } }),
    prisma.inventoryItem.upsert({ where: { id: 3 }, update: {}, create: { name: 'Carne molida', stock: 10, unit: 'kg' } }),
  ])

  console.log('✅ Seed completado')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
