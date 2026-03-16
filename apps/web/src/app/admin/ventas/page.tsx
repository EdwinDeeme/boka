'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import { ShoppingBag, TrendingUp, DollarSign, Award } from 'lucide-react'
import type { SalesReport } from '@/types'

export default function SalesPage() {
  const [sales, setSales] = useState<SalesReport | null>(null)

  useEffect(() => {
    api.get<SalesReport>('/sales/today').then(setSales).catch(() => {})
  }, [])

  if (!sales) return <div className="p-8 text-gray-400">Cargando...</div>

  const stats = [
    {
      label: 'Pedidos hoy',
      value: sales.totalOrders.toString(),
      icon: ShoppingBag,
      color: 'bg-blue-50 text-blue-600',
      trend: null,
    },
    {
      label: 'Ingresos hoy',
      value: formatPrice(sales.totalRevenue),
      icon: DollarSign,
      color: 'bg-green-50 text-green-600',
      trend: null,
    },
    {
      label: 'Ticket promedio',
      value: sales.totalOrders > 0 ? formatPrice(Math.round(sales.totalRevenue / sales.totalOrders)) : '₡0',
      icon: TrendingUp,
      color: 'bg-purple-50 text-purple-600',
      trend: null,
    },
    {
      label: 'Más vendido',
      value: sales.topProduct?.name || '—',
      sub: sales.topProduct ? `${sales.topProduct.count} unidades` : undefined,
      icon: Award,
      color: 'bg-orange-50 text-orange-600',
      trend: null,
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Ventas</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {new Date(sales.date + 'T12:00:00').toLocaleDateString('es-CR', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color}`}>
              <Icon size={22} />
            </div>
            <p className="text-gray-500 text-sm mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
            {sub && <p className="text-gray-400 text-xs mt-1">{sub}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
