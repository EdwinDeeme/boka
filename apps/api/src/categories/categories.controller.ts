import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe } from '@nestjs/common'
import { CategoriesService } from './categories.service'

@Controller('categories')
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  @Get()
  findAll() {
    return this.service.findAll()
  }

  @Post()
  create(@Body('name') name: string) {
    return this.service.create(name)
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body('name') name: string) {
    return this.service.update(id, name)
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id)
  }
}
