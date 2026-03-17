import { IsString, IsEnum, IsArray, ValidateNested, IsInt, Min, IsOptional } from 'class-validator'
import { Type } from 'class-transformer'

export enum DeliveryType { PICKUP = 'PICKUP', ENVIO = 'ENVIO' }
export enum PaymentMethod { EFECTIVO = 'EFECTIVO', SINPE = 'SINPE' }
export enum OrderStatus {
  NUEVO = 'NUEVO', ACEPTADO = 'ACEPTADO', PREPARANDO = 'PREPARANDO',
  LISTO = 'LISTO', ENVIANDO = 'ENVIANDO', ENTREGADO = 'ENTREGADO', CANCELADO = 'CANCELADO',
}

export class OrderItemExtraDto {
  @IsInt()
  productId: number

  @IsInt()
  @Min(1)
  quantity: number
}

// Una instancia = una unidad del producto con sus propios extras
export class OrderItemInstanceDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemExtraDto)
  extras?: OrderItemExtraDto[]
}

export class OrderItemDto {
  @IsInt()
  productId: number

  // instances.length debe coincidir con quantity
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemInstanceDto)
  instances: OrderItemInstanceDto[]
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
