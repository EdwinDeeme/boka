'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { ShoppingBag, Package, Tag, Archive, BarChart2, ExternalLink, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: 'Pedidos', icon: ShoppingBag },
  { href: '/admin/productos', label: 'Productos', icon: Package },
  { href: '/admin/categorias', label: 'Categorías', icon: Tag },
  { href: '/admin/inventario', label: 'Inventario', icon: Archive },
  { href: '/admin/ventas', label: 'Ventas', icon: BarChart2 },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 bg-gray-950 text-white flex flex-col shrink-0 fixed h-full z-10">
      <div className="px-5 py-5 border-b border-white/5">
        <img src="/boka-logo.png" alt="BOKA" className="h-8 w-auto mb-1" />
        <p className="text-gray-500 text-xs mt-0.5">Panel de administración</p>
      </div>

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
