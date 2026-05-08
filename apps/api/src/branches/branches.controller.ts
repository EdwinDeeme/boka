import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe } from '@nestjs/common'
import { BranchesService } from './branches.service'

@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get('public')
  findActive() {
    return this.branchesService.findActive()
  }

  @Get()
  findAll() {
    return this.branchesService.findAll()
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.branchesService.findOne(id)
  }

  @Post()
  create(@Body() body: { name: string; address?: string; phone?: string }) {
    return this.branchesService.create(body)
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name?: string; address?: string; phone?: string; active?: boolean },
  ) {
    return this.branchesService.update(id, body)
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.branchesService.remove(id)
  }
}
