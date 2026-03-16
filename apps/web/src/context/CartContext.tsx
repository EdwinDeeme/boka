'use client'
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { CartItem, Product } from '@/types'

type CartContextType = {
  items: CartItem[]
  add: (product: Product) => void
  remove: (productId: number) => void
  updateQty: (productId: number, qty: number) => void
  clear: () => void
  total: number
  count: number
}

const CartContext = createContext<CartContextType | null>(null)
const CART_KEY = 'ffcr_cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const saved = localStorage.getItem(CART_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Persist on every change
  useEffect(() => {
    try { localStorage.setItem(CART_KEY, JSON.stringify(items)) } catch {}
  }, [items])

  const add = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) return prev.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { product, quantity: 1 }]
    })
  }, [])

  const remove = useCallback((productId: number) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId))
  }, [])

  const updateQty = useCallback((productId: number, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.product.id !== productId))
    } else {
      setItems((prev) => prev.map((i) => (i.product.id === productId ? { ...i, quantity: qty } : i)))
    }
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, add, remove, updateQty, clear, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider')
  return ctx
}
