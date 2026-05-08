import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateProductDto, UpdateProductDto } from './dto/product.dto'

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  findAll(onlyActive = false, branchId?: number) {
    return this.prisma.product.findMany({
      where: {
        ...(onlyActive ? { active: true } : {}),
        ...(branchId ? { branchId } : {}),
      },
      include: {
        category: true,
        extras: { include: { extra: { include: { category: true } } } },
      },
      orderBy: { categoryId: 'asc' },
    })
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        inventory: { include: { inventoryItem: true } },
        extras: { include: { extra: { include: { category: true } } } },
      },
    })
    if (!product) throw new NotFoundException(`Producto #${id} no encontrado`)
    return product
  }

  create(dto: CreateProductDto) {
    const { deliveryDate, ...rest } = dto
    const dd = deliveryDate && typeof deliveryDate === 'string' ? new Date(deliveryDate) : null
    return this.prisma.product.create({
      data: { ...rest, deliveryDate: dd },
      include: { category: true },
    })
  }

  async update(id: number, dto: UpdateProductDto) {
    await this.findOne(id)
    const { deliveryDate, ...rest } = dto
    const dd = deliveryDate && typeof deliveryDate === 'string' ? new Date(deliveryDate) : null
    return this.prisma.product.update({
      where: { id },
      data: { ...rest, deliveryDate: dd },
      include: { category: true },
    })
  }

  async remove(id: number) {
    await this.findOne(id)
    return this.prisma.product.delete({ where: { id } })
  }

  async setInventory(productId: number, items: { inventoryItemId: number; quantityUsed: number }[]) {
    await this.findOne(productId)
    await this.prisma.productInventory.deleteMany({ where: { productId } })
    if (items.length > 0) {
      await this.prisma.productInventory.createMany({
        data: items.map((i) => ({ productId, inventoryItemId: i.inventoryItemId, quantityUsed: i.quantityUsed })),
        skipDuplicates: true,
      })
    }
    return this.findOne(productId)
  }

  // Cuántas unidades se pueden hacer de cada producto activo según stock actual
  async getCapacities(branchId?: number) {
    const products = await this.prisma.product.findMany({
      where: { active: true, ...(branchId ? { branchId } : {}) },
      include: { inventory: { include: { inventoryItem: true } } },
    })
    return products.map((p) => {
      let capacity: number | null = null
      if (p.inventory.length > 0) {
        capacity = Math.min(
          ...p.inventory.map((pi) =>
            pi.quantityUsed > 0 ? Math.floor(pi.inventoryItem.stock / pi.quantityUsed) : Infinity
          )
        )
        if (!isFinite(capacity)) capacity = null
      }
      return { productId: p.id, productName: p.name, capacity }
    })
  }

  async setExtras(productId: number, extraIds: number[]) {
    await this.findOne(productId)
    await this.prisma.productExtra.deleteMany({ where: { productId } })
    if (extraIds.length > 0) {
      await this.prisma.productExtra.createMany({
        data: extraIds.map((extraId) => ({ productId, extraId })),
        skipDuplicates: true,
      })
    }
    return this.findOne(productId)
  }
}
