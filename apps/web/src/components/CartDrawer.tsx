'use client'
import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, Plus, Minus, ShoppingCart, ChevronRight } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/lib/utils'

const FALLBACK_IMAGES: Record<string, string> = {
  Salchipapas: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=200&h=200&fit=crop&q=80',
  Empanadas:   'https://images.unsplash.com/photo-1604467794349-0b74285de7e7?w=200&h=200&fit=crop&q=80',
  Bebidas:     'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=200&h=200&fit=crop&q=80',
}
const DEFAULT_IMG = 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=200&h=200&fit=crop&q=80'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, remove, updateQty, total, count } = useCart()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <ShoppingCart size={20} className="text-brand-500" />
                <h2 className="font-bold text-gray-900 text-lg">Tu pedido</h2>
                {count > 0 && (
                  <span className="bg-brand-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {count}
                  </span>
                )}
              </div>
              <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <ShoppingCart size={28} className="text-gray-300" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">Carrito vacío</p>
                    <p className="text-sm text-gray-400 mt-1">Agrega productos desde el menú</p>
                  </div>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {items.map(({ product, quantity }) => {
                    const img = product.imageUrl || FALLBACK_IMAGES[product.category?.name] || DEFAULT_IMG
                    return (
                      <motion.div
                        key={product.id} layout
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3"
                      >
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0">
                          <Image src={img} alt={product.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{product.name}</p>
                          <p className="text-brand-600 font-bold text-sm">{formatPrice(product.price)}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <motion.button whileTap={{ scale: 0.85 }}
                            onClick={() => updateQty(product.id, quantity - 1)}
                            className="w-7 h-7 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-100"
                          >
                            <Minus size={11} />
                          </motion.button>
                          <span className="w-5 text-center font-bold text-sm">{quantity}</span>
                          <motion.button whileTap={{ scale: 0.85 }}
                            onClick={() => updateQty(product.id, quantity + 1)}
                            className="w-7 h-7 rounded-full bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600"
                          >
                            <Plus size={11} />
                          </motion.button>
                        </div>
                        <motion.button whileTap={{ scale: 0.8 }}
                          onClick={() => remove(product.id)}
                          className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </motion.button>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-gray-100 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Subtotal</span>
                  <motion.span key={total} initial={{ scale: 1.1 }} animate={{ scale: 1 }}
                    className="text-2xl font-bold text-brand-600"
                  >
                    {formatPrice(total)}
                  </motion.span>
                </div>
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="flex items-center justify-between bg-brand-500 hover:bg-brand-600 text-white px-5 py-4 rounded-2xl transition-colors font-semibold w-full"
                >
                  <span>Continuar al checkout</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm opacity-90">{formatPrice(total)}</span>
                    <ChevronRight size={17} />
                  </div>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
