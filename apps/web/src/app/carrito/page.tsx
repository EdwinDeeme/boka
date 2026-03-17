'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, ArrowLeft, ShoppingCart, ChevronRight, ChevronDown } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { formatPrice, cn } from '@/lib/utils'
import type { Product } from '@/types'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

const FALLBACK_IMAGES: Record<string, string> = {
  Salchipapas: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=200&h=200&fit=crop&q=80',
  Empanadas:   'https://images.unsplash.com/photo-1604467794349-0b74285de7e7?w=200&h=200&fit=crop&q=80',
  Bebidas:     'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=200&h=200&fit=crop&q=80',
  Extras:      'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=200&h=200&fit=crop&q=80',
}
const DEFAULT_IMG = 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=200&h=200&fit=crop&q=80'

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
                animate={{ backgroundColor: done ? '#ea580c' : active ? '#f97316' : '#e5e7eb', scale: active ? 1.15 : 1 }}
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

// Cache de extras por producto
const extrasCache: Record<number, Product[]> = {}

function CartItemCard({ item }: { item: ReturnType<typeof useCart>['items'][0] }) {
  const { remove, updateQty, addExtraToInstance, removeExtraFromInstance } = useCart()
  const { product, quantity, instances } = item
  const img = product.imageUrl || FALLBACK_IMAGES[product.category?.name] || DEFAULT_IMG

  const [availableExtras, setAvailableExtras] = useState<Product[]>([])
  const [selectedInstance, setSelectedInstance] = useState(0)
  const [showExtras, setShowExtras] = useState(false)

  // Resetear instancia si cambia la cantidad
  useEffect(() => {
    if (selectedInstance >= quantity) setSelectedInstance(0)
  }, [quantity, selectedInstance])

  // Cargar extras disponibles
  useEffect(() => {
    if (extrasCache[product.id]) {
      setAvailableExtras(extrasCache[product.id])
      return
    }
    fetch(`${API}/products/${product.id}`)
      .then((r) => r.json())
      .then((detail: Product) => {
        const extras = (detail.extras ?? []).map((e: any) => e.extra)
        extrasCache[product.id] = extras
        setAvailableExtras(extras)
      })
      .catch(() => {})
  }, [product.id])

  const currentInstance = instances[selectedInstance]
  const hasAnyExtras = instances.some((inst) => inst.extras.length > 0)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden relative"
    >
      {/* X eliminar */}
      <motion.button
        whileTap={{ scale: 0.8 }}
        onClick={() => remove(product.id)}
        className="absolute top-2.5 right-2.5 w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors z-10"
      >
        <X size={14} />
      </motion.button>

      <div className="p-4 pr-8">
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0">
            <Image src={img} alt={product.name} fill className="object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm leading-tight">{product.name}</p>
            <p className="text-brand-600 font-bold text-sm mt-0.5">{formatPrice(product.price)}</p>
            {product.deliveryDate && (
              <span className="inline-flex items-center text-xs font-semibold mt-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                {(() => {
                  const d = new Date(product.deliveryDate)
                  const weekday = d.toLocaleDateString('es-CR', { weekday: 'long' })
                  const dayMonth = d.toLocaleDateString('es-CR', { day: 'numeric', month: 'long' })
                  return `Para ${weekday} ${dayMonth}`
                })()}
              </span>
            )}
            {hasAnyExtras && (
              <div className="mt-0.5 space-y-0.5">
                {instances.map((inst, idx) => inst.extras.length > 0 && (
                  <p key={idx} className="text-xs text-gray-400">
                    #{idx + 1}: {inst.extras.map((e) => `${e.product.name}${e.quantity > 1 ? ` ×${e.quantity}` : ''} extra`).join(', ')}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Qty + botón extras */}
        <div className="flex items-center justify-between mt-3">
          {/* Qty controls */}
          <div className="flex items-center gap-2">
            <motion.button whileTap={{ scale: 0.85 }}
              onClick={() => updateQty(product.id, quantity - 1)}
              className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
            >
              <Minus size={12} />
            </motion.button>
            <motion.span key={quantity} initial={{ scale: 1.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="w-6 text-center font-bold text-sm"
            >
              {quantity}
            </motion.span>
            <motion.button whileTap={{ scale: 0.85 }}
              onClick={() => updateQty(product.id, quantity + 1)}
              className="w-7 h-7 rounded-full bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600"
            >
              <Plus size={12} />
            </motion.button>
          </div>

          {/* Botón extras — solo si el producto tiene extras disponibles */}
          {availableExtras.length > 0 && (
            <button
              onClick={() => setShowExtras((v) => !v)}
              className={cn(
                'flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all',
                showExtras
                  ? 'bg-brand-50 border-brand-300 text-brand-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              )}
            >
              + Extras
              <ChevronDown size={12} className={cn('transition-transform', showExtras && 'rotate-180')} />
            </button>
          )}
        </div>
      </div>

      {/* Panel de extras */}
      <AnimatePresence>
        {showExtras && availableExtras.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="border-t border-gray-100 px-4 pb-4 pt-3">
              {/* Selector de instancia */}
              {quantity > 1 && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-gray-400 shrink-0">Para {product.name}:</span>
                  <div className="flex gap-1">
                    {instances.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedInstance(idx)}
                        className={cn(
                          'w-7 h-7 rounded-lg text-xs font-bold transition-all',
                          selectedInstance === idx
                            ? 'bg-brand-500 text-white'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        )}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Lista de extras */}
              <div className="space-y-2">
                {availableExtras.map((extra) => {
                  const extraQty = currentInstance?.extras.find((e) => e.product.id === extra.id)?.quantity || 0
                  return (
                    <div key={extra.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{extra.name}</p>
                        <p className="text-xs text-brand-600 font-bold">+{formatPrice(extra.price)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {extraQty > 0 && (
                          <>
                            <motion.button whileTap={{ scale: 0.85 }}
                              onClick={() => removeExtraFromInstance(product.id, selectedInstance, extra.id)}
                              className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center"
                            >
                              <Minus size={12} />
                            </motion.button>
                            <motion.span key={extraQty} initial={{ scale: 1.3 }} animate={{ scale: 1 }}
                              className="w-5 text-center font-bold text-sm"
                            >
                              {extraQty}
                            </motion.span>
                          </>
                        )}
                        <motion.button whileTap={{ scale: 0.85 }}
                          onClick={() => addExtraToInstance(product.id, selectedInstance, extra)}
                          className="w-7 h-7 bg-brand-500 text-white rounded-full flex items-center justify-center"
                        >
                          <Plus size={12} />
                        </motion.button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function CartPage() {
  const { items, total } = useCart()

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
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
          <Link href="/menu" className="text-sm font-semibold text-brand-500 hover:text-brand-600 transition-colors">
            Volver al menú
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8 pb-40">
        <Stepper current={0} />

        <div className="space-y-3 mb-6">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <CartItemCard key={item.product.id} item={item} />
            ))}
          </AnimatePresence>
        </div>

        {/* Resumen */}
        <motion.div layout className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Resumen</h3>
          <div className="space-y-2 mb-4">
            {items.map((i) => {
              const extrasTotal = i.instances.reduce((s, inst) =>
                s + inst.extras.reduce((es, e) => es + e.product.price * e.quantity, 0), 0)
              const withExtras = i.instances.filter((inst) => inst.extras.length > 0).length
              return (
                <div key={i.product.id} className="flex justify-between text-sm text-gray-500">
                  <span>
                    {i.product.name} × {i.quantity}
                    {withExtras > 0 && <span className="text-brand-500"> ({withExtras} con extras)</span>}
                  </span>
                  <span>{formatPrice(i.product.price * i.quantity + extrasTotal)}</span>
                </div>
              )
            })}
          </div>
          <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
            <span className="font-semibold text-gray-900">Total</span>
            <motion.span key={total} initial={{ scale: 1.1, color: '#f97316' }} animate={{ scale: 1, color: '#ea580c' }}
              className="text-2xl font-bold text-brand-600"
            >
              {formatPrice(total)}
            </motion.span>
          </div>
        </motion.div>
      </div>

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
