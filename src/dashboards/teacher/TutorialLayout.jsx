import { Outlet } from 'react-router'
import TeacherSidebar from './components/TeacherSidebar'
import { useUIStore } from '../../store/uiStore'

export default function TutorialLayout() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <TeacherSidebar />
      <div className={`flex flex-col flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-16' : 'ml-16'}`}>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}