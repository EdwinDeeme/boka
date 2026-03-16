'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, ChevronDown } from 'lucide-react'
import type { LowStockAlert } from '@/hooks/useLowStock'

export function LowStockBadge({ alert }: { alert: LowStockAlert }) {
  const [open, setOpen] = useState(false)
  const { lowCapacityProducts } = alert

  if (lowCapacityProducts.length === 0) return null

  const critical = lowCapacityProducts.filter((p) => p.capacity <= 3)
  const isCritical = critical.length > 0

  return (
    <div className="relative">
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        animate={{ scale: isCritical ? [1, 1.04, 1] : 1 }}
        transition={{ repeat: isCritical ? Infinity : 0, duration: 1.8, repeatDelay: 1 }}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold transition-colors ${
          isCritical
            ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-amber-50 border-amber-200 text-amber-700'
        }`}
      >
        <AlertTriangle size={14} className="shrink-0" />
        <span className="hidden sm:inline">
          {lowCapacityProducts.length} producto{lowCapacityProducts.length > 1 ? 's' : ''} con stock bajo
        </span>
        <span className="sm:hidden font-black">{lowCapacityProducts.length}</span>
        <ChevronDown
          size={13}
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-bold text-gray-900">Alerta de inventario</p>
                <button onClick={() => setOpen(false)} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                  <X size={13} className="text-gray-400" />
                </button>
              </div>

              <div className="p-3 space-y-1.5 max-h-64 overflow-y-auto">
                {lowCapacityProducts.map((p) => (
                  <div
                    key={p.productName}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl ${
                      p.capacity <= 3 ? 'bg-red-50' : 'bg-amber-50'
                    }`}
                  >
                    <span className={`text-sm font-semibold ${p.capacity <= 3 ? 'text-red-700' : 'text-amber-700'}`}>
                      {p.productName}
                    </span>
                    <span className={`text-xs font-black px-2 py-1 rounded-lg ${
                      p.capacity <= 3
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {p.capacity <= 0 ? 'Sin stock' : `${p.capacity} restantes`}
                    </span>
                  </div>
                ))}
              </div>

              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-400">Actualiza el inventario para corregir las alertas.</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
