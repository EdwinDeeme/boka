'use client'
import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, X, Package, Layers, FlaskConical, Check } from 'lucide-react'
import { api } from '@/lib/api'
import { formatPrice, cn } from '@/lib/utils'
import { useLowStock } from '@/hooks/useLowStock'
import { LowStockBadge } from '@/components/LowStockBadge'
import type { Product, Category, InventoryItem } from '@/types'

type ProductForm = {
  name: string; description: string; price: string
  categoryId: string; imageUrl: string; active: boolean
}
type InventoryLine = { inventoryItemId: number; quantityUsed: number }
type Capacity = { productId: number; productName: string; capacity: number | null }
type Tab = 'info' | 'extras' | 'inventario'

const emptyForm: ProductForm = {
  name: '', description: '', price: '', categoryId: '', imageUrl: '', active: true,
}

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [capacities, setCapacities] = useState<Capacity[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('info')
  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [selectedExtras, setSelectedExtras] = useState<number[]>([])
  const [inventoryLines, setInventoryLines] = useState<InventoryLine[]>([])

  const load = useCallback(async () => {
    const [prods, cats, inv, caps] = await Promise.all([
      api.get<Product[]>('/products'),
      api.get<Category[]>('/categories'),
      api.get<InventoryItem[]>('/inventory'),
      api.get<Capacity[]>('/products/capacities/all').catch(() => []),
    ])
    setProducts(prods)
    setCategories(cats)
    setInventoryItems(inv)
    setCapacities(caps)
  }, [])

  useEffect(() => { load() }, [load])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setSelectedExtras([])
    setInventoryLines([])
    setActiveTab('info')
    setShowModal(true)
  }

  async function openEdit(p: Product) {
    setEditing(p)
    setForm({
      name: p.name, description: p.description || '',
      price: p.price.toString(), categoryId: p.categoryId.toString(),
      imageUrl: p.imageUrl || '', active: p.active,
    })
    setActiveTab('info')
    // Load full detail (extras + inventory)
    const detail = await api.get<Product>(`/products/${p.id}`)
    setSelectedExtras((detail.extras ?? []).map((e: any) => e.extra.id))
    setInventoryLines(
      (detail.inventory ?? []).map((pi: any) => ({
        inventoryItemId: pi.inventoryItemId,
        quantityUsed: pi.quantityUsed,
      }))
    )
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const data = {
      name: form.name, description: form.description,
      price: parseInt(form.price), categoryId: parseInt(form.categoryId),
      imageUrl: form.imageUrl || undefined, active: form.active,
    }
    let productId: number
    if (editing) {
      await api.put(`/products/${editing.id}`, data)
      productId = editing.id
    } else {
      const created = await api.post<{ id: number }>('/products', data)
      productId = created.id
    }
    // Save extras
    await api.put(`/products/${productId}/extras`, { extraIds: selectedExtras })
    // Save inventory
    await api.put(`/products/${productId}/inventory`, { items: inventoryLines })
    setShowModal(false)
    load()
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este producto?')) return
    await api.delete(`/products/${id}`)
    load()
  }

  function toggleExtra(id: number) {
    setSelectedExtras((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function addInventoryLine() {
    const unused = inventoryItems.find((i) => !inventoryLines.some((l) => l.inventoryItemId === i.id))
    if (unused) setInventoryLines((prev) => [...prev, { inventoryItemId: unused.id, quantityUsed: 0 }])
  }

  function updateInventoryLine(idx: number, field: keyof InventoryLine, value: number) {
    setInventoryLines((prev) => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l))
  }

  function removeInventoryLine(idx: number) {
    setInventoryLines((prev) => prev.filter((_, i) => i !== idx))
  }

  const { alert } = useLowStock()
  const extraProducts = products.filter((p) => p.category?.name === 'Extras')
  const capacityMap = Object.fromEntries(capacities.map((c) => [c.productId, c.capacity]))

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'info',       label: 'Info',       icon: <Package size={14} /> },
    { id: 'extras',     label: 'Extras',     icon: <Layers size={14} /> },
    { id: 'inventario', label: 'Inventario', icon: <FlaskConical size={14} /> },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Productos</h1>
          <p className="text-gray-400 text-sm">{products.length} en total</p>
        </div>
        <div className="flex items-center gap-3">
          <LowStockBadge alert={alert} />
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
          >
            <Plus size={15} /> Nuevo producto
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-3.5 font-semibold text-gray-400 text-xs uppercase tracking-wide">Producto</th>
              <th className="text-left px-5 py-3.5 font-semibold text-gray-400 text-xs uppercase tracking-wide">Categoría</th>
              <th className="text-left px-5 py-3.5 font-semibold text-gray-400 text-xs uppercase tracking-wide">Precio</th>
              <th className="text-left px-5 py-3.5 font-semibold text-gray-400 text-xs uppercase tracking-wide">Puedes hacer</th>
              <th className="text-left px-5 py-3.5 font-semibold text-gray-400 text-xs uppercase tracking-wide">Estado</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map((p) => {
              const cap = capacityMap[p.id]
              const lowStock = cap !== undefined && cap !== null && cap <= 3
              return (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                        {p.imageUrl
                          ? <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                          : <Package size={15} className="text-orange-300" />}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{p.name}</p>
                        {p.description && <p className="text-gray-400 text-xs truncate max-w-[200px]">{p.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">{p.category?.name}</span>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-brand-600">{formatPrice(p.price)}</td>
                  <td className="px-5 py-3.5">
                    {cap === undefined || cap === null ? (
                      <span className="text-gray-300 text-xs">—</span>
                    ) : (
                      <span className={cn(
                        'inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full',
                        lowStock
                          ? 'bg-red-50 text-red-600'
                          : 'bg-green-50 text-green-700'
                      )}>
                        {lowStock && '⚠ '}
                        {cap} unid.
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={cn(
                      'inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full',
                      p.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'
                    )}>
                      <span className={cn('w-1.5 h-1.5 rounded-full', p.active ? 'bg-green-400' : 'bg-gray-300')} />
                      {p.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => openEdit(p)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">{editing ? `Editar: ${editing.name}` : 'Nuevo producto'}</h2>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                  <X size={17} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-100 px-6">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px',
                      activeTab === tab.id
                        ? 'border-brand-500 text-brand-600'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    )}
                  >
                    {tab.icon}{tab.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit}>
                <div className="p-6 max-h-[60vh] overflow-y-auto">

                  {/* ── Tab: Info ── */}
                  {activeTab === 'info' && (
                    <div className="space-y-4">
                      {([
                        { label: 'Nombre', field: 'name', placeholder: 'Nombre del producto', required: true },
                        { label: 'Descripción', field: 'description', placeholder: 'Descripción breve' },
                        { label: 'Precio (₡)', field: 'price', placeholder: '3000', type: 'number', required: true },
                        { label: 'URL de imagen', field: 'imageUrl', placeholder: 'https://...' },
                      ] as const).map(({ label, field, placeholder, type, required }) => (
                        <div key={field}>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
                          <input
                            required={required}
                            type={type || 'text'}
                            placeholder={placeholder}
                            value={form[field]}
                            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                          />
                        </div>
                      ))}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Categoría</label>
                        <select
                          required
                          value={form.categoryId}
                          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
                        >
                          <option value="">Seleccionar categoría</option>
                          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div className="relative" onClick={() => setForm({ ...form, active: !form.active })}>
                          <div className={cn('w-10 h-6 rounded-full transition-colors', form.active ? 'bg-brand-500' : 'bg-gray-200')} />
                          <div className={cn('absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform', form.active ? 'translate-x-5' : 'translate-x-1')} />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Producto activo</span>
                      </label>
                    </div>
                  )}

                  {/* ── Tab: Extras ── */}
                  {activeTab === 'extras' && (
                    <div>
                      {extraProducts.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <Layers size={32} className="mx-auto mb-2 opacity-30" />
                          <p className="text-sm">No hay productos en la categoría "Extras".</p>
                          <p className="text-xs mt-1">Crea productos con categoría "Extras" primero.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {extraProducts.map((ep) => {
                            const selected = selectedExtras.includes(ep.id)
                            return (
                              <button
                                key={ep.id}
                                type="button"
                                onClick={() => toggleExtra(ep.id)}
                                className={cn(
                                  'w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all',
                                  selected ? 'border-brand-400 bg-brand-50' : 'border-gray-100 hover:border-gray-200'
                                )}
                              >
                                <div className={cn(
                                  'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors',
                                  selected ? 'bg-brand-500 border-brand-500' : 'border-gray-300'
                                )}>
                                  {selected && <Check size={12} className="text-white" />}
                                </div>
                                <span className="flex-1 text-sm font-medium text-gray-800">{ep.name}</span>
                                <span className="text-sm font-bold text-brand-600">{formatPrice(ep.price)}</span>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Tab: Inventario ── */}
                  {activeTab === 'inventario' && (
                    <div className="space-y-3">
                      <p className="text-xs text-gray-400">Define cuánto de cada ingrediente usa este producto por unidad.</p>
                      {inventoryLines.map((line, idx) => {
                        const item = inventoryItems.find((i) => i.id === line.inventoryItemId)
                        return (
                          <div key={idx} className="flex items-center gap-2">
                            <select
                              value={line.inventoryItemId}
                              onChange={(e) => updateInventoryLine(idx, 'inventoryItemId', parseInt(e.target.value))}
                              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
                            >
                              {inventoryItems.map((i) => (
                                <option key={i.id} value={i.id}>{i.name}</option>
                              ))}
                            </select>
                            <div className="flex items-center gap-1 shrink-0">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={line.quantityUsed}
                                onChange={(e) => updateInventoryLine(idx, 'quantityUsed', parseFloat(e.target.value) || 0)}
                                className="w-20 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 text-center"
                              />
                              <span className="text-xs text-gray-400 w-8">{item?.unit ?? ''}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeInventoryLine(idx)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )
                      })}
                      {inventoryLines.length < inventoryItems.length && (
                        <button
                          type="button"
                          onClick={addInventoryLine}
                          className="flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                        >
                          <Plus size={14} /> Añadir ingrediente
                        </button>
                      )}
                      {inventoryItems.length === 0 && (
                        <p className="text-xs text-gray-400 text-center py-4">
                          No hay items de inventario. Créalos en la sección Inventario.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  >
                    {editing ? 'Guardar cambios' : 'Crear producto'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
