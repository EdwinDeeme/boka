'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import type { Branch } from '@/types'
import { Plus, Pencil, Trash2, Building2, Check, X } from 'lucide-react'
import { useAdminBranch } from '@/context/AdminBranchContext'

type BranchForm = { name: string; address: string; phone: string }
const empty: BranchForm = { name: '', address: '', phone: '' }

export default function SucursalesPage() {
  const { branches, setActiveBranch, activeBranch } = useAdminBranch()
  const [list, setList] = useState<Branch[]>([])
  const [editing, setEditing] = useState<Branch | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<BranchForm>(empty)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const data = await api.get<Branch[]>('/branches')
    setList(data)
  }

  function startCreate() {
    setCreating(true)
    setEditing(null)
    setForm(empty)
  }

  function startEdit(b: Branch) {
    setEditing(b)
    setCreating(false)
    setForm({ name: b.name, address: b.address ?? '', phone: b.phone ?? '' })
  }

  function cancel() {
    setCreating(false)
    setEditing(null)
    setForm(empty)
  }

  async function save() {
    if (!form.name.trim()) return
    setLoading(true)
    try {
      if (creating) {
        await api.post('/branches', form)
      } else if (editing) {
        await api.put(`/branches/${editing.id}`, form)
      }
      await load()
      cancel()
    } finally {
      setLoading(false)
    }
  }

  async function toggleActive(b: Branch) {
    await api.put(`/branches/${b.id}`, { active: !b.active })
    await load()
  }

  async function remove(b: Branch) {
    if (!confirm(`¿Eliminar la sucursal "${b.name}"? Esta acción no se puede deshacer.`)) return
    await api.delete(`/branches/${b.id}`)
    await load()
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sucursales</h1>
          <p className="text-sm text-gray-500 mt-0.5">Administrá las sucursales del negocio</p>
        </div>
        <button
          onClick={startCreate}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          <Plus size={16} />
          Nueva sucursal
        </button>
      </div>

      {/* Create / Edit form */}
      {(creating || editing) && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">
            {creating ? 'Nueva sucursal' : `Editar: ${editing?.name}`}
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Nombre *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej: Sucursal Centro"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Dirección</label>
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Ej: 100m norte del parque"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Teléfono / WhatsApp</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Ej: 50688887777"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={save}
              disabled={loading || !form.name.trim()}
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              <Check size={15} />
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              onClick={cancel}
              className="flex items-center gap-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm px-4 py-2 rounded-xl transition-colors"
            >
              <X size={15} />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Branch list */}
      <div className="space-y-3">
        {list.map((b) => (
          <div
            key={b.id}
            className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm"
          >
            <div className={`p-2.5 rounded-xl ${b.active ? 'bg-orange-100' : 'bg-gray-100'}`}>
              <Building2 size={20} className={b.active ? 'text-orange-500' : 'text-gray-400'} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900 truncate">{b.name}</p>
                {!b.active && (
                  <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">Inactiva</span>
                )}
              </div>
              {b.address && <p className="text-xs text-gray-500 truncate">{b.address}</p>}
              {b.phone && <p className="text-xs text-gray-400">{b.phone}</p>}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => toggleActive(b)}
                title={b.active ? 'Desactivar' : 'Activar'}
                className={`p-2 rounded-lg text-xs transition-colors ${b.active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}
              >
                <Check size={15} />
              </button>
              <button
                onClick={() => startEdit(b)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Pencil size={15} />
              </button>
              <button
                onClick={() => remove(b)}
                className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Building2 size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No hay sucursales registradas</p>
          </div>
        )}
      </div>
    </div>
  )
}
