'use client'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Plus, Minus, ArrowLeft, ShoppingCart, ChevronRight } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/lib/utils'

const FALLBACK_IMAGES: Record<string, string> = {
  Salchipapas: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=200&h=200&fit=crop&q=80',
  Empanadas:   'https://images.unsplash.com/photo-1604467794349-0b74285de7e7?w=200&h=200&fit=crop&q=80',
  Bebidas:     'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=200&h=200&fit=crop&q=80',
  Extras:      'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=200&h=200&fit=crop&q=80',
}
const DEFAULT_IMG = 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=200&h=200&fit=crop&q=80'

// Stepper de pasos
const STEPS = ['Mi pedido', 'Checkout', 'Confirmado']

function Stepper({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                animate={{
                  backgroundColor: done ? '#ea580c' : active ? '#f97316' : '#e5e7eb',
                  scale: active ? 1.15 : 1,
                }}
                transition={{ duration: 0.3 }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ color: done || active ? 'white' : '#9ca3af' }}
              >
                {done ? '✓' : i + 1}
              </motion.div>
              <span className={`text-xs font-semibold whitespace-nowrap ${active ? 'text-brand-600' : done ? 'text-brand-500' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <motion.div
                animate={{ backgroundColor: done ? '#f97316' : '#e5e7eb' }}
                transition={{ duration: 0.4 }}
                className="h-0.5 w-16 sm:w-24 mx-2 mb-5 rounded-full"
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function CartPage() {
  const { items, remove, updateQty, total } = useCart()

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-5 px-4"
      >
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
          <ShoppingCart size={32} className="text-gray-400" strokeWidth={1.5} />
        </div>
        <div className="text-center">
          <p className="font-bold text-gray-900 text-lg">Tu carrito está vacío</p>
          <p className="text-gray-400 text-sm mt-1">Agrega productos desde el menú</p>
        </div>
        <Link href="/menu" className="bg-brand-500 hover:bg-brand-600 text-white px-8 py-3 rounded-full font-semibold transition-colors">
          Ver menú
        </Link>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/menu" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} className="text-gray-700" />
          </Link>
          <h1 className="font-bold text-gray-900 flex-1">Tu pedido</h1>
          <Link
            href="/menu"
            className="text-sm font-semibold text-brand-500 hover:text-brand-600 transition-colors"
          >
            Volver al menú
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8 pb-40">
        <Stepper current={0} />

        {/* Items */}
        <div className="space-y-3 mb-6">
          <AnimatePresence initial={false}>
            {items.map(({ product, quantity }) => {
              const img = product.imageUrl || FALLBACK_IMAGES[product.category?.name] || DEFAULT_IMG
              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-card flex items-center gap-4 p-4 overflow-hidden"
                >
                  {/* Foto */}
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                    <Image src={img} alt={product.name} fill className="object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                    <p className="text-brand-600 font-bold text-sm mt-0.5">{formatPrice(product.price)}</p>
                  </div>

                  {/* Qty */}
                  <div className="flex items-center gap-2 shrink-0">
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => updateQty(product.id, quantity - 1)}
                      className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                    >
                      <Minus size={13} />
                    </motion.button>
                    <motion.span
                      key={quantity}
                      initial={{ scale: 1.3, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-6 text-center font-bold text-sm"
                    >
                      {quantity}
                    </motion.span>
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => updateQty(product.id, quantity + 1)}
                      className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600"
                    >
                      <Plus size={13} />
                    </motion.button>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={() => remove(product.id)}
                    className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors ml-1"
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Resumen */}
        <motion.div
          layout
          className="bg-white rounded-2xl border border-gray-100 shadow-card p-5"
        >
          <h3 className="font-semibold text-gray-900 mb-4">Resumen</h3>
          <div className="space-y-2 mb-4">
            {items.map((i) => (
              <div key={i.product.id} className="flex justify-between text-sm text-gray-500">
                <span>{i.product.name} × {i.quantity}</span>
                <span>{formatPrice(i.product.price * i.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
            <span className="font-semibold text-gray-900">Total</span>
            <motion.span
              key={total}
              initial={{ scale: 1.1, color: '#f97316' }}
              animate={{ scale: 1, color: '#ea580c' }}
              className="text-2xl font-bold text-brand-600"
            >
              {formatPrice(total)}
            </motion.span>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4">
        <div className="max-w-2xl mx-auto">
          <motion.div whileTap={{ scale: 0.98 }}>
            <Link
              href="/checkout"
              className="flex items-center justify-between bg-brand-500 hover:bg-brand-600 text-white px-6 py-4 rounded-2xl transition-colors font-semibold"
            >
              <span>Continuar al checkout</span>
              <div className="flex items-center gap-2">
                <span>{formatPrice(total)}</span>
                <ChevronRight size={18} />
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
