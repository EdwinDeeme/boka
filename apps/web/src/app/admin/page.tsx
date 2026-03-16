'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import type { Socket } from 'socket.io-client'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '@/lib/api'
import { formatPrice, cn } from '@/lib/utils'
import {
  Clock, ChevronRight, ChevronLeft, Phone, MapPin,
  Package, ExternalLink, Store, Truck, Banknote, Smartphone, Bell,
} from 'lucide-react'
import { useLowStock } from '@/hooks/useLowStock'
import { LowStockBadge } from '@/components/LowStockBadge'
import type { Order, OrderStatus } from '@/types'

const WHATSAPP_NUMBER = '50672074577'

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; text: string; border: string; dot: string }> = {
  NUEVO:      { label: 'Nuevo',      bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-300',  dot: 'bg-amber-400' },
  ACEPTADO:   { label: 'Aceptado',   bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-300',   dot: 'bg-blue-400' },
  PREPARANDO: { label: 'Preparando', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300', dot: 'bg-orange-400' },
  LISTO:      { label: 'Listo',      bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-300',  dot: 'bg-green-400' },
  ENVIANDO:   { label: 'En camino',  bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300', dot: 'bg-purple-400' },
  ENTREGADO:  { label: 'Entregado',  bg: 'bg-gray-100',  text: 'text-gray-500',   border: 'border-gray-200',   dot: 'bg-gray-300' },
  CANCELADO:  { label: 'Cancelado',  bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200',    dot: 'bg-red-400' },
}

const NEXT_STATUS: Partial<Record<OrderStatus, { status: OrderStatus; label: string; color: string }>> = {
  NUEVO:      { status: 'ACEPTADO',   label: 'Aceptar pedido',    color: 'bg-blue-600 hover:bg-blue-700' },
  ACEPTADO:   { status: 'PREPARANDO', label: 'Marcar preparando', color: 'bg-orange-500 hover:bg-orange-600' },
  PREPARANDO: { status: 'LISTO',      label: 'Marcar listo',      color: 'bg-green-600 hover:bg-green-700' },
  ENVIANDO:   { status: 'ENTREGADO',  label: 'Marcar entregado',  color: 'bg-green-600 hover:bg-green-700' },
}

const PREV_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  ACEPTADO:   'NUEVO',
  PREPARANDO: 'ACEPTADO',
  LISTO:      'PREPARANDO',
  ENVIANDO:   'LISTO',
}

const IN_PROGRESS_STATUSES: OrderStatus[] = ['NUEVO', 'ACEPTADO', 'PREPARANDO', 'LISTO', 'ENVIANDO']

const FILTERS: { value: OrderStatus | 'ALL' | 'EN_PROCESO'; label: string; dot?: string }[] = [
  { value: 'ALL',        label: 'Todos' },
  { value: 'EN_PROCESO', label: 'En proceso', dot: 'bg-brand-400' },
  { value: 'NUEVO',      label: 'Nuevos',     dot: 'bg-amber-400' },
  { value: 'ACEPTADO',   label: 'Aceptados',  dot: 'bg-blue-400' },
  { value: 'PREPARANDO', label: 'Preparando', dot: 'bg-orange-400' },
  { value: 'LISTO',      label: 'Listos',     dot: 'bg-green-400' },
  { value: 'ENVIANDO',   label: 'En camino',  dot: 'bg-purple-400' },
  { value: 'ENTREGADO',  label: 'Entregados', dot: 'bg-gray-300' },
]

function timeAgo(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (diff < 60) return `${diff}s`
  if (diff < 3600) return `${Math.floor(diff / 60)}min`
  return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}min`
}

function timeInStatus(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (diff < 60) return `${diff}s en este estado`
  if (diff < 3600) return `${Math.floor(diff / 60)}min en este estado`
  return `${Math.floor(diff / 3600)}h en este estado`
}

function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const times = [0, 0.15, 0.3]
    times.forEach((t) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 880
      osc.type = 'sine'
      gain.gain.setValueAtTime(0.3, ctx.currentTime + t)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.12)
      osc.start(ctx.currentTime + t)
      osc.stop(ctx.currentTime + t + 0.12)
    })
  } catch {}
}

function sendBrowserNotification(order: Order) {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission === 'granted') {
    new Notification(`🛵 Nuevo pedido #${order.id}`, {
      body: `${order.customerName} — ${formatPrice(order.total)} · ${order.deliveryType === 'ENVIO' ? 'Envío' : 'Pickup'}`,
      icon: '/icon-192.png',
      tag: `order-${order.id}`,
    })
  }
}

function extractCoords(address?: string) {
  if (!address) return null
  const m = address.match(/\[(-?\d+\.\d+),(-?\d+\.\d+)\]/)
  return m ? { lat: parseFloat(m[1]), lng: parseFloat(m[2]) } : null
}

function buildWhatsAppUrl(order: Order) {
  const coords = extractCoords(order.address)
  const mapsLink = coords ? `https://maps.google.com/?q=${coords.lat},${coords.lng}` : 'Sin coordenadas'
  const msg = encodeURIComponent(
    `Hola Express 🛵\n\nPedido #${order.id} listo para entregar.\n\nCliente: ${order.customerName}\nTeléfono: ${order.phone}\nDirección: ${order.address?.replace(/\[.*\]/, '').trim() || 'Pickup'}\n\nUbicación: ${mapsLink}\n\nTotal: ₡${order.total.toLocaleString()}`
  )
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`
}

function AdminOrdersContent() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<OrderStatus | 'ALL' | 'EN_PROCESO'>('ALL')
  const { alert } = useLowStock()
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default')
  const isFirstLoad = useRef(true)

  useEffect(() => {
    if ('Notification' in window) {
      setNotifPermission(Notification.permission)
      if (Notification.permission === 'default') {
        Notification.requestPermission().then((p) => setNotifPermission(p))
      }
    }
  }, [])

  const loadOrders = useCallback(async () => {
    setOrders(await api.get<Order[]>('/orders'))
  }, [])

  useEffect(() => {
    loadOrders().then(() => { isFirstLoad.current = false })
    let socket: Socket
    import('socket.io-client').then(({ io }) => {
      socket = io(`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001'}/orders`)
      socket.emit('join_dashboard')
      socket.on('new_order', (o: Order) => {
        setOrders((p) => [o, ...p])
        if (!isFirstLoad.current) {
          playNotificationSound()
          sendBrowserNotification(o)
        }
      })
      socket.on('order_updated', (u: Order) => setOrders((p) => p.map((o) => (o.id === u.id ? u : o))))
    })
    return () => { socket?.disconnect() }
  }, [loadOrders])

  async function updateStatus(id: number, status: OrderStatus) {
    await api.put(`/orders/${id}/status`, { status })
  }

  async function handleEnviando(order: Order) {
    await updateStatus(order.id, 'ENVIANDO')
    window.open(buildWhatsAppUrl(order), '_blank')
  }

  const filtered = filter === 'ALL'
    ? orders
    : filter === 'EN_PROCESO'
      ? orders.filter((o) => IN_PROGRESS_STATUSES.includes(o.status))
      : orders.filter((o) => o.status === filter)
  const newCount = orders.filter((o) => o.status === 'NUEVO').length

  return (
    <div className="p-4 sm:p-5 lg:p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Pedidos</h1>
          <p className="text-gray-400 text-sm">Tiempo real</p>
        </div>
        <div className="flex items-center gap-2">
          {notifPermission !== 'granted' && 'Notification' in window && (
            <button
              onClick={() => Notification.requestPermission().then((p) => setNotifPermission(p))}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Bell size={13} />
              Activar alertas
            </button>
          )}
          <AnimatePresence>
            {newCount > 0 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2 rounded-full text-sm font-bold"
              >
                <span className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse shrink-0" />
                {newCount} nuevo{newCount > 1 ? 's' : ''}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Filtros + alerta stock */}
      <div className="flex items-start gap-2 mb-5">
        <div className="flex gap-2 flex-1 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {FILTERS.map(({ value, label, dot }) => {
            const count = value === 'ALL'
                ? orders.length
                : value === 'EN_PROCESO'
                  ? orders.filter((o) => IN_PROGRESS_STATUSES.includes(o.status)).length
                  : orders.filter((o) => o.status === value).length
            const active = filter === value
            return (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap shrink-0 transition-all',
                  active ? 'bg-gray-900 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                )}
              >
                {dot && <span className={cn('w-2 h-2 rounded-full shrink-0', dot)} />}
                {label}
                <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
                  active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                )}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
        <div className="shrink-0 pt-0.5">
          <LowStockBadge alert={alert} />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence>
          {filtered.map((order) => {
            const cfg = STATUS_CONFIG[order.status]
            const next = NEXT_STATUS[order.status]
            const prevStatus = PREV_STATUS[order.status]
            const coords = extractCoords(order.address)
            const cleanAddress = order.address?.replace(/\[.*\]/, '').trim()
            const isEnvio = order.deliveryType === 'ENVIO'
            const isSinpe = order.paymentMethod === 'SINPE'

            return (
              <motion.div
                key={order.id} layout
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}
                className={cn(
                  'bg-white rounded-2xl border-2 overflow-hidden shadow-sm',
                  cfg.border,
                )}
              >
                {/* ── Header de tarjeta ── */}
                <div className={cn('px-4 py-3 flex items-center justify-between', cfg.bg)}>
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg font-black text-gray-900">#{order.id}</span>
                    <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border', cfg.bg, cfg.text, cfg.border)}>
                      <span className={cn('w-2 h-2 rounded-full shrink-0', cfg.dot)} />
                      {cfg.label}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                      <Clock size={13} />
                      {timeAgo(order.createdAt)}
                    </div>
                    {order.status !== 'ENTREGADO' && order.status !== 'CANCELADO' && (
                      <span className="text-xs text-gray-400">{timeInStatus(order.updatedAt ?? order.createdAt)}</span>
                    )}
                  </div>
                </div>

                {/* ── Badges tipo entrega + pago ── */}
                <div className="px-4 pt-3 pb-2 flex gap-2 flex-wrap">
                  <span className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold border',
                    isEnvio
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  )}>
                    {isEnvio ? <Truck size={14} /> : <Store size={14} />}
                    {isEnvio ? 'Envío' : 'Pickup'}
                  </span>
                  <span className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold border',
                    isSinpe
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  )}>
                    {isSinpe ? <Smartphone size={14} /> : <Banknote size={14} />}
                    {isSinpe ? 'SINPE' : 'Efectivo'}
                  </span>
                </div>

                {/* ── Items del pedido — zona más prominente ── */}
                <div className="px-4 py-3 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Pedido</p>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="bg-brand-100 text-brand-700 text-sm font-black w-7 h-7 rounded-lg flex items-center justify-center shrink-0">
                            {item.quantity}
                          </span>
                          <span className="text-base font-semibold text-gray-900 truncate">{item.product.name}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-500 shrink-0">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-gray-100">
                    <span className="text-sm font-semibold text-gray-500">Total</span>
                    <span className="text-xl font-black text-brand-600">{formatPrice(order.total)}</span>
                  </div>
                </div>

                {/* ── Info cliente ── */}
                <div className="px-4 py-3 border-t border-gray-100 space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Cliente</p>
                  <p className="text-base font-bold text-gray-900">{order.customerName}</p>
                  <a href={`tel:${order.phone}`}
                    className="flex items-center gap-2 text-sm text-brand-600 font-semibold hover:text-brand-700 transition-colors"
                  >
                    <Phone size={14} />
                    {order.phone}
                  </a>
                  {isEnvio && (
                    <div className="space-y-1">
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{cleanAddress || order.address}</span>
                      </div>
                      {coords && (
                        <a
                          href={`https://maps.google.com/?q=${coords.lat},${coords.lng}`}
                          target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors ml-5"
                        >
                          <ExternalLink size={13} />
                          Ver en Google Maps
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* ── Acciones ── */}
                <div className="px-4 py-3 border-t border-gray-100 space-y-2">
                  {/* Botón principal de avance */}
                  {next && order.status !== 'LISTO' && (
                    <button
                      onClick={() => updateStatus(order.id, next.status)}
                      className={cn(
                        'w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-base font-bold text-white transition-colors',
                        next.color
                      )}
                    >
                      {next.label}
                      <ChevronRight size={18} />
                    </button>
                  )}

                  {/* LISTO + ENVIO → Express */}
                  {order.status === 'LISTO' && isEnvio && (
                    <button
                      onClick={() => handleEnviando(order)}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-base font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                    >
                      <Package size={18} />
                      Enviar al Express
                    </button>
                  )}

                  {/* LISTO + PICKUP → Entregado directo */}
                  {order.status === 'LISTO' && !isEnvio && (
                    <button
                      onClick={() => updateStatus(order.id, 'ENTREGADO')}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-base font-bold text-white bg-green-600 hover:bg-green-700 transition-colors"
                    >
                      Marcar entregado
                      <ChevronRight size={18} />
                    </button>
                  )}

                  {/* Fila secundaria: retroceder + cancelar */}
                  {(prevStatus || (order.status !== 'CANCELADO' && order.status !== 'ENTREGADO')) && (
                    <div className="flex gap-2">
                      {prevStatus && (
                        <button
                          onClick={() => updateStatus(order.id, prevStatus)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
                        >
                          <ChevronLeft size={15} />
                          Atrás
                        </button>
                      )}
                      {order.status !== 'CANCELADO' && order.status !== 'ENTREGADO' && (
                        <button
                          onClick={() => updateStatus(order.id, 'CANCELADO')}
                          className="flex-1 flex items-center justify-center py-3 rounded-xl border-2 border-gray-200 text-gray-400 text-sm font-semibold hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-24 text-gray-300">
            <Package size={48} className="mx-auto mb-3" strokeWidth={1} />
            <p className="font-semibold text-gray-400">No hay pedidos</p>
          </div>
        )}
      </div>
    </div>
  )
}

import dynamic from 'next/dynamic'
export default dynamic(() => Promise.resolve(AdminOrdersContent), { ssr: false })
