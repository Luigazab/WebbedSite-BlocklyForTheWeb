import { Outlet } from 'react-router'
import AdminSidebar from './components/AdminSidebar'
import AdminNavbar from './components/AdminNavbar'
import { useUIStore } from '../../store/uiStore'

export default function AdminLayout() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar />
      <div className={`flex flex-col flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <AdminNavbar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}