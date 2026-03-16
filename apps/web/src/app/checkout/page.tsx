'use client'
import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CheckCircle, Store, Truck, Banknote, Smartphone, ChevronRight, Copy, Check, MapPin } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { api } from '@/lib/api'
import { formatPrice, cn } from '@/lib/utils'
import { DISTRITOS } from '@/lib/perezZeledon'
import { SearchableSelect } from '@/components/SearchableSelect'
import type { LatLng } from '@/components/LocationPicker'

// Dynamic import — Leaflet needs browser APIs
const LocationPicker = dynamic(() => import('@/components/LocationPickerDynamic'), {
  ssr: false,
  loading: () => <div className="h-[280px] rounded-2xl bg-gray-100 animate-pulse" />,
})

const SINPE_NUMBER = '7207 4577'
const BILL_OPTIONS = [5000, 10000, 20000, 50000]

type FormData = {
  customerName: string
  phone: string
  distrito: string
  barrio: string
  address: string
  deliveryType: 'PICKUP' | 'ENVIO'
  paymentMethod: 'EFECTIVO' | 'SINPE'
  sinpeVoucher: string
  sinpeName: string
  sinpePhone: string
  billAmount: string
}

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

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.3, ease: 'easeOut' } }),
}

export default function CheckoutPage() {
  const { items, total, clear } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [orderId, setOrderId] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const [coords, setCoords] = useState<LatLng | null>(null)
  const [form, setForm] = useState<FormData>({
    customerName: '', phone: '',
    distrito: '', barrio: '', address: '',
    deliveryType: 'PICKUP', paymentMethod: 'EFECTIVO',
    sinpeVoucher: '', sinpeName: '', sinpePhone: '',
    billAmount: '',
  })

  const set = (field: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const selectedDistrito = useMemo(
    () => DISTRITOS.find((d) => d.name === form.distrito) ?? null,
    [form.distrito],
  )
  const deliveryFee = form.deliveryType === 'ENVIO' && selectedDistrito ? selectedDistrito.deliveryFee : 0
  const grandTotal = total + deliveryFee

  function copyNumber() {
    navigator.clipboard.writeText(SINPE_NUMBER.replace(' ', ''))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const billNum = parseInt(form.billAmount) || 0
  const change = billNum > grandTotal ? billNum - grandTotal : 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (items.length === 0) return
    setLoading(true); setError('')
    try {
      const fullAddress = form.deliveryType === 'ENVIO'
        ? `${form.distrito}, ${form.barrio} — ${form.address}${coords ? ` [${coords.lat.toFixed(6)},${coords.lng.toFixed(6)}]` : ''}`
        : ''
      const order = await api.post<{ id: number }>('/orders', {
        customerName: form.customerName,
        phone: form.phone,
        address: fullAddress,
        deliveryType: form.deliveryType,
        paymentMethod: form.paymentMethod,
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
      })
      setOrderId(order.id)
      // Save phone so the tracker can auto-search next time
      try { localStorage.setItem('ffcr_phone', form.phone) } catch {}
      clear()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al procesar el pedido')
    } finally {
      setLoading(false)
    }
  }

  if (orderId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-100">
          <div className="max-w-2xl mx-auto px-6 h-16 flex items-center">
            <img src="/boka-logo.png" alt="BOKA" className="h-8 w-auto" />
          </div>
        </header>
        <div className="max-w-2xl mx-auto px-6 py-8">
          <Stepper current={2} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-card p-10 text-center"
          >
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', damping: 15, stiffness: 200 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle size={40} className="text-green-500" />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Pedido confirmado</h1>
              <p className="text-gray-500 mb-1">Tu pedido <span className="font-semibold text-gray-700">#{orderId}</span> fue recibido.</p>
              <p className="text-gray-400 text-sm mb-8">Te contactaremos pronto para coordinar la entrega.</p>
              <div className="flex flex-col gap-3">
                <Link href="/menu" className="inline-block bg-brand-500 hover:bg-brand-600 text-white px-8 py-3 rounded-full font-semibold transition-colors">
                  Hacer otro pedido
                </Link>
                <Link href="/menu?tracker=1" className="inline-flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-300 text-gray-600 px-8 py-3 rounded-full font-semibold transition-colors text-sm">
                  Ver estado del pedido
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/carrito" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} className="text-gray-700" />
          </Link>
          <h1 className="font-bold text-gray-900 flex-1">Checkout</h1>
          <Link
            href="/menu"
            className="text-sm font-semibold text-brand-500 hover:text-brand-600 transition-colors"
          >
            Volver al menú
          </Link>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-6 py-8 pb-36 space-y-4">
        <Stepper current={1} />

        {/* Datos de contacto */}
        <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible"
          className="bg-white rounded-2xl border border-gray-100 shadow-card p-5"
        >
          <h2 className="font-semibold text-gray-900 mb-4">Datos de contacto</h2>
          <div className="space-y-3">
            {([
              { label: 'Nombre completo', field: 'customerName', placeholder: 'Tu nombre', type: 'text' },
              { label: 'Teléfono', field: 'phone', placeholder: '8888-8888', type: 'tel' },
            ] as const).map(({ label, field, placeholder, type }) => (
              <div key={field}>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
                <input
                  required type={type}
                  value={form[field]}
                  onChange={(e) => set(field, e.target.value)}
                  placeholder={placeholder}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all"
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tipo de entrega */}
        <motion.div custom={1} variants={sectionVariants} initial="hidden" animate="visible"
          className="bg-white rounded-2xl border border-gray-100 shadow-card p-5"
        >
          <h2 className="font-semibold text-gray-900 mb-4">Tipo de entrega</h2>
          <div className="grid grid-cols-2 gap-3">
            {([
              { value: 'PICKUP', label: 'Pickup',  sub: 'Recoger en local', icon: Store },
              { value: 'ENVIO',  label: 'Envío',   sub: 'A domicilio',      icon: Truck },
            ] as const).map(({ value, label, sub, icon: Icon }) => (
              <motion.button key={value} type="button" whileTap={{ scale: 0.97 }}
                onClick={() => set('deliveryType', value)}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all',
                  form.deliveryType === value ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                  form.deliveryType === value ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-500')}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className={cn('font-semibold text-sm', form.deliveryType === value ? 'text-brand-700' : 'text-gray-800')}>{label}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
              </motion.button>
            ))}
          </div>

          <AnimatePresence>
            {form.deliveryType === 'ENVIO' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}
                style={{ overflow: 'clip' }}
              >
                <div className="mt-4 space-y-4 px-px pb-px">

                  {/* Distrito */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Distrito</label>
                    <SearchableSelect
                      required
                      value={form.distrito}
                      onChange={(v) => { set('distrito', v); set('barrio', '') }}
                      placeholder="Seleccionar distrito"
                      icon={<MapPin size={15} />}
                      options={DISTRITOS.map((d) => ({
                        value: d.name,
                        label: `${d.name} — envío ${formatPrice(d.deliveryFee)}`,
                      }))}
                    />
                  </div>

                  {/* Barrio — texto libre */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Barrio</label>
                    <input
                      required={form.deliveryType === 'ENVIO'}
                      value={form.barrio}
                      onChange={(e) => set('barrio', e.target.value)}
                      placeholder="Ej: Barrio Loma de Cocorí, Barrio Pavones..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Dirección exacta */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Dirección exacta</label>
                    <input
                      required={form.deliveryType === 'ENVIO'}
                      value={form.address}
                      onChange={(e) => set('address', e.target.value)}
                      placeholder="Ej: 100m norte del parque, casa azul"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Mapa */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                      Ubicación en el mapa
                    </label>
                    <LocationPicker
                      value={coords}
                      onChange={(c) => setCoords(c)}
                    />
                  </div>

                  {/* Costo de envío */}
                  <AnimatePresence>
                    {selectedDistrito && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="flex items-center justify-between bg-brand-50 border border-brand-200 rounded-xl px-4 py-3"
                      >
                        <div className="flex items-center gap-2">
                          <Truck size={15} className="text-brand-600" />
                          <span className="text-sm font-semibold text-brand-700">Costo de envío</span>
                        </div>
                        <span className="font-bold text-brand-600">{formatPrice(selectedDistrito.deliveryFee)}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Método de pago */}
        <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="visible"
          className="bg-white rounded-2xl border border-gray-100 shadow-card p-5"
        >
          <h2 className="font-semibold text-gray-900 mb-4">Método de pago</h2>
          <div className="grid grid-cols-2 gap-3">
            {([
              { value: 'EFECTIVO', label: 'Efectivo',    sub: 'Al recibir',    icon: Banknote },
              { value: 'SINPE',    label: 'SINPE Móvil', sub: 'Transferencia', icon: Smartphone },
            ] as const).map(({ value, label, sub, icon: Icon }) => (
              <motion.button key={value} type="button" whileTap={{ scale: 0.97 }}
                onClick={() => set('paymentMethod', value)}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all',
                  form.paymentMethod === value ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                  form.paymentMethod === value ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-500')}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className={cn('font-semibold text-sm', form.paymentMethod === value ? 'text-brand-700' : 'text-gray-800')}>{label}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
              </motion.button>
            ))}
          </div>

          {/* SINPE */}
          <AnimatePresence>
            {form.paymentMethod === 'SINPE' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.28 }}
                style={{ overflow: 'clip' }}
              >
                <div className="mt-4 space-y-4 px-px pb-px">
                  <div className="bg-brand-50 border border-brand-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-brand-700 uppercase tracking-wide mb-1">Realizar SINPE Móvil a</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-brand-600 tracking-widest">{SINPE_NUMBER}</span>
                      <motion.button type="button" whileTap={{ scale: 0.9 }} onClick={copyNumber}
                        className={cn('flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors',
                          copied ? 'bg-green-100 text-green-700' : 'bg-white text-brand-600 border border-brand-200 hover:bg-brand-100'
                        )}
                      >
                        {copied ? <><Check size={13} /> Copiado</> : <><Copy size={13} /> Copiar</>}
                      </motion.button>
                    </div>
                    <p className="text-xs text-brand-600 mt-2">
                      Realiza la transferencia por <span className="font-bold">{formatPrice(grandTotal)}</span> y luego completa los datos abajo.
                    </p>
                  </div>
                  <div className="space-y-3">
                    {([
                      { label: 'Número de comprobante', field: 'sinpeVoucher', placeholder: 'Ej: 123456789', type: 'text' },
                      { label: 'Nombre de quien realiza el SINPE', field: 'sinpeName', placeholder: 'Nombre completo', type: 'text' },
                      { label: 'Número desde el que se realizó', field: 'sinpePhone', placeholder: '8888-8888', type: 'tel' },
                    ] as const).map(({ label, field, placeholder, type }) => (
                      <div key={field}>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
                        <input required type={type} value={form[field]} onChange={(e) => set(field, e.target.value)}
                          placeholder={placeholder}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Efectivo */}
          <AnimatePresence>
            {form.paymentMethod === 'EFECTIVO' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.28 }}
                style={{ overflow: 'clip' }}
              >
                <div className="mt-4 space-y-3 px-px pb-px">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">¿Con cuánto va a pagar?</p>
                  <div className="flex gap-2 flex-wrap">
                    {BILL_OPTIONS.map((bill) => (
                      <motion.button key={bill} type="button" whileTap={{ scale: 0.93 }}
                        onClick={() => set('billAmount', bill.toString())}
                        className={cn('px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all',
                          form.billAmount === bill.toString()
                            ? 'border-brand-500 bg-brand-50 text-brand-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        )}
                      >
                        {formatPrice(bill)}
                      </motion.button>
                    ))}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">O ingresa el monto exacto</label>
                    <input type="number" value={form.billAmount} onChange={(e) => set('billAmount', e.target.value)}
                      placeholder="Monto en colones"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                    />
                  </div>
                  <AnimatePresence>
                    {change > 0 && (
                      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3"
                      >
                        <span className="text-sm font-semibold text-green-700">Vuelto estimado</span>
                        <span className="text-lg font-bold text-green-600">{formatPrice(change)}</span>
                      </motion.div>
                    )}
                    {billNum > 0 && billNum < grandTotal && (
                      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="bg-red-50 border border-red-200 rounded-xl px-4 py-3"
                      >
                        <p className="text-sm text-red-600 font-medium">El monto ingresado es menor al total del pedido.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Resumen */}
        <motion.div custom={3} variants={sectionVariants} initial="hidden" animate="visible"
          className="bg-white rounded-2xl border border-gray-100 shadow-card p-5"
        >
          <h2 className="font-semibold text-gray-900 mb-4">Resumen del pedido</h2>
          <div className="space-y-2 mb-4">
            {items.map((i) => (
              <div key={i.product.id} className="flex justify-between text-sm">
                <span className="text-gray-600">{i.product.name} <span className="text-gray-400">× {i.quantity}</span></span>
                <span className="font-medium text-gray-900">{formatPrice(i.product.price * i.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-3 space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span><span>{formatPrice(total)}</span>
            </div>
            <AnimatePresence>
              {deliveryFee > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="flex justify-between text-sm text-gray-500"
                  style={{ overflow: 'clip' }}
                >
                  <span>Envío a {form.distrito}</span>
                  <span>{formatPrice(deliveryFee)}</span>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <span className="font-semibold text-gray-900">Total a pagar</span>
              <motion.span key={grandTotal} initial={{ scale: 1.1 }} animate={{ scale: 1 }}
                className="text-2xl font-bold text-brand-600"
              >
                {formatPrice(grandTotal)}
              </motion.span>
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Footer fijo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4">
        <div className="max-w-2xl mx-auto">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={loading || items.length === 0}
            className="w-full flex items-center justify-between bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-4 rounded-2xl transition-colors font-semibold"
          >
            <span>{loading ? 'Procesando...' : 'Confirmar pedido'}</span>
            <div className="flex items-center gap-2">
              <span>{formatPrice(grandTotal)}</span>
              <ChevronRight size={18} />
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  )
}
