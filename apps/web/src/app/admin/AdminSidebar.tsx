'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { ShoppingBag, Package, Tag, Archive, BarChart2, ExternalLink, LogOut, Building2, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdminBranch } from '@/context/AdminBranchContext'
import { useState } from 'react'

const navItems = [
  { href: '/admin', label: 'Pedidos', icon: ShoppingBag },
  { href: '/admin/productos', label: 'Productos', icon: Package },
  { href: '/admin/categorias', label: 'Categorías', icon: Tag },
  { href: '/admin/inventario', label: 'Inventario', icon: Archive },
  { href: '/admin/ventas', label: 'Ventas', icon: BarChart2 },
  { href: '/admin/sucursales', label: 'Sucursales', icon: Building2 },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const { branches, activeBranch, setActiveBranch } = useAdminBranch()
  const [open, setOpen] = useState(false)

  return (
    <aside className="w-60 bg-gray-950 text-white flex flex-col shrink-0 fixed h-full z-10">
      <div className="px-5 py-5 border-b border-white/5">
        <img src="/boka-logo.png" alt="BOKA" className="h-8 w-auto mb-1" />
        <p className="text-gray-500 text-xs mt-0.5">Panel de administración</p>
      </div>

      {/* Branch selector */}
      {branches.length > 0 && (
        <div className="px-3 py-2 border-b border-white/5 relative">
          <button
            onClick={() => setOpen(!open)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm"
          >
            <Building2 size={14} className="text-orange-400 shrink-0" />
            <span className="flex-1 text-left text-white truncate text-xs font-medium">
              {activeBranch?.name ?? 'Seleccionar sucursal'}
            </span>
            <ChevronDown size={13} className={cn('text-gray-500 transition-transform', open && 'rotate-180')} />
          </button>
          {open && (
            <div className="absolute left-3 right-3 top-full mt-1 bg-gray-900 border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden">
              {branches.map((b) => (
                <button
                  key={b.id}
                  onClick={() => { setActiveBranch(b); setOpen(false) }}
                  className={cn(
                    'w-full text-left px-4 py-2.5 text-xs transition-colors',
                    activeBranch?.id === b.id
                      ? 'bg-orange-500/20 text-orange-300'
                      : 'text-gray-300 hover:bg-white/5'
                  )}
                >
                  {b.name}
                  {b.address && <span className="block text-gray-500 text-[10px]">{b.address}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              )}
            >
              <Icon size={17} className="shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-white/5 space-y-0.5">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-500 hover:text-gray-300 transition-colors text-xs"
        >
          <ExternalLink size={14} />
          Ver sitio público
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-colors text-xs"
        >
          <LogOut size={14} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
