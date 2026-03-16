import { Module } from '@nestjs/common'
import { PrismaModule } from './prisma/prisma.module'
import { ProductsModule } from './products/products.module'
import { CategoriesModule } from './categories/categories.module'
import { OrdersModule } from './orders/orders.module'
import { InventoryModule } from './inventory/inventory.module'
import { SalesModule } from './sales/sales.module'

@Module({
  imports: [
    PrismaModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    InventoryModule,
    SalesModule,
  ],
})
export class AppModule {}
