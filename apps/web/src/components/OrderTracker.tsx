'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Phone, Search, Package, Clock, CheckCircle, Truck, Store, RefreshCw, RotateCcw, ChevronLeft, ChevronRight, Bell } from 'lucide-react'
import { formatPrice, cn } from '@/lib/utils'
import { useCart } from '@/context/CartContext'
import type { Order, OrderStatus } from '@/types'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; border: string; icon: React.ReactNode; step: number }> = {
  NUEVO:      { label: 'Recibido',   color: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200',  icon: <Clock size={14} />,       step: 0 },
  ACEPTADO:   { label: 'Aceptado',   color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200',   icon: <CheckCircle size={14} />, step: 1 },
  PREPARANDO: { label: 'Preparando', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', icon: <Package size={14} />,     step: 2 },
  LISTO:      { label: 'Listo',      color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200',  icon: <CheckCircle size={14} />, step: 3 },
  ENVIANDO:   { label: 'En camino',  color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', icon: <Truck size={14} />,       step: 4 },
  ENTREGADO:  { label: 'Entregado',  color: 'text-gray-500',   bg: 'bg-gray-100',  border: 'border-gray-200',   icon: <CheckCircle size={14} />, step: 5 },
  CANCELADO:  { label: 'Cancelado',  color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200',    icon: <X size={14} />,           step: -1 },
}

const STEPS: OrderStatus[] = ['NUEVO', 'ACEPTADO', 'PREPARANDO', 'LISTO', 'ENVIANDO', 'ENTREGADO']

const ESTIMATED: Partial<Record<OrderStatus, string>> = {
  NUEVO:      'Esperando confirmación...',
  ACEPTADO:   'Listo en ~20 min',
  PREPARANDO: 'Listo en ~15 min',
  LISTO:      'Tu pedido está listo 🎉',
  ENVIANDO:   'En camino a tu dirección 🛵',
  ENTREGADO:  '¡Pedido entregado!',
  CANCELADO:  'Pedido cancelado',
}

function OrderCard({ order, onRepeat }: { order: Order; onRepeat: (o: Order) => void }) {
  const cfg = STATUS_CONFIG[order.status]
  const isEnvio = order.deliveryType === 'ENVIO'
  const currentStep = cfg.step
  const isActive = order.status !== 'ENTREGADO' && order.status !== 'CANCELADO'

  return (
    <div className={cn('border-2 rounded-2xl overflow-hidden bg-white flex-shrink-0 w-full snap-center', cfg.border)}>
      {/* Status banner */}
      <div className={cn('px-4 py-3 flex items-center justify-between', cfg.bg)}>
        <div className="flex items-center gap-2">
          <span className="font-black text-gray-900">#{order.id}</span>
          <span className={cn('flex items-center gap-1.5 text-sm font-bold', cfg.color)}>
            {cfg.icon} {cfg.label}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          {isEnvio ? <Truck size={11} /> : <Store size={11} />}
          {isEnvio ? 'Express' : 'Para recoger'}
        </div>
      </div>

      {/* Estimated */}
      {ESTIMATED[order.status] && (
        <div className="px-4 pt-3 pb-1">
          <p className={cn('text-sm font-semibold', isActive ? 'text-brand-600' : 'text-gray-500')}>
            {ESTIMATED[order.status]}
          </p>
        </div>
      )}

      {/* Progress bar */}
      {order.status !== 'CANCELADO' && (
        <div className="px-4 pt-2 pb-1">
          <div className="flex items-center">
            {STEPS.map((s, i) => {
              const done = i <= currentStep
              const active = i === currentStep
              return (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                  <div className={cn('w-2.5 h-2.5 rounded-full shrink-0 transition-all duration-500',
                    done ? (active ? 'bg-brand-500 ring-2 ring-brand-200 scale-125' : 'bg-brand-400') : 'bg-gray-200')} />
                  {i < STEPS.length - 1 && (
                    <div className={cn('h-0.5 flex-1 mx-0.5 transition-colors duration-500', i < currentStep ? 'bg-brand-400' : 'bg-gray-200')} />
                  )}
                </div>
              )
            })}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-400">Recibido</span>
            <span className="text-xs text-gray-400">Entregado</span>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="px-4 py-3 space-y-1 border-t border-gray-100">
        {order.items.map((item) => (
          <div key={item.id}>
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">{item.product.name} <span className="text-gray-400">× {item.quantity}</span></span>
              <span className="font-medium text-gray-900">{formatPrice(item.price * item.quantity)}</span>
            </div>
            {(item.extras || []).length > 0 && (
              <div className="ml-3 mt-0.5 space-y-0.5">
                {item.extras.map((e) => (
                  <div key={e.id} className="flex justify-between text-xs text-gray-400">
                    <span>+ {e.product.name} × {e.quantity}</span>
                    <span>{formatPrice(e.price * e.quantity)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        <div className="flex justify-between pt-2 border-t border-gray-100 mt-1">
          <span className="text-sm font-semibold text-gray-600">Total</span>
          <span className="font-bold text-brand-600">{formatPrice(order.total)}</span>
        </div>
      </div>

      {(order.status === 'ENTREGADO' || order.status === 'CANCELADO') && (
        <div className="px-4 pb-3">
          <button onClick={() => onRepeat(order)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-brand-200 text-brand-600 text-sm font-semibold hover:bg-brand-50 transition-colors">
            <RotateCcw size={14} /> Repetir este pedido
          </button>
        </div>
      )}
    </div>
  )
}

type Props = { open: boolean; onClose: () => void; defaultPhone?: string }

export function OrderTracker({ open, onClose, defaultPhone }: Props) {
  const { add } = useCart()
  const [phone, setPhone] = useState(defaultPhone || '')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [current, setCurrent] = useState(0)
  const [readyOrderId, setReadyOrderId] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const phoneRef = useRef(phone)

  useEffect(() => { phoneRef.current = phone }, [phone])

  const fetchOrders = useCallback(async (q: string, silent = false) => {
    if (!q.trim()) return
    if (!silent) setLoading(true)
    try {
      const res = await fetch(`${API}/orders/by-phone/${encodeURIComponent(q.trim())}`)
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
      setLastRefresh(new Date())
      setCurrent(0)
    } catch {
      if (!silent) setOrders([])
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open && defaultPhone && !searched) { setSearched(true); fetchOrders(defaultPhone) }
  }, [open, defaultPhone, searched, fetchOrders])

  useEffect(() => {
    if (!open || !searched || !phone.trim()) return
    const id = setInterval(() => fetchOrders(phone, true), 30_000)
    return () => clearInterval(id)
  }, [open, searched, phone, fetchOrders])

  // Escuchar evento order_ready del servidor
  useEffect(() => {
    if (!open) return
    let socket: import('socket.io-client').Socket
    import('socket.io-client').then(({ io }) => {
      socket = io(`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001'}/orders`)
      socket.on('order_ready', ({ orderId, phone: orderPhone }: { orderId: number; phone: string }) => {
        // Solo notificar si el teléfono coincide con el que está buscando este cliente
        const currentPhone = phoneRef.current.trim().replace(/[-\s]/g, '')
        const incomingPhone = orderPhone.trim().replace(/[-\s]/g, '')
        if (currentPhone && currentPhone === incomingPhone) {
          setReadyOrderId(orderId)
          fetchOrders(phoneRef.current, true)
          // Notificación del navegador si tiene permiso
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('🎉 ¡Tu pedido está listo!', {
              body: `Pedido #${orderId} listo para recoger.`,
              icon: '/boka-logo.png',
              tag: `ready-${orderId}`,
            })
          }
        }
      })
      socket.on('order_updated', (updated: Order) => {
        setOrders((prev) => prev.map((o) => o.id === updated.id ? updated : o))
      })
    })
    return () => { socket?.disconnect() }
  }, [open, fetchOrders])

  function handleSearch() { setSearched(true); fetchOrders(phone) }

  function handleRepeat(order: Order) {
    order.items.forEach((item) => { for (let i = 0; i < item.quantity; i++) add(item.product) })
    onClose()
  }

  function goTo(idx: number) {
    const next = Math.max(0, Math.min(idx, orders.length - 1))
    setCurrent(next)
    scrollRef.current?.children[next]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }

  const activeOrders = orders.filter((o) => o.status !== 'ENTREGADO' && o.status !== 'CANCELADO')

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <motion.div
            className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl z-10 max-h-[88vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2">
                <div>
                  <h2 className="font-bold text-gray-900">Mis pedidos</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Busca por tu número de teléfono</p>
                </div>
                {activeOrders.length > 0 && (
                  <span className="flex items-center gap-1 bg-brand-50 text-brand-600 text-xs font-bold px-2 py-1 rounded-full border border-brand-200">
                    <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />
                    {activeOrders.length} activo{activeOrders.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {searched && (
                  <button onClick={() => fetchOrders(phone)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400">
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                  </button>
                )}
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                  <X size={17} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="px-5 py-4 border-b border-gray-100 shrink-0">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="Ej: 8888-8888"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent" />
                </div>
                <button onClick={handleSearch} disabled={loading || !phone.trim()}
                  className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shrink-0">
                  <Search size={14} /> Buscar
                </button>
              </div>
              {lastRefresh && (
                <p className="text-xs text-gray-400 mt-2">
                  Actualizado {lastRefresh.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })} · cada 30s
                </p>
              )}
            </div>

            {/* Banner pedido listo */}
            <AnimatePresence>
              {readyOrderId && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="mx-5 mb-2 bg-green-50 border-2 border-green-300 rounded-2xl px-4 py-3 flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                    <Bell size={18} className="text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-green-800">🎉 ¡Tu pedido #{readyOrderId} está listo!</p>
                    <p className="text-xs text-green-600">Pasa a recogerlo cuando quieras.</p>
                  </div>
                  <button onClick={() => setReadyOrderId(null)}
                    className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-green-100 transition-colors shrink-0">
                    <X size={13} className="text-green-600" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Carousel / Results */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              {loading && (
                <div className="p-5 space-y-3">
                  {[1,2].map((i) => <div key={i} className="h-36 bg-gray-100 rounded-2xl animate-pulse" />)}
                </div>
              )}

              {!loading && searched && orders.length === 0 && (
                <div className="text-center py-12 text-gray-400 px-5">
                  <Package size={40} className="mx-auto mb-3 opacity-30" strokeWidth={1.5} />
                  <p className="font-medium text-gray-500">No encontramos pedidos</p>
                  <p className="text-sm mt-1">Verifica que el número sea el mismo que usaste al pedir.</p>
                </div>
              )}

              {!loading && !searched && (
                <div className="text-center py-12 text-gray-400 px-5">
                  <Search size={40} className="mx-auto mb-3 opacity-30" strokeWidth={1.5} />
                  <p className="text-sm">Ingresa tu número para ver el estado de tus pedidos.</p>
                </div>
              )}

              {!loading && orders.length > 0 && (
                <div className="flex flex-col flex-1 min-h-0">
                  {/* Carousel track */}
                  <div ref={scrollRef}
                    className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-5 py-4 flex-1 overflow-y-auto"
                    style={{ scrollbarWidth: 'none' }}
                    onScroll={(e) => {
                      const el = e.currentTarget
                      const idx = Math.round(el.scrollLeft / el.offsetWidth)
                      setCurrent(idx)
                    }}
                  >
                    {orders.map((order) => (
                      <OrderCard key={order.id} order={order} onRepeat={handleRepeat} />
                    ))}
                  </div>

                  {/* Pagination controls */}
                  {orders.length > 1 && (
                    <div className="flex items-center justify-center gap-3 pb-4 shrink-0">
                      <button onClick={() => goTo(current - 1)} disabled={current === 0}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 disabled:opacity-30 hover:bg-gray-50 transition-colors">
                        <ChevronLeft size={15} />
                      </button>
                      <div className="flex gap-1.5">
                        {orders.map((_, i) => (
                          <button key={i} onClick={() => goTo(i)}
                            className={cn('w-2 h-2 rounded-full transition-all', i === current ? 'bg-brand-500 w-4' : 'bg-gray-300')} />
                        ))}
                      </div>
                      <button onClick={() => goTo(current + 1)} disabled={current === orders.length - 1}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 disabled:opacity-30 hover:bg-gray-50 transition-colors">
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
