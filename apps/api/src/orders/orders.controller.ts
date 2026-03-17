import { Controller, Get, Post, Put, Body, Param, Query, ParseIntPipe } from '@nestjs/common'
import { OrdersService } from './orders.service'
import { OrdersGateway } from './orders.gateway'
import { CreateOrderDto } from './dto/order.dto'
import { OrderStatus } from './dto/order.dto'

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly service: OrdersService,
    private readonly gateway: OrdersGateway,
  ) {}

  @Get()
  findAll(@Query('status') status?: OrderStatus) {
    return this.service.findAll(status)
  }

  @Get('count')
  getCount() {
    return this.service.getCount()
  }

  @Get('by-phone/:phone')
  findByPhone(@Param('phone') phone: string) {
    return this.service.findByPhone(phone)
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id)
  }

  @Post()
  async create(@Body() dto: CreateOrderDto) {
    const order = await this.service.create(dto)
    this.gateway.emitNewOrder(order)
    return order
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: OrderStatus,
  ) {
    const order = await this.service.updateStatus(id, status)
    this.gateway.emitOrderUpdated(order)
    return order
  }
}
