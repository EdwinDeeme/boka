'use client'
import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Save, AlertTriangle, Check, ChevronDown } from 'lucide-react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { InventoryItem } from '@/types'

const UNIT_OPTIONS = ['kg', 'g', 'lb', 'unidades', 'litros', 'ml', 'porciones', 'bolsas', 'cajas']

function UnitSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-400 transition-all w-full justify-between"
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>{value || 'Unidad'}</span>
        <ChevronDown size={13} className={cn('text-gray-400 transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.13 }}
            className="absolute z-50 top-full mt-1 left-0 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden min-w-[130px]"
          >
            {UNIT_OPTIONS.map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => { onChange(u); setOpen(false) }}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 transition-colors',
                  value === u ? 'text-brand-600 font-semibold' : 'text-gray-700'
                )}
              >
                {u}
                {value === u && <Check size={13} className="text-brand-500" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Toast simple
function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-lg pointer-events-none"
    >
      <Check size={14} className="text-green-400" />
      {message}
    </motion.div>
  )
}

export default function InventoryAdminPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [quantities, setQuantities] = useState<Record<number, string>>({})
  const [units, setUnits] = useState<Record<number, string>>({})
  const [saved, setSaved] = useState<Record<number, boolean>>({})
  const [newItem, setNewItem] = useState({ name: '', stock: '', unit: '' })
  const [toast, setToast] = useState<string | null>(null)

  async function load() {
    const data = await api.get<InventoryItem[]>('/inventory')
    setItems(data)
    const q: Record<number, string> = {}
    const u: Record<number, string> = {}
    data.forEach((i) => { q[i.id] = i.stock.toString(); u[i.id] = i.unit })
    setQuantities(q)
    setUnits(u)
  }
  useEffect(() => { load() }, [])

  async function handleUpdate(id: number) {
    await api.put(`/inventory/${id}`, { stock: parseFloat(quantities[id]), unit: units[id] })
    // Update local state only — no re-fetch to avoid scroll jump
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, stock: parseFloat(quantities[id]), unit: units[id] } : i))
    setSaved({ ...saved, [id]: true })
    setTimeout(() => setSaved((s) => ({ ...s, [id]: false })), 2000)
    setToast('Cambios guardados')
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    await api.post('/inventory', { name: newItem.name, stock: parseFloat(newItem.stock), unit: newItem.unit })
    setNewItem({ name: '', stock: '', unit: '' })
    setToast('Ingrediente agregado')
    load()
  }

  const lowStock = items.filter((i) => i.stock < 5)

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Inventario</h1>
        <p className="text-gray-400 text-sm mt-0.5">Control de cantidad de ingredientes</p>
      </div>

      {/* Alerta cantidad baja */}
      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 text-sm">Cantidad baja</p>
            <p className="text-amber-700 text-sm mt-0.5">
              {lowStock.map((i) => i.name).join(', ')} {lowStock.length === 1 ? 'tiene' : 'tienen'} menos de 5 unidades.
            </p>
          </div>
        </div>
      )}

      {/* Agregar */}
      <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4 text-sm">Agregar ingrediente</h2>
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Nombre</label>
            <input
              required placeholder="Ej: Papas"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Cantidad</label>
              <input
                required type="number"
                placeholder="0"
                value={newItem.stock}
                onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Unidad</label>
              <UnitSelect value={newItem.unit} onChange={(v) => setNewItem({ ...newItem, unit: v })} />
            </div>
            <button
              type="submit"
              className="shrink-0 flex items-center justify-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white px-3 sm:px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Agregar</span>
            </button>
          </div>
        </div>
      </form>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[520px]">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 sm:px-6 py-4 font-semibold text-gray-400 text-xs uppercase tracking-wide">Ingrediente</th>
              <th className="text-left px-4 sm:px-6 py-4 font-semibold text-gray-400 text-xs uppercase tracking-wide">Cantidad</th>
              <th className="text-left px-4 sm:px-6 py-4 font-semibold text-gray-400 text-xs uppercase tracking-wide">Unidad</th>
              <th className="px-4 sm:px-6 py-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map((item) => {
              const isLow = item.stock < 5
              return (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{item.name}</span>
                      {isLow && (
                        <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full shrink-0">Bajo</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <input
                      type="number"
                      value={quantities[item.id] ?? item.stock}
                      onChange={(e) => setQuantities({ ...quantities, [item.id]: e.target.value })}
                      className={cn(
                        'w-24 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-colors',
                        isLow ? 'border-amber-300 bg-amber-50' : 'border-gray-200'
                      )}
                    />
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <UnitSelect
                      value={units[item.id] ?? item.unit}
                      onChange={(v) => setUnits({ ...units, [item.id]: v })}
                    />
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <button
                      onClick={() => handleUpdate(item.id)}
                      className={cn(
                        'flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-colors whitespace-nowrap',
                        saved[item.id]
                          ? 'bg-green-50 text-green-600'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      )}
                    >
                      <Save size={14} />
                      {saved[item.id] ? 'Guardado' : 'Guardar'}
                    </button>
                  </td>
                </tr>
              )
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-12 text-gray-400 text-sm">No hay ingredientes</td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      <AnimatePresence>
        {toast && <Toast message={toast} onDone={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  )
}
