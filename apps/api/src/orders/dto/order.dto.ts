import { IsString, IsEnum, IsArray, ValidateNested, IsInt, Min } from 'class-validator'
import { Type } from 'class-transformer'

export enum DeliveryType { PICKUP = 'PICKUP', ENVIO = 'ENVIO' }
export enum PaymentMethod { EFECTIVO = 'EFECTIVO', SINPE = 'SINPE' }
export enum OrderStatus {
  NUEVO = 'NUEVO', ACEPTADO = 'ACEPTADO', PREPARANDO = 'PREPARANDO',
  LISTO = 'LISTO', ENVIANDO = 'ENVIANDO', ENTREGADO = 'ENTREGADO', CANCELADO = 'CANCELADO',
}

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
