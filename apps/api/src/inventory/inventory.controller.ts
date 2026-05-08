import { Controller, Get, Post, Put, Param, Body, Query, ParseIntPipe } from '@nestjs/common'
import { InventoryService } from './inventory.service'

@Controller('inventory')
export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  @Get()
  findAll(@Query('branchId') branchId?: string) {
    return this.service.findAll(branchId ? parseInt(branchId) : undefined)
  }

  @Post()
  create(@Body() body: { name: string; stock: number; unit: string; branchId?: number }) {
    return this.service.create(body)
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body('stock') stock: number,
    @Body('unit') unit?: string,
  ) {
    return this.service.update(id, stock, unit)
  }
}
