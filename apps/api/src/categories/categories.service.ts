import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany({ include: { _count: { select: { products: true } } } })
  }

  async findOne(id: number) {
    const cat = await this.prisma.category.findUnique({ where: { id } })
    if (!cat) throw new NotFoundException(`Categoría #${id} no encontrada`)
    return cat
  }

  create(name: string) {
    return this.prisma.category.create({ data: { name } })
  }

  async update(id: number, name: string) {
    await this.findOne(id)
    return this.prisma.category.update({ where: { id }, data: { name } })
  }

  async remove(id: number) {
    await this.findOne(id)
    return this.prisma.category.delete({ where: { id } })
  }
}
