import { NavLink, useLocation } from 'react-router'
import { useUIStore } from '../../../store/uiStore'
import { useAuthStore } from '../../../store/authStore'
import { useTour } from '../../../components/tour/TourProvider'
import {
  Home, BookOpen, PlayCircle, Users, FolderOpen,
  BarChart2, MessageSquare, User, ChevronLeft, ChevronRight,
  HelpCircle
} from 'lucide-react'

const links = [
  { to: '/teacher',                   label: 'Home',        icon: Home        },
  { to: '/teacher/projects',          label: 'Projects',    icon: FolderOpen  },
  { to: '/teacher/classrooms',        label: 'Classrooms',  icon: Users       },
  { to: '/teacher/performance',       label: 'Performance', icon: BarChart2   },
  { to: '/teacher/lessons',           label: 'Lessons',     icon: BookOpen    },
  { to: '/teacher/tutorials/create',  label: 'Tutorials',   icon: PlayCircle  },
  { to: '/teacher/profile',           label: 'Feedback',    icon: MessageSquare },
  { to: '/teacher/settings',          label: 'Profile',     icon: User        },
]

export default function TeacherSidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const profile = useAuthStore((state) => state.profile)
  const { startTour } = useTour()
  const location = useLocation()

  const getTourForRoute = () => {
    const path = location.pathname
    if (path === '/teacher') return 'home'
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
    <aside className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 z-30 ${sidebarOpen ? 'w-64' : 'w-16'}`}>
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100">
        {sidebarOpen && (
          <img src="/anotherlogo.png" alt="WebbedSite"  className='h-10 text-lg font-bold text-blockly-purple'/>
        )}
        <button onClick={toggleSidebar} className="p-1 rounded-md hover:bg-gray-100 ml-auto">
          {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-1 px-2 py-4 flex flex-col gap-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/teacher'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${isActive
                ? 'bg-blockly-purple/10 text-blockly-purple'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>{label}</span>}
          </NavLink>
        ))}
        {tourId && (
          <button
            onClick={handleHelpClick}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-gray-600 hover:bg-gray-100 hover:text-blockly-purple mt-auto"
            title="Show tour"
          >
            <HelpCircle className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>Help Tour</span>}
          </button>
        )}
      </nav>

      {/* User info at bottom */}
      {sidebarOpen && profile && (
        <div className="px-4 py-4 border-t border-gray-100">
          <p className="text-sm font-semibold text-gray-800 truncate">{profile.username}</p>
          <p className="text-xs text-gray-400 capitalize">{profile.role}</p>
        </div>
      )}
    </aside>
  )
}