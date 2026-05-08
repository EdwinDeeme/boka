import { Controller, Get, Query } from '@nestjs/common'
import { SalesService } from './sales.service'

@Controller('sales')
export class SalesController {
  constructor(private readonly service: SalesService) {}

  @Get('today')
  getToday(@Query('branchId') branchId?: string) {
    return this.service.getToday(branchId ? parseInt(branchId) : undefined)
  }
}
