'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { ShoppingCart, Plus, Search, X, Minus, Sparkles, ClipboardList, CalendarDays } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { formatPrice, cn } from '@/lib/utils'
import { CartDrawer } from '@/components/CartDrawer'
import { OrderTracker } from '@/components/OrderTracker'
import type { Product, Category } from '@/types'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

const FALLBACK_IMAGES: Record<string, string> = {
  Salchipapas: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=600&h=400&fit=crop&q=80',
  Empanadas:   'https://images.unsplash.com/photo-1604467794349-0b74285de7e7?w=600&h=400&fit=crop&q=80',
  Bebidas:     'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&h=400&fit=crop&q=80',
  Extras:      'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=600&h=400&fit=crop&q=80',
}
const DEFAULT_IMG = 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&h=400&fit=crop&q=80'

function getImage(product: Product) {
  return product.imageUrl || FALLBACK_IMAGES[product.category?.name] || DEFAULT_IMG
}

function formatDeliveryDate(date: string) {
  return new Date(date).toLocaleDateString('es-CR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function DeliveryBadge({ date, className }: { date: string; className?: string }) {
  const d = new Date(date)
  const weekday = d.toLocaleDateString('es-CR', { weekday: 'long' })
  const dayMonth = d.toLocaleDateString('es-CR', { day: 'numeric', month: 'long' })
  return (
    <span className={cn(
      'inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300',
      className
    )}>
      Para {weekday} {dayMonth}
    </span>
  )
}

// ── Modal de detalle ──────────────────────────────────────────────────────────
function ProductModal({
  product,
  allProducts,
  onClose,
}: {
  product: Product
  allProducts: Product[]
  onClose: () => void
}) {
  const { add, addExtraToInstance, removeExtraFromInstance, items, updateQty } = useCart()
  const [detail, setDetail] = useState<Product | null>(null)
  const [selectedInstance, setSelectedInstance] = useState(0)

  useEffect(() => {
    fetch(`${API}/products/${product.id}`)
      .then((r) => r.json())
      .then(setDetail)
  }, [product.id])

  const cartItem = items.find((i) => i.product.id === product.id)
  const qty = cartItem?.quantity || 0

  // Resetear instancia seleccionada si cambia la cantidad
  useEffect(() => { setSelectedInstance(0) }, [qty])

  const extras: Product[] = (detail?.extras ?? []).map((e: any) => e.extra)

  const drinks = allProducts.filter((p) => p.category?.name === 'Bebidas' && p.id !== product.id && p.active)
  const others = allProducts.filter((p) => p.category?.name === product.category?.name && p.id !== product.id && p.active)
  const recommendations = [...drinks, ...others].slice(0, 4)

  const currentInstance = cartItem?.instances[selectedInstance]

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <motion.div
        className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl z-10 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        {/* Imagen */}
        <div className="relative h-52 shrink-0">
          <Image src={getImage(product)} alt={product.name} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <motion.button
            onClick={onClose}
            whileTap={{ scale: 0.9 }}
            className="absolute top-4 right-4 w-9 h-9 bg-black/30 backdrop-blur-sm text-white rounded-full flex items-center justify-center"
          >
            <X size={18} />
          </motion.button>
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/30">
              {product.category?.name}
            </span>
            {product.deliveryDate && (
              <DeliveryBadge date={product.deliveryDate} />
            )}
          </div>
        </div>

        {/* Contenido scrollable */}
        <div className="overflow-y-auto flex-1">
          <div className="p-6">
            {/* Nombre y precio */}
            <div className="flex items-start justify-between gap-4 mb-2">
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">{product.name}</h2>
              <span className="text-2xl font-bold text-brand-600 shrink-0">{formatPrice(product.price)}</span>
            </div>
            <p className="text-gray-500 leading-relaxed mb-5">
              {product.description || 'Sin descripción disponible.'}
            </p>

            {/* Extras */}
            {extras.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Extras disponibles</p>
                  {qty > 1 && (
                    <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                      {cartItem!.instances.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedInstance(idx)}
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                            selectedInstance === idx
                              ? 'bg-brand-500 text-white shadow-sm'
                              : 'text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {qty > 1 && (
                  <p className="text-xs text-gray-400 mb-2">
                    Extras para {product.name} {selectedInstance + 1} de {qty}
                  </p>
                )}
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
                            onClick={() => {
                              if (!cartItem) add(product)
                              addExtraToInstance(product.id, selectedInstance, extra)
                            }}
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
            )}

            {/* Botón agregar principal */}
            <AnimatePresence mode="wait">
              {qty === 0 ? (
                <motion.button
                  key="add"
                  onClick={() => add(product)}
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Plus size={18} /> Agregar al pedido
                </motion.button>
              ) : (
                <motion.div
                  key="controls"
                  className="flex items-center gap-4"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                >
                  <div className="flex items-center gap-3 bg-gray-100 rounded-2xl p-1.5">
                    <motion.button whileTap={{ scale: 0.85 }}
                      onClick={() => updateQty(product.id, qty - 1)}
                      className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm"
                    >
                      <Minus size={16} />
                    </motion.button>
                    <motion.span key={qty} initial={{ scale: 1.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      className="w-8 text-center font-bold text-lg"
                    >
                      {qty}
                    </motion.span>
                    <motion.button whileTap={{ scale: 0.85 }}
                      onClick={() => updateQty(product.id, qty + 1)}
                      className="w-10 h-10 bg-brand-500 text-white rounded-xl flex items-center justify-center"
                    >
                      <Plus size={16} />
                    </motion.button>
                  </div>
                  <Link
                    href="/carrito"
                    className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3.5 rounded-2xl text-center text-sm"
                  >
                    Ver carrito · {formatPrice(product.price * qty)}
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Recomendaciones */}
            {recommendations.length > 0 && (
              <div className="mt-6 pt-5 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={14} className="text-brand-500" />
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Te recomendamos también
                  </p>
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
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => add(rec)}
                              className="w-6 h-6 bg-brand-500 text-white rounded-full flex items-center justify-center"
                            >
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

// ── Página principal ──────────────────────────────────────────────────────────
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.3, ease: 'easeOut' },
  }),
}

export default function MenuPage() {
  return (
    <Suspense>
      <MenuContent />
    </Suspense>
  )
}

function MenuContent() {
  const { add, count, total } = useCart()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Product | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [trackerOpen, setTrackerOpen] = useState(false)
  const [savedPhone, setSavedPhone] = useState('')

  useEffect(() => {
    try {
      setSavedPhone(localStorage.getItem('ffcr_phone') || '')
    } catch {}
    if (searchParams.get('tracker') === '1') {
      setTrackerOpen(true)
    }
  }, [])

  useEffect(() => {
    Promise.all([
      fetch(`${API}/products?active=true`).then((r) => r.json()),
      fetch(`${API}/categories`).then((r) => r.json()),
    ])
      .then(([prods, cats]) => { setProducts(prods); setCategories(cats) })
      .finally(() => setLoading(false))
  }, [])

  // Excluir "Extras" del menú principal — se muestran dentro de cada producto
  const menuCategories = categories.filter((c) => c.name !== 'Extras')
  const filtered = products.filter((p) => {
    if (p.category?.name === 'Extras') return false
    const matchCat = activeCategory ? p.categoryId === activeCategory : true
    const matchSearch = search ? p.name.toLowerCase().includes(search.toLowerCase()) : true
    return matchCat && matchSearch
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 grid grid-cols-[auto_1fr_auto] items-center gap-4">
          {/* Logo — izquierda */}
          <Link href="/" className="shrink-0">
            <img src="/boka-logo.png" alt="BOKA" className="h-8 w-auto" />
          </Link>

          {/* Search — centro real */}
          <div className="relative hidden sm:block max-w-xs mx-auto w-full">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar producto..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white transition-all"
            />
          </div>
          {/* Placeholder mobile para mantener el grid */}
          <div className="sm:hidden" />

          {/* Botones — derecha */}
          <div className="flex items-center gap-2">
            {/* Mi pedido — desktop */}
            <button
              onClick={() => setTrackerOpen(true)}
              className="hidden sm:flex items-center gap-2 border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-800 px-4 py-2 rounded-full text-sm font-semibold transition-colors"
            >
              <ClipboardList size={15} />
              <span>Mi pedido</span>
            </button>
            {/* Mi pedido — mobile */}
            <button
              onClick={() => setTrackerOpen(true)}
              className="flex sm:hidden items-center justify-center w-9 h-9 border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 transition-colors"
              aria-label="Ver estado del pedido"
            >
              <ClipboardList size={16} />
            </button>

            {/* Carrito — desktop */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative hidden sm:flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors"
            >
              <ShoppingCart size={16} />
              <span>Carrito</span>
              {count > 0 && (
                <motion.span
                  animate={{ scale: [1.3, 1] }}
                  transition={{ duration: 0.2 }}
                  className="bg-white text-brand-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                >
                  {count}
                </motion.span>
              )}
            </button>
            {/* Carrito — mobile */}
            <Link href="/carrito" className="relative flex sm:hidden items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors">
              <ShoppingCart size={16} />
              {count > 0 && (
                <motion.span
                  animate={{ scale: [1.3, 1] }}
                  transition={{ duration: 0.2 }}
                  className="bg-white text-brand-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                >
                  {count}
                </motion.span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <div className={`max-w-6xl mx-auto px-6 py-8 ${count > 0 ? 'pb-28 sm:pb-8' : ''}`}>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Nuestro menú</h1>
          <p className="text-gray-500 mt-1">Toca cualquier producto para ver los detalles</p>
        </motion.div>
        {/* Search mobile */}
        <div className="relative mb-6 sm:hidden">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>

        {/* Categorías — overflow hidden con mask para que no se vea el scroll */}
        <div
          className="flex gap-2 mb-8 overflow-x-auto pb-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {[{ id: null, name: 'Todos' }, ...menuCategories.map((c) => ({ id: c.id, name: c.name }))].map((cat) => (
            <motion.button
              key={cat.id ?? 'all'}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {cat.name}
            </motion.button>
          ))}
        </div>

        {/* Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="h-44 bg-gray-100" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-100 rounded-full w-3/4" />
                  <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                  <div className="h-5 bg-gray-100 rounded-full w-1/3 mt-3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Grid */}
        {!loading && (
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" initial="hidden" animate="visible">
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                custom={i}
                variants={cardVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-card cursor-pointer"
                onClick={() => setSelected(product)}
              >
                <div className="relative h-44 overflow-hidden">
                  <Image src={getImage(product)} alt={product.name} fill className="object-cover transition-transform duration-500" />
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-600 px-2.5 py-1 rounded-full">
                      {product.category?.name}
                    </span>
                    {product.deliveryDate && (
                      <DeliveryBadge date={product.deliveryDate} />
                    )}
                  </div>
                </div>
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
                      aria-label={`Agregar ${product.name}`}
                    >
                      <Plus size={18} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full text-center py-20 text-gray-400">
                <Search size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">No se encontraron productos</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      {/* Barra carrito — mobile only */}
      <AnimatePresence>
        {count > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-2xl z-10 sm:hidden"
          >
            <div className="max-w-6xl mx-auto">
              <Link href="/carrito" className="flex items-center justify-between bg-brand-500 hover:bg-brand-600 text-white px-6 py-4 rounded-2xl transition-colors font-semibold">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">{count}</div>
                  <span>Ver mi pedido</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{formatPrice(total)}</span>
                </div>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal producto */}
      <AnimatePresence>
        {selected && (
          <ProductModal
            product={selected}
            allProducts={products}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>

      {/* Cart drawer — desktop */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Order tracker */}
      <OrderTracker
        open={trackerOpen}
        onClose={() => setTrackerOpen(false)}
        defaultPhone={savedPhone}
      />
    </div>
  )
}
