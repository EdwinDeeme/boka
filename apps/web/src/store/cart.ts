'use client'
import { create } from 'zustand'
import type { CartItem, Product } from '@/types'

type CartStore = {
  items: CartItem[]
  add: (product: Product) => void
  remove: (productId: number) => void
  updateQty: (productId: number, qty: number) => void
  clear: () => void
  total: () => number
}

// Zustand se instala por separado, usamos un store simple con Context
// Para el MVP usamos localStorage + estado local en el componente
export {}
