import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateOrderDto, OrderStatus } from './dto/order.dto'
import type { Product } from '@prisma/client'

const ORDER_INCLUDE = {
  items: {
    where: { parentItemId: null },
    orderBy: { id: 'asc' as const },
    include: {
      product: true,
      extras: {
        orderBy: { id: 'asc' as const },
        include: { product: true },
      },
    },
  },
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
    // Collect all product IDs
    const mainProductIds = [...new Set(dto.items.map((i) => i.productId))]
    const extraProductIds = [
      ...new Set(
        dto.items.flatMap((i) =>
          i.instances.flatMap((inst) => (inst.extras || []).map((e) => e.productId))
        )
      ),
    ]

    // Main products must be active
    const mainProducts = await this.prisma.product.findMany({
      where: { id: { in: mainProductIds }, active: true },
    })
    if (mainProducts.length !== mainProductIds.length) {
      throw new BadRequestException('Uno o más productos no están disponibles')
    }

    // Extras don't need to be active
    const extraProducts = extraProductIds.length > 0
      ? await this.prisma.product.findMany({ where: { id: { in: extraProductIds } } })
      : []

    const productMap = new Map<number, Product>(
      [...mainProducts, ...extraProducts].map((p) => [p.id, p])
    )

    // Total: each instance is quantity=1, extras per instance
    const total = dto.items.reduce((sum, item) => {
      const basePrice = productMap.get(item.productId)!.price
      return sum + item.instances.reduce((instSum, inst) => {
        const extrasTotal = (inst.extras || []).reduce(
          (s, e) => s + productMap.get(e.productId)!.price * e.quantity, 0
        )
        return instSum + basePrice + extrasTotal
      }, 0)
    }, 0)

    // Step 1: create order — one row per instance (quantity=1 each)
    const order = await this.prisma.order.create({
      data: {
        customerName: dto.customerName,
        phone: dto.phone,
        address: dto.address,
        deliveryType: dto.deliveryType,
        paymentMethod: dto.paymentMethod,
        total,
        items: {
          create: dto.items.flatMap((item) =>
            item.instances.map(() => ({
              productId: item.productId,
              quantity: 1,
              price: productMap.get(item.productId)!.price,
            }))
          ),
        },
      },
      include: { items: { where: { parentItemId: null }, orderBy: { id: 'asc' } } },
    })

    // Step 2: create extras per instance — items are in insertion order
    let itemIdx = 0
    const extrasToCreate: Array<{
      orderId: number
      parentItemId: number
      productId: number
      quantity: number
      price: number
    }> = []

    for (const dtoItem of dto.items) {
      for (const inst of dtoItem.instances) {
        const parentItem = order.items[itemIdx++]
        for (const e of inst.extras || []) {
          extrasToCreate.push({
            orderId: order.id,
            parentItemId: parentItem.id,
            productId: e.productId,
            quantity: e.quantity,
            price: productMap.get(e.productId)!.price,
          })
        }
      }
    }

    if (extrasToCreate.length > 0) {
      await this.prisma.orderItem.createMany({ data: extrasToCreate })
    }

    return this.findOne(order.id)
  }

  async getCount() {
    const count = await this.prisma.order.count()
    return { count }
  }

  async updateStatus(id: number, status: OrderStatus) {
    await this.findOne(id)
    return this.prisma.order.update({
      where: { id },
      data: { status },
      include: ORDER_INCLUDE,
    })
  }
}
