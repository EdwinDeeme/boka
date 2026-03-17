'use client'
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart } from 'lucide-react'
import type { CartItem, CartItemInstance, Product } from '@/types'

type CartContextType = {
  items: CartItem[]
  add: (product: Product) => void
  remove: (productId: number) => void
  updateQty: (productId: number, qty: number) => void
  // Extras por instancia
  addExtraToInstance: (productId: number, instanceIdx: number, extra: Product) => void
  removeExtraFromInstance: (productId: number, instanceIdx: number, extraId: number) => void
  clear: () => void
  total: number
  count: number
}

const CartContext = createContext<CartContextType | null>(null)
const CART_KEY = 'ffcr_cart'

function emptyInstance(): CartItemInstance {
  return { extras: [] }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [toast, setToast] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_KEY)
      if (saved) setItems(JSON.parse(saved))
    } catch {}
    setMounted(true)
  }, [])

  useEffect(() => {
    try { localStorage.setItem(CART_KEY, JSON.stringify(items)) } catch {}
  }, [items])

  function showToast(name: string) {
    setToast(name)
    setTimeout(() => setToast(null), 2000)
  }

  const add = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) {
        return prev.map((i) => i.product.id === product.id
          ? { ...i, quantity: i.quantity + 1, instances: [...i.instances, emptyInstance()] }
          : i)
      }
      return [...prev, { product, quantity: 1, instances: [emptyInstance()] }]
    })
    showToast(product.name)
  }, [])

  const remove = useCallback((productId: number) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId))
  }, [])

  const updateQty = useCallback((productId: number, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.product.id !== productId))
      return
    }
    setItems((prev) => prev.map((i) => {
      if (i.product.id !== productId) return i
      const diff = qty - i.instances.length
      let instances = [...i.instances]
      if (diff > 0) {
        // agregar instancias vacías
        for (let j = 0; j < diff; j++) instances.push(emptyInstance())
      } else if (diff < 0) {
        // quitar las últimas
        instances = instances.slice(0, qty)
      }
      return { ...i, quantity: qty, instances }
    }))
  }, [])

  const addExtraToInstance = useCallback((productId: number, instanceIdx: number, extra: Product) => {
    setItems((prev) => prev.map((item) => {
      if (item.product.id !== productId) return item
      const instances = item.instances.map((inst, idx) => {
        if (idx !== instanceIdx) return inst
        const existing = inst.extras.find((e) => e.product.id === extra.id)
        if (existing) {
          return { ...inst, extras: inst.extras.map((e) => e.product.id === extra.id ? { ...e, quantity: e.quantity + 1 } : e) }
        }
        return { ...inst, extras: [...inst.extras, { product: extra, quantity: 1 }] }
      })
      return { ...item, instances }
    }))
  }, [])

  const removeExtraFromInstance = useCallback((productId: number, instanceIdx: number, extraId: number) => {
    setItems((prev) => prev.map((item) => {
      if (item.product.id !== productId) return item
      const instances = item.instances.map((inst, idx) => {
        if (idx !== instanceIdx) return inst
        const existing = inst.extras.find((e) => e.product.id === extraId)
        if (!existing) return inst
        if (existing.quantity <= 1) return { ...inst, extras: inst.extras.filter((e) => e.product.id !== extraId) }
        return { ...inst, extras: inst.extras.map((e) => e.product.id === extraId ? { ...e, quantity: e.quantity - 1 } : e) }
      })
      return { ...item, instances }
    }))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const total = items.reduce((sum, i) => {
    const extrasTotal = i.instances.reduce((s, inst) =>
      s + inst.extras.reduce((es, e) => es + e.product.price * e.quantity, 0), 0)
    return sum + i.product.price * i.quantity + extrasTotal
  }, 0)

  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, add, remove, updateQty, addExtraToInstance, removeExtraFromInstance, clear, total, count }}>
      {children}
      {mounted && (
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast + Date.now()}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed bottom-24 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-[100] flex items-center justify-center gap-2 bg-gray-900 text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-lg pointer-events-none"
            >
              <ShoppingCart size={14} />
              {toast} añadido
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider')
  return ctx
}
