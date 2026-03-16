import AdminSidebar from './AdminSidebar'
import AdminBottomNav from './AdminBottomNav'
import AdminMobileHeader from './AdminMobileHeader'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar — solo desktop */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {/* Header mobile */}
      <div className="lg:hidden">
        <AdminMobileHeader />
      </div>

      {/* Contenido */}
      <main className="lg:ml-60 min-h-screen pb-20 lg:pb-0">
        {children}
      </main>

      {/* Bottom nav — solo mobile/tablet */}
      <div className="lg:hidden">
        <AdminBottomNav />
      </div>
    </div>
  )
}
