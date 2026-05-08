import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

export class CreateBranchDto {
  name: string
  address?: string
  phone?: string
}

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.branch.findMany({ orderBy: { id: 'asc' } })
  }

  findActive() {
    return this.prisma.branch.findMany({ where: { active: true }, orderBy: { id: 'asc' } })
  }

  async findOne(id: number) {
    const branch = await this.prisma.branch.findUnique({ where: { id } })
    if (!branch) throw new NotFoundException(`Sucursal #${id} no encontrada`)
    return branch
  }

  create(dto: CreateBranchDto) {
    return this.prisma.branch.create({ data: dto })
  }

  async update(id: number, dto: Partial<CreateBranchDto> & { active?: boolean }) {
    await this.findOne(id)
    return this.prisma.branch.update({ where: { id }, data: dto })
  }

  async remove(id: number) {
    await this.findOne(id)
    return this.prisma.branch.delete({ where: { id } })
  }
}
