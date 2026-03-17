'use client'
import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Check, X, Tag } from 'lucide-react'
import { api } from '@/lib/api'
import { ConfirmModal } from '@/components/ConfirmModal'
import type { Category } from '@/types'

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)

  async function load() {
    setCategories(await api.get<Category[]>('/categories'))
  }
  useEffect(() => { load() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    await api.post('/categories', { name: newName.trim() })
    setNewName(''); load()
  }

  async function handleUpdate(id: number) {
    if (!editName.trim()) return
    await api.put(`/categories/${id}`, { name: editName.trim() })
    setEditingId(null); load()
  }

  async function handleDelete(id: number) {
    await api.delete(`/categories/${id}`)
    setDeleteId(null)
    load()
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-full overflow-x-hidden">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Categorías</h1>
        <p className="text-gray-500 text-sm mt-0.5">{categories.length} categorías</p>
      </div>

      <div className="max-w-lg space-y-4">
        {/* Agregar */}
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nueva categoría..."
            className="flex-1 min-w-0 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shrink-0"
          >
            <Plus size={16} /> <span className="hidden sm:inline">Agregar</span>
          </button>
        </form>

        {/* Lista */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card divide-y divide-gray-50">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-3 px-5 py-3.5">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                <Tag size={14} className="text-orange-500" />
              </div>
              {editingId === cat.id ? (
                <>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdate(cat.id)}
                  />
                  <button onClick={() => handleUpdate(cat.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
                    <Check size={15} />
                  </button>
                  <button onClick={() => setEditingId(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                    <X size={15} />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 font-medium text-gray-900 text-sm">{cat.name}</span>
                  <button
                    onClick={() => { setEditingId(cat.id); setEditName(cat.name) }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteId(cat.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </>
              )}
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-10">No hay categorías</p>
          )}
        </div>
      </div>

      <ConfirmModal
        open={deleteId !== null}
        title="Eliminar categoría"
        message="Esta acción no se puede deshacer. ¿Seguro que quieres eliminar esta categoría?"
        confirmLabel="Eliminar"
        onConfirm={() => deleteId !== null && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
