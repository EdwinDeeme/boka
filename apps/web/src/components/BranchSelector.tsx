'use client'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useBranch, type ServiceType } from '@/context/BranchContext'
import { MapPin, Search, Truck, Store, UtensilsCrossed, Hash, ArrowRight, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

type Step = 'branch' | 'service' | 'table'

const SERVICE_OPTIONS: { id: ServiceType; label: string; sub: string; icon: React.ElementType }[] = [
  { id: 'ENVIO',  label: 'A domicilio', sub: 'Te lo llevamos donde estés',  icon: Truck },
  { id: 'PICKUP', label: 'Retirar',     sub: 'Pasás a recogerlo al local',  icon: Store },
  { id: 'MESA',   label: 'Comer aquí',  sub: 'Te lo llevamos a tu mesa',    icon: UtensilsCrossed },
]

export function BranchSelector() {
  const { branches, selectedBranch, serviceType, selectBranch, setService, loading } = useBranch()
  const pathname = usePathname()
  const [step, setStep] = useState<Step>('branch')
  const [search, setSearch] = useState('')
  const [tableInput, setTableInput] = useState('')

  if (pathname.startsWith('/admin')) return null
  if (loading) return null
  if (selectedBranch && serviceType) return null
  if (branches.length === 0) return null

  // Single branch: skip branch selection step
  const effectiveStep: Step = step === 'branch' && branches.length === 1 ? 'service' : step

  const filtered = branches.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      (b.address ?? '').toLowerCase().includes(search.toLowerCase())
  )

  function handleBranchSelect(branch: (typeof branches)[0]) {
    selectBranch(branch)
    setStep('service')
  }

  function handleServiceSelect(svc: ServiceType) {
    if (svc === 'MESA') {
      setStep('table')
    } else {
      setService(svc)
    }
  }

  function handleTableConfirm() {
    if (!tableInput.trim()) return
    setService('MESA', tableInput.trim())
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div
        key={effectiveStep}
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
      >
        {/* STEP 1 — Sucursal */}
        {effectiveStep === 'branch' && (
          <>
            <div className="bg-orange-500 px-6 pt-8 pb-6 text-center">
              <div className="bg-white/20 rounded-full p-3 w-fit mx-auto mb-3">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Bienvenido</h2>
              <p className="text-orange-100 text-sm mt-1">Seleccioná la sucursal más cercana</p>
            </div>

            {branches.length > 4 && (
              <div className="px-4 pt-4">
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar sucursal..."
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    autoFocus
                  />
                </div>
              </div>
            )}

            <div className="p-4 space-y-2 max-h-72 overflow-y-auto">
              {filtered.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-6">No se encontraron sucursales</p>
              )}
              {filtered.map((branch) => (
                <motion.button
                  key={branch.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleBranchSelect(branch)}
                  className="w-full text-left flex items-center gap-3 border-2 border-gray-100 hover:border-orange-400 hover:bg-orange-50 rounded-xl p-4 transition-all group"
                >
                  <div className="bg-orange-100 group-hover:bg-orange-200 rounded-lg p-2 shrink-0 transition-colors">
                    <MapPin size={16} className="text-orange-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 truncate">{branch.name}</p>
                    {branch.address && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">{branch.address}</p>
                    )}
                  </div>
                  <ArrowRight size={16} className="text-gray-300 group-hover:text-orange-400 shrink-0 transition-colors" />
                </motion.button>
              ))}
            </div>
          </>
        )}

        {/* STEP 2 — Tipo de servicio */}
        {effectiveStep === 'service' && (
          <>
            <div className="bg-orange-500 px-6 pt-8 pb-6 text-center">
              <h2 className="text-xl font-bold text-white">¿Cómo querés tu pedido?</h2>
              <p className="text-orange-100 text-sm mt-1">
                {selectedBranch?.name ?? branches[0]?.name}
              </p>
            </div>

            <div className="p-4 space-y-3">
              {SERVICE_OPTIONS.map(({ id, label, sub, icon: Icon }) => (
                <motion.button
                  key={id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleServiceSelect(id)}
                  className="w-full flex items-center gap-4 border-2 border-gray-100 hover:border-orange-400 hover:bg-orange-50 rounded-xl p-4 transition-all group"
                >
                  <div className="bg-orange-100 group-hover:bg-orange-200 rounded-xl p-3 shrink-0 transition-colors">
                    <Icon size={20} className="text-orange-500" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-gray-900">{label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
                  </div>
                  <ArrowRight size={16} className="text-gray-300 group-hover:text-orange-400 shrink-0 transition-colors" />
                </motion.button>
              ))}
            </div>

            {branches.length > 1 && (
              <div className="px-4 pb-4">
                <button
                  onClick={() => setStep('branch')}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ArrowLeft size={13} />
                  Cambiar sucursal
                </button>
              </div>
            )}
          </>
        )}

        {/* STEP 3 — Número de mesa */}
        {effectiveStep === 'table' && (
          <>
            <div className="bg-orange-500 px-6 pt-8 pb-6 text-center">
              <div className="bg-white/20 rounded-full p-3 w-fit mx-auto mb-3">
                <Hash className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Número de mesa</h2>
              <p className="text-orange-100 text-sm mt-1">Ingresá el número que aparece en tu mesa</p>
            </div>

            <div className="p-6 space-y-4">
              <input
                type="text"
                value={tableInput}
                onChange={(e) => setTableInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTableConfirm()}
                placeholder="Ej: 5"
                className="w-full text-center text-3xl font-bold border-2 border-gray-200 focus:border-orange-400 rounded-2xl py-4 focus:outline-none transition-colors"
                autoFocus
              />
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleTableConfirm}
                disabled={!tableInput.trim()}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors"
              >
                Confirmar mesa
              </motion.button>
              <button
                onClick={() => setStep('service')}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft size={13} />
                Volver
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}
