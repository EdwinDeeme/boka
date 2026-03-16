'use client'
import { useEffect, useState } from 'react'
import { Plus, Save, AlertTriangle } from 'lucide-react'
import { api } from '@/lib/api'
import type { InventoryItem } from '@/types'

export default function InventoryAdminPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [stocks, setStocks] = useState<Record<number, string>>({})
  const [units, setUnits] = useState<Record<number, string>>({})
  const [saved, setSaved] = useState<Record<number, boolean>>({})
  const [newItem, setNewItem] = useState({ name: '', stock: '', unit: '' })

  async function load() {
    const data = await api.get<InventoryItem[]>('/inventory')
    setItems(data)
    const s: Record<number, string> = {}
    const u: Record<number, string> = {}
    data.forEach((i) => { s[i.id] = i.stock.toString(); u[i.id] = i.unit })
    setStocks(s)
    setUnits(u)
  }
  useEffect(() => { load() }, [])

  async function handleUpdateStock(id: number) {
    await api.put(`/inventory/${id}`, { stock: parseFloat(stocks[id]), unit: units[id] })
    setSaved({ ...saved, [id]: true })
    setTimeout(() => setSaved((s) => ({ ...s, [id]: false })), 2000)
    load()
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    await api.post('/inventory', { name: newItem.name, stock: parseFloat(newItem.stock), unit: newItem.unit })
    setNewItem({ name: '', stock: '', unit: '' })
    load()
  }

  const lowStock = items.filter((i) => i.stock < 5)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Inventario</h1>
        <p className="text-gray-500 text-sm mt-0.5">Control de stock de ingredientes</p>
      </div>

      {/* Alerta stock bajo */}
      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 text-sm">Stock bajo</p>
            <p className="text-amber-700 text-sm mt-0.5">
              {lowStock.map((i) => i.name).join(', ')} {lowStock.length === 1 ? 'tiene' : 'tienen'} menos de 5 unidades.
            </p>
          </div>
        </div>
      )}

      {/* Agregar */}
      <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4 text-sm">Agregar ingrediente</h2>
        <div className="flex gap-3 flex-wrap">
          <input
            required
            placeholder="Nombre"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm flex-1 min-w-36 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
          />
          <input
            required
            type="number"
            placeholder="Stock inicial"
            value={newItem.stock}
            onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
          />
          <input
            required
            placeholder="Unidad (kg, unidades...)"
            value={newItem.unit}
            onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-44 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
          />
          <button
            type="submit"
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
          >
            <Plus size={16} /> Agregar
          </button>
        </div>
      </form>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Ingrediente</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Stock actual</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Unidad</th>
              <th className="px-6 py-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map((item) => {
              const isLow = item.stock < 5
              return (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{item.name}</span>
                      {isLow && (
                        <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">Bajo</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      value={stocks[item.id] ?? item.stock}
                      onChange={(e) => setStocks({ ...stocks, [item.id]: e.target.value })}
                      className={`w-28 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-colors ${isLow ? 'border-amber-300 bg-amber-50' : 'border-gray-200'}`}
                    />
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    <input
                      value={units[item.id] ?? item.unit}
                      onChange={(e) => setUnits({ ...units, [item.id]: e.target.value })}
                      className="w-24 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                      placeholder="g, kg, unid..."
                    />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleUpdateStock(item.id)}
                      className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-colors ${
                        saved[item.id]
                          ? 'bg-green-50 text-green-600'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <Save size={14} />
                      {saved[item.id] ? 'Guardado' : 'Guardar'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
