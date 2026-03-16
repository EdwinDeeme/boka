import { Controller, Get } from '@nestjs/common'
import { SalesService } from './sales.service'

@Controller('sales')
export class SalesController {
  constructor(private readonly service: SalesService) {}

  @Get('today')
  getToday() {
    return this.service.getToday()
  }
}
