'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import { ShoppingBag, TrendingUp, DollarSign, Award, Eye, EyeOff } from 'lucide-react'
import type { SalesReport } from '@/types'

const COOKIE_KEY = 'show_order_count'

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  return document.cookie.split('; ').find((r) => r.startsWith(name + '='))?.split('=')[1]
}

function setCookie(name: string, value: string) {
  // 1 year, accessible to server (no httpOnly)
  document.cookie = `${name}=${value}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
}

export default function SalesPage() {
  const [sales, setSales] = useState<SalesReport | null>(null)
  const [showCount, setShowCount] = useState(false)

  useEffect(() => {
    api.get<SalesReport>('/sales/today').then(setSales).catch(() => {})
    setShowCount(getCookie(COOKIE_KEY) === 'true')
  }, [])

  function toggleShowCount() {
    const next = !showCount
    setShowCount(next)
    setCookie(COOKIE_KEY, next ? 'true' : 'false')
  }

  if (!sales) return <div className="p-6 text-gray-400">Cargando...</div>

  const stats = [
    {
      label: 'Pedidos hoy',
      value: sales.totalOrders.toString(),
      icon: ShoppingBag,
      color: 'bg-blue-50 text-blue-600',
      extra: (
        <button
          onClick={toggleShowCount}
          className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-gray-700 transition-colors"
          title={showCount ? 'Ocultar en inicio' : 'Mostrar en inicio'}
        >
          {showCount ? <Eye size={13} className="text-brand-500" /> : <EyeOff size={13} />}
          <span>{showCount ? 'Visible en inicio' : 'Oculto en inicio'}</span>
        </button>
      ),
    },
    {
      label: 'Ingresos hoy',
      value: formatPrice(sales.totalRevenue),
      icon: DollarSign,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Ticket promedio',
      value: sales.totalOrders > 0 ? formatPrice(Math.round(sales.totalRevenue / sales.totalOrders)) : '₡0',
      icon: TrendingUp,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Más vendido',
      value: sales.topProduct?.name || '—',
      sub: sales.topProduct ? `${sales.topProduct.count} unidades` : undefined,
      icon: Award,
      color: 'bg-orange-50 text-orange-600',
    },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-full overflow-x-hidden">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Ventas</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {new Date(sales.date + 'T12:00:00').toLocaleDateString('es-CR', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })}
        </p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {stats.map(({ label, value, sub, icon: Icon, color, extra }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-card p-4 sm:p-5 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 shrink-0 ${color}`}>
              <Icon size={20} />
            </div>
            <p className="text-gray-500 text-xs sm:text-sm mb-1 truncate">{label}</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-900 leading-tight break-words min-w-0 line-clamp-2">{value}</p>
            {sub && <p className="text-gray-400 text-xs mt-1">{sub}</p>}
            {extra}
          </div>
        ))}
      </div>
    </div>
  )
}
