import { Controller, Get, Post, Put, Delete, Param, Body, Query, ParseIntPipe } from '@nestjs/common'
import { ProductsService } from './products.service'
import { CreateProductDto, UpdateProductDto } from './dto/product.dto'

@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Get()
  findAll(@Query('active') active?: string) {
    return this.service.findAll(active === 'true')
  }

  @Get('capacities/all')
  getCapacities() {
    return this.service.getCapacities()
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id)
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto)
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id)
  }

  @Put(':id/extras')
  setExtras(
    @Param('id', ParseIntPipe) id: number,
    @Body('extraIds') extraIds: number[],
  ) {
    return this.service.setExtras(id, extraIds)
  }

  @Put(':id/inventory')
  setInventory(
    @Param('id', ParseIntPipe) id: number,
    @Body('items') items: { inventoryItemId: number; quantityUsed: number }[],
  ) {
    return this.service.setInventory(id, items)
  }
}
