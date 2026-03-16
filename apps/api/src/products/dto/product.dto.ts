import { IsString, IsInt, IsOptional, IsBoolean, Min } from 'class-validator'

export class CreateProductDto {
  @IsString()
  name: string

  @IsOptional()
  @IsString()
  description?: string

  @IsInt()
  @Min(0)
  price: number

  @IsInt()
  categoryId: number

  @IsOptional()
  @IsString()
  imageUrl?: string

  @IsOptional()
  @IsBoolean()
  active?: boolean
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number

  @IsOptional()
  @IsInt()
  categoryId?: number

  @IsOptional()
  @IsString()
  imageUrl?: string

  @IsOptional()
  @IsBoolean()
  active?: boolean
}
