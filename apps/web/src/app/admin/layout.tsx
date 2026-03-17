import AdminSidebar from './AdminSidebar'
import AdminBottomNav from './AdminBottomNav'
import AdminMobileHeader from './AdminMobileHeader'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>
      <div className="lg:hidden">
        <AdminMobileHeader />
      </div>
      <main className="lg:ml-60 min-h-screen pb-20 lg:pb-0 overflow-x-hidden">
        {children}
      </main>
      <div className="lg:hidden">
        <AdminBottomNav />
      </div>
    </div>
  )
}
