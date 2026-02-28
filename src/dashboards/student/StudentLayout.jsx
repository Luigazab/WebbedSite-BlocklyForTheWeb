import { Outlet } from 'react-router'
import StudentSidebar from './components/StudentSidebar'
import StudentNavbar from './components/StudentNavbar'
import { useUIStore } from '../../store/uiStore'

export default function StudentLayout() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <StudentSidebar />
      <div className={`flex flex-col flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <StudentNavbar />
        <main className="wrapper flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}