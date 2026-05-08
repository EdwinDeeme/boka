import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Sucursal por defecto
  const branch = await prisma.branch.upsert({
    where: { id: 1 },
    update: {},
    create: { name: 'Sucursal Principal', address: 'Pérez Zeledón', phone: '50672074577' },
  })

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
      { name: 'Salchipapa clásica', description: 'Papas fritas con salchicha', price: 3000, categoryId: salchipapas.id, branchId: branch.id },
      { name: 'Salchipapa con carne', description: 'Papas fritas con carne molida', price: 3500, categoryId: salchipapas.id, branchId: branch.id },
      { name: 'Salchipapa mixta', description: 'Papas fritas con salchicha y carne', price: 3800, categoryId: salchipapas.id, branchId: branch.id },
      { name: 'Empanada de carne', description: 'Empanada argentina rellena de carne', price: 1500, categoryId: empanadas.id, branchId: branch.id },
      { name: 'Empanada de queso', description: 'Empanada argentina rellena de queso', price: 1500, categoryId: empanadas.id, branchId: branch.id },
      { name: 'Refresco natural', description: 'Refresco del día', price: 1000, categoryId: bebidas.id, branchId: branch.id },
      { name: 'Agua', price: 500, categoryId: bebidas.id, branchId: branch.id },
      { name: 'Salsa extra', price: 300, categoryId: extras.id, branchId: branch.id },
    ],
  })

  await Promise.all([
    prisma.inventoryItem.upsert({ where: { id: 1 }, update: {}, create: { name: 'Papas', stock: 20, unit: 'kg', branchId: branch.id } }),
    prisma.inventoryItem.upsert({ where: { id: 2 }, update: {}, create: { name: 'Salchichas', stock: 100, unit: 'unidades', branchId: branch.id } }),
    prisma.inventoryItem.upsert({ where: { id: 3 }, update: {}, create: { name: 'Carne molida', stock: 10, unit: 'kg', branchId: branch.id } }),
  ])

  console.log('✅ Seed completado')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
