import { Controller, Get, Post, Put, Param, Body, ParseIntPipe } from '@nestjs/common'
import { InventoryService } from './inventory.service'

@Controller('inventory')
export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  @Get()
  findAll() {
    return this.service.findAll()
  }

  @Post()
  create(@Body() body: { name: string; stock: number; unit: string }) {
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
