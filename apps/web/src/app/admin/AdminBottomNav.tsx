'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag, Package, Tag, Archive, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin',            label: 'Pedidos',    icon: ShoppingBag },
  { href: '/admin/productos',  label: 'Productos',  icon: Package },
  { href: '/admin/categorias', label: 'Categorías', icon: Tag },
  { href: '/admin/inventario', label: 'Inventario', icon: Archive },
  { href: '/admin/ventas',     label: 'Ventas',     icon: BarChart2 },
]

export default function AdminBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-white/5 z-30 safe-area-pb">
      <div className="flex items-stretch">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold transition-colors',
                active ? 'text-brand-400' : 'text-gray-500 hover:text-gray-300'
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
