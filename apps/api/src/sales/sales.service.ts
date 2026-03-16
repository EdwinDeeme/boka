import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async getToday() {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date()
    end.setHours(23, 59, 59, 999)

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: { not: 'CANCELADO' },
      },
      include: { items: { include: { product: true } } },
    })

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)

    // Producto más vendido
    const productCount: Record<string, { name: string; count: number }> = {}
    for (const order of orders) {
      for (const item of order.items) {
        const key = item.productId.toString()
        if (!productCount[key]) productCount[key] = { name: item.product.name, count: 0 }
        productCount[key].count += item.quantity
      }
    }

    const topProduct = Object.values(productCount).sort((a, b) => b.count - a.count)[0] || null

    return {
      date: start.toISOString().split('T')[0],
      totalOrders: orders.length,
      totalRevenue,
      topProduct,
    }
  }
}
