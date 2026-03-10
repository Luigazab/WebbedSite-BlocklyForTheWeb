import { Outlet } from 'react-router'
import TeacherSidebar from './components/TeacherSidebar'
import TeacherNavbar from './components/TeacherNavbar'
import { useUIStore } from '../../store/uiStore'

export default function TeacherLayout() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <TeacherSidebar />
      <div className={`flex flex-col flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <TeacherNavbar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}