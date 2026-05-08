'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LogOut, ExternalLink, Building2, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useAdminBranch } from '@/context/AdminBranchContext'
import { cn } from '@/lib/utils'

const PAGE_TITLES: Record<string, string> = {
  '/admin':             'Pedidos',
  '/admin/productos':   'Productos',
  '/admin/categorias':  'Categorías',
  '/admin/inventario':  'Inventario',
  '/admin/ventas':      'Ventas',
  '/admin/sucursales':  'Sucursales',
}

export default function AdminMobileHeader() {
  const pathname = usePathname()
  const title = PAGE_TITLES[pathname] ?? 'Admin'
  const { branches, activeBranch, setActiveBranch } = useAdminBranch()
  const [open, setOpen] = useState(false)

  return (
    <header className="bg-gray-950 text-white px-4 h-14 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-2 min-w-0">
        <img src="/boka-logo.png" alt="BOKA" className="h-7 w-auto shrink-0" />
        <span className="text-gray-500 text-sm">/</span>
        <span className="text-gray-300 text-sm font-medium truncate">{title}</span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {branches.length > 1 && (
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-xs text-gray-300"
            >
              <Building2 size={13} className="text-orange-400" />
              <span className="max-w-[80px] truncate">{activeBranch?.name ?? '—'}</span>
              <ChevronDown size={11} className={cn('transition-transform', open && 'rotate-180')} />
            </button>
            {open && (
              <div className="absolute right-0 top-full mt-1 bg-gray-900 border border-white/10 rounded-xl shadow-xl z-30 min-w-[160px] overflow-hidden">
                {branches.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => { setActiveBranch(b); setOpen(false) }}
                    className={cn(
                      'w-full text-left px-4 py-2.5 text-xs transition-colors',
                      activeBranch?.id === b.id ? 'bg-orange-500/20 text-orange-300' : 'text-gray-300 hover:bg-white/5'
                    )}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <Link href="/" className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-300 transition-colors">
          <ExternalLink size={16} />
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:text-red-400 transition-colors"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  )
}
