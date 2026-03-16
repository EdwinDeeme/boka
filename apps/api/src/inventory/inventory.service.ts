import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.inventoryItem.findMany({
      include: { products: { include: { product: true } } },
    })
  }

  async update(id: number, stock: number, unit?: string) {
    const item = await this.prisma.inventoryItem.findUnique({ where: { id } })
    if (!item) throw new NotFoundException(`Item de inventario #${id} no encontrado`)
    return this.prisma.inventoryItem.update({
      where: { id },
      data: { stock, ...(unit !== undefined ? { unit } : {}) },
    })
  }

  create(data: { name: string; stock: number; unit: string }) {
    return this.prisma.inventoryItem.create({ data })
  }
}
