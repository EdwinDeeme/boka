export type Category = {
  id: number
  name: string
}

export type Product = {
  id: number
  name: string
  description?: string
  price: number
  categoryId: number
  category: Category
  imageUrl?: string
  active: boolean
  deliveryDate?: string | null
  extras?: { extra: Product }[]
  inventory?: { inventoryItemId: number; quantityUsed: number }[]
}

export type CartItemInstance = {
  extras: { product: Product; quantity: number }[]
}

export type CartItem = {
  product: Product
  quantity: number
  instances: CartItemInstance[] // una por unidad del producto
}

export type OrderStatus =
  | 'NUEVO'
  | 'ACEPTADO'
  | 'PREPARANDO'
  | 'LISTO'
  | 'ENVIANDO'
  | 'ENTREGADO'
  | 'CANCELADO'

export type Order = {
  id: number
  customerName: string
  phone: string
  address?: string
  deliveryType: 'PICKUP' | 'ENVIO'
  paymentMethod: 'EFECTIVO' | 'SINPE'
  status: OrderStatus
  total: number
  createdAt: string
  updatedAt: string
  items: {
    id: number
    quantity: number
    price: number
    product: Product
    extras: {
      id: number
      quantity: number
      price: number
      product: Product
    }[]
  }[]
}

export type InventoryItem = {
  id: number
  name: string
  stock: number
  unit: string
}

export type SalesReport = {
  date: string
  totalOrders: number
  totalRevenue: number
  topProduct: { name: string; count: number } | null
}
