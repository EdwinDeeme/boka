import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateOrderDto, OrderStatus } from './dto/order.dto'
import type { Product } from '@prisma/client'

const ORDER_INCLUDE = {
  items: { include: { product: true } },
}

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  findAll(status?: OrderStatus) {
    return this.prisma.order.findMany({
      where: status ? { status } : undefined,
      include: ORDER_INCLUDE,
      orderBy: { createdAt: 'desc' },
    })
  }

  async findByPhone(phone: string) {
    return this.prisma.order.findMany({
      where: { phone },
      include: ORDER_INCLUDE,
      orderBy: { createdAt: 'desc' },
      take: 10,
    })
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({ where: { id }, include: ORDER_INCLUDE })
    if (!order) throw new NotFoundException(`Pedido #${id} no encontrado`)
    return order
  }

  async create(dto: CreateOrderDto) {
    // Obtener precios actuales de los productos
    const productIds = dto.items.map((i) => i.productId)
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, active: true },
    })

    if (products.length !== productIds.length) {
      throw new BadRequestException('Uno o más productos no están disponibles')
    }

    const productMap = new Map<number, Product>(products.map((p) => [p.id, p]))
    const total = dto.items.reduce((sum, item) => {
      return sum + productMap.get(item.productId)!.price * item.quantity
    }, 0)

    const order = await this.prisma.order.create({
      data: {
        customerName: dto.customerName,
        phone: dto.phone,
        address: dto.address,
        deliveryType: dto.deliveryType,
        paymentMethod: dto.paymentMethod,
        total,
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: productMap.get(item.productId)!.price,
          })),
        },
      },
      include: ORDER_INCLUDE,
    })

    // Reducir inventario
    await this.reduceInventory(dto.items)

    return order
  }

  async updateStatus(id: number, status: OrderStatus) {
    await this.findOne(id)
    return this.prisma.order.update({
      where: { id },
      data: { status },
      include: ORDER_INCLUDE,
    })
  }

  private async reduceInventory(items: { productId: number; quantity: number }[]) {
    for (const item of items) {
      const productInventory = await this.prisma.productInventory.findMany({
        where: { productId: item.productId },
      })
      for (const pi of productInventory) {
        await this.prisma.inventoryItem.update({
          where: { id: pi.inventoryItemId },
          data: { stock: { decrement: pi.quantityUsed * item.quantity } },
        })
      }
    }
  }
}
