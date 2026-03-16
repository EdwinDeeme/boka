'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LogOut, ExternalLink } from 'lucide-react'

const PAGE_TITLES: Record<string, string> = {
  '/admin':            'Pedidos',
  '/admin/productos':  'Productos',
  '/admin/categorias': 'Categorías',
  '/admin/inventario': 'Inventario',
  '/admin/ventas':     'Ventas',
}

export default function AdminMobileHeader() {
  const pathname = usePathname()
  const title = PAGE_TITLES[pathname] ?? 'Admin'

  return (
    <header className="bg-gray-950 text-white px-4 h-14 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <img src="/boka-logo.png" alt="BOKA" className="h-7 w-auto" />
        <span className="text-gray-500 text-sm">/</span>
        <span className="text-gray-300 text-sm font-medium">{title}</span>
      </div>
      <div className="flex items-center gap-1">
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
