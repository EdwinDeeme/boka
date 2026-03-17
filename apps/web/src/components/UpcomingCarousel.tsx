'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Minus, X, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { formatPrice, cn } from '@/lib/utils'
import type { Product } from '@/types'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

const FALLBACK_IMAGES: Record<string, string> = {
  Salchipapas: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=600&h=400&fit=crop&q=80',
  Empanadas:   'https://images.unsplash.com/photo-1604467794349-0b74285de7e7?w=600&h=400&fit=crop&q=80',
  Bebidas:     'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&h=400&fit=crop&q=80',
  Extras:      'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=600&h=400&fit=crop&q=80',
}
const DEFAULT_IMG = 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&h=400&fit=crop&q=80'

function getImage(p: Product) {
  return p.imageUrl || FALLBACK_IMAGES[p.category?.name ?? ''] || DEFAULT_IMG
}

function DeliveryBadge({ date }: { date: string }) {
  const d = new Date(date)
  const weekday = d.toLocaleDateString('es-CR', { weekday: 'long' })
  const day = d.toLocaleDateString('es-CR', { day: 'numeric', month: 'long' })
  return (
    <span className="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 whitespace-nowrap">
      Para {weekday} {day}
    </span>
  )
}

// ── Modal idéntico al del menú ────────────────────────────────────────────────
function ProductModal({ product, allProducts, onClose }: {
  product: Product; allProducts: Product[]; onClose: () => void
}) {
  const { add, addExtraToInstance, removeExtraFromInstance, items, updateQty } = useCart()
  const [detail, setDetail] = useState<Product | null>(null)
  const [selectedInstance, setSelectedInstance] = useState(0)

  useEffect(() => {
    fetch(`${API}/products/${product.id}`).then((r) => r.json()).then(setDetail)
  }, [product.id])

  const cartItem = items.find((i) => i.product.id === product.id)
  const qty = cartItem?.quantity || 0
  useEffect(() => { setSelectedInstance(0) }, [qty])

  const extras: Product[] = (detail?.extras ?? []).map((e: any) => e.extra)
  const drinks = allProducts.filter((p) => p.category?.name === 'Bebidas' && p.id !== product.id && p.active)
  const others = allProducts.filter((p) => p.category?.name === product.category?.name && p.id !== product.id && p.active)
  const recommendations = [...drinks, ...others].slice(0, 4)
  const currentInstance = cartItem?.instances[selectedInstance]

  return (
    <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl z-10 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        <div className="relative h-52 shrink-0">
          <Image src={getImage(product)} alt={product.name} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <motion.button onClick={onClose} whileTap={{ scale: 0.9 }}
            className="absolute top-4 right-4 w-9 h-9 bg-black/30 backdrop-blur-sm text-white rounded-full flex items-center justify-center">
            <X size={18} />
          </motion.button>
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2">
            <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/30">
              {product.category?.name}
            </span>
            {product.deliveryDate && <DeliveryBadge date={product.deliveryDate} />}
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="p-6">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">{product.name}</h2>
              <span className="text-2xl font-bold text-brand-600 shrink-0">{formatPrice(product.price)}</span>
            </div>
            <p className="text-gray-500 leading-relaxed mb-5">{product.description || 'Sin descripción disponible.'}</p>

            {extras.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Extras disponibles</p>
                  {qty > 1 && (
                    <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                      {cartItem!.instances.map((_, idx) => (
                        <button key={idx} onClick={() => setSelectedInstance(idx)}
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${selectedInstance === idx ? 'bg-brand-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}>
                          {idx + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {qty > 1 && <p className="text-xs text-gray-400 mb-2">Extras para {product.name} {selectedInstance + 1} de {qty}</p>}
                <div className="space-y-2">
                  {extras.map((extra) => {
                    const extraQty = currentInstance?.extras.find((e) => e.product.id === extra.id)?.quantity || 0
                    return (
                      <div key={extra.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                        <div>
                          <p className="font-semibold text-sm text-gray-800">{extra.name}</p>
                          <p className="text-brand-600 text-sm font-bold">+{formatPrice(extra.price)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {extraQty > 0 && (
                            <>
                              <motion.button whileTap={{ scale: 0.85 }}
                                onClick={() => removeExtraFromInstance(product.id, selectedInstance, extra.id)}
                                className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center">
                                <Minus size={12} />
                              </motion.button>
                              <motion.span key={extraQty} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="w-5 text-center font-bold text-sm">
                                {extraQty}
                              </motion.span>
                            </>
                          )}
                          <motion.button whileTap={{ scale: 0.85 }}
                            onClick={() => { if (!cartItem) add(product); addExtraToInstance(product.id, selectedInstance, extra) }}
                            className="w-7 h-7 bg-brand-500 text-white rounded-full flex items-center justify-center">
                            <Plus size={12} />
                          </motion.button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              {qty === 0 ? (
                <motion.button key="add" onClick={() => add(product)}
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} whileTap={{ scale: 0.97 }}>
                  <Plus size={18} /> Agregar al pedido
                </motion.button>
              ) : (
                <motion.div key="controls" className="flex items-center gap-4"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <div className="flex items-center gap-3 bg-gray-100 rounded-2xl p-1.5">
                    <motion.button whileTap={{ scale: 0.85 }} onClick={() => updateQty(product.id, qty - 1)}
                      className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <Minus size={16} />
                    </motion.button>
                    <motion.span key={qty} initial={{ scale: 1.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-8 text-center font-bold text-lg">
                      {qty}
                    </motion.span>
                    <motion.button whileTap={{ scale: 0.85 }} onClick={() => updateQty(product.id, qty + 1)}
                      className="w-10 h-10 bg-brand-500 text-white rounded-xl flex items-center justify-center">
                      <Plus size={16} />
                    </motion.button>
                  </div>
                  <a href="/carrito" className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3.5 rounded-2xl text-center text-sm">
                    Ver carrito · {formatPrice(product.price * qty)}
                  </a>
                </motion.div>
              )}
            </AnimatePresence>

            {recommendations.length > 0 && (
              <div className="mt-6 pt-5 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={14} className="text-brand-500" />
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Te recomendamos también</p>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
                  {recommendations.map((rec) => {
                    const recQty = items.find((i) => i.product.id === rec.id)?.quantity || 0
                    return (
                      <div key={rec.id} className="shrink-0 w-36 bg-gray-50 rounded-2xl overflow-hidden">
                        <div className="relative h-24">
                          <Image src={getImage(rec)} alt={rec.name} fill className="object-cover" />
                        </div>
                        <div className="p-2.5">
                          <p className="text-xs font-semibold text-gray-800 leading-tight line-clamp-2">{rec.name}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs font-bold text-brand-600">{formatPrice(rec.price)}</span>
                            <motion.button whileTap={{ scale: 0.85 }} onClick={() => add(rec)}
                              className="w-6 h-6 bg-brand-500 text-white rounded-full flex items-center justify-center">
                              {recQty > 0 ? <span className="text-xs font-bold">{recQty}</span> : <Plus size={12} />}
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Carrusel con snap + dots igual que el tracker ─────────────────────────────
export function UpcomingCarousel({ initialProducts }: { initialProducts: Product[] }) {
  const { add, items } = useCart()
  const [products] = useState<Product[]>(initialProducts)
  const [selected, setSelected] = useState<Product | null>(null)
  const [current, setCurrent] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  function goTo(idx: number) {
    const next = Math.max(0, Math.min(idx, products.length - 1))
    setCurrent(next)
    const el = scrollRef.current
    if (!el) return
    const card = el.children[next] as HTMLElement
    card?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }

  if (products.length === 0) return null

  return (
    <>
      <div className="flex flex-col gap-4 overflow-hidden">
        {/* Track — cada card ocupa el 100% del ancho visible */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory gap-5 pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onScroll={(e) => {
            const el = e.currentTarget
            let closest = 0
            let minDist = Infinity
            Array.from(el.children).forEach((child, i) => {
              const card = child as HTMLElement
              const dist = Math.abs(card.offsetLeft - el.scrollLeft - el.offsetWidth / 2 + card.offsetWidth / 2)
              if (dist < minDist) { minDist = dist; closest = i }
            })
            setCurrent(closest)
          }}
        >
          {products.map((product) => {
            const qty = items.find((it) => it.product.id === product.id)?.quantity || 0
            return (
              <div
                key={product.id}
                className="shrink-0 w-full snap-center bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden cursor-pointer"
                onClick={() => setSelected(product)}
              >
                {/* Imagen */}
                <div className="relative h-44 overflow-hidden">
                  <Image src={getImage(product)} alt={product.name} fill className="object-cover hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                    <span className="bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-600 px-2.5 py-1 rounded-full">
                      {product.category?.name}
                    </span>
                    {product.deliveryDate && <DeliveryBadge date={product.deliveryDate} />}
                  </div>
                </div>
                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 leading-tight">{product.name}</h3>
                  {product.description && (
                    <p className="text-gray-400 text-xs mt-1 leading-relaxed line-clamp-2">{product.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-brand-600 font-bold text-lg">{formatPrice(product.price)}</span>
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={(e) => { e.stopPropagation(); add(product) }}
                      className="w-9 h-9 bg-brand-500 hover:bg-brand-600 text-white rounded-full flex items-center justify-center shadow-sm"
                    >
                      {qty > 0 ? <span className="text-xs font-bold">{qty}</span> : <Plus size={18} />}
                    </motion.button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Dots + flechas — solo si hay más de 1 */}
        {products.length > 1 && (
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => goTo(current - 1)} disabled={current === 0}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 disabled:opacity-30 hover:bg-gray-50 transition-colors">
              <ChevronLeft size={15} />
            </button>
            <div className="flex gap-1.5">
              {products.map((_, i) => (
                <button key={i} onClick={() => goTo(i)}
                  className={cn('h-2 rounded-full transition-all', i === current ? 'bg-brand-500 w-4' : 'bg-gray-300 w-2')} />
              ))}
            </div>
            <button onClick={() => goTo(current + 1)} disabled={current === products.length - 1}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 disabled:opacity-30 hover:bg-gray-50 transition-colors">
              <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <ProductModal product={selected} allProducts={products} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </>
  )
}
