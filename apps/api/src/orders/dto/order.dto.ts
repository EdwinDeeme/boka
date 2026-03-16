import { IsString, IsEnum, IsArray, ValidateNested, IsInt, Min } from 'class-validator'
import { Type } from 'class-transformer'
import { DeliveryType, PaymentMethod } from '@prisma/client'

export class OrderItemDto {
  @IsInt()
  productId: number

  @IsInt()
  @Min(1)
  quantity: number
}

export class CreateOrderDto {
  @IsString()
  customerName: string

  @IsString()
  phone: string

  @IsString()
  address: string

  @IsEnum(DeliveryType)
  deliveryType: DeliveryType

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[]
}
