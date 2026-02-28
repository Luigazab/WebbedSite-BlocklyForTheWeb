import { useAuthStore } from '../../../store/authStore'
import ProfileMenu from '../../../components/ui/ProfileMenu'
import NotificationPanel from '../../../components/ui/NotificationPanel'
import { useTour } from '../../../components/tour/TourProvider'
import { useLocation } from 'react-router'
import { HelpCircle } from 'lucide-react'

export default function TeacherNavbar() {
  const profile = useAuthStore((state) => state.profile)
  const { startTour } = useTour()
  const location = useLocation()

  const getTourForRoute = () => {
    const path = location.pathname
    if (path.includes('/teacher') && path === '/teacher') return 'home'
    if (path.includes('/projects')) return 'projects'
    if (path.includes('/classrooms')) return 'classrooms'
    if (path.includes('/performance')) return 'performance'
    if (path.includes('/lessons')) return 'lessons'
    if (path.includes('/tutorials')) return 'tutorials'
    if (path.includes('/editor')) return 'editor'
    if (path.includes('/profile')) return 'profile'
    if (path.includes('/settings')) return 'settings'
    return null
  }

  const handleHelpClick = () => {
    const tourId = getTourForRoute()
    if (tourId) {
      startTour(tourId)
    }
  }

  const tourId = getTourForRoute()

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-20">
      <div>
        <p className="text-sm text-gray-500">
          Welcome back,{' '}
          <span className="font-semibold text-gray-800">{profile?.username}</span>
        </p>
      </div>

      <div className="flex items-center gap-1">
        {tourId && (
          <button 
            onClick={handleHelpClick}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors group relative"
            title="Show tour"
          >
            <HelpCircle className="w-5 h-5 text-gray-600 group-hover:text-blockly-purple transition-colors" />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Show tour
            </span>
          </button>
        )}
        <NotificationPanel />
        <ProfileMenu />
      </div>
    </header>
  )
}