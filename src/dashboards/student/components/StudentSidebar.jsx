import { NavLink, useLocation } from 'react-router'
import { useUIStore } from '../../../store/uiStore'
import { useAuthStore } from '../../../store/authStore'
import { useTour } from '../../../components/tour/TourProvider'
import {
  Home, BookOpen, ChevronLeft, ChevronRight,
  University, FolderOpen, Settings, UserSquare2, HelpCircle,
  LibraryBigIcon
} from 'lucide-react'

const links = [
  { to: '/student',             label: 'Home',        icon: (props) => <img src="/home.svg" alt="" {...props} />        },
  { to: '/student/projects',    label: 'Projects',    icon: (props) => <img src="/folder.svg" alt="" {...props} />  },
  { to: '/student/classrooms',  label: 'Classroom',  icon: (props) => <img src="/study.svg" alt="" {...props} />  },
  { to: '/student/learn',       label: 'Learn',       icon: (props) => <img src="/learn.svg" alt="" {...props} />    },
  // { to: '/student/docs',        label: 'Documentation',     icon: (props) => <img src="/library.svg" alt="" {...props} />    },
  // { to: '/student/tutorials', label: 'Tutorials', icon: PlayCircle},
  { to: '/student/profile',     label: 'Profile',     icon: (props) => <img src="/user_profile.png" alt="" {...props} /> },
  // { to: '/student/settings',    label: 'Settings',    icon: (props) => <img src="/settings.svg" alt="" {...props} />    },
]

export default function StudentSidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const profile = useAuthStore((state) => state.profile)
  const { startTour } = useTour()
  const location = useLocation()

  const getTourForRoute = () => {
    const path = location.pathname
    if (path === '/student') return 'home'
    if (path.includes('/projects')) return 'projects'
    if (path.includes('/classrooms')) return 'classrooms'
    if (path.includes('/learn')) return 'learn'
    if (path.includes('/docs')) return 'docs'
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
    <aside className={`fixed top-0 left-0 h-screen bg-white border-r border-slate-200 flex flex-col transition-all! duration-300! z-30 ${sidebarOpen ? 'w-75' : 'w-16'}`}>
      <div className="flex items-center justify-start px-4 pt-10 pb-3">
        <img src="/anotherlogo.png" alt="WebbedSite"  className='h-14 text-lg font-bold text-blockly-purple'/>
        {/* {sidebarOpen && (
        )}
        <button onClick={toggleSidebar} className="p-1 rounded-md hover:bg-gray-100 ml-auto">
          {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button> */}
      </div>

      <nav className="flex-1 px-2 flex flex-col gap-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/student'}
            className={({ isActive }) =>
              `flex items-center gap-5 px-5 text-lg py-3 rounded-lg font-bold transition-colors!
              ${isActive
                ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'
              }`
            }
          >
            <span className="bg-blue-200 rounded-full"><Icon className="w-8 h-8 shrink-0" /></span>
            {sidebarOpen && <span>{label}</span>}
          </NavLink>
        ))}

        {tourId && (
          <button
            onClick={handleHelpClick}
            className="flex items-center gap-3 px-3 py-2 rounded-2xl text-sm font-medium transition-colors! text-blue-950 hover:bg-gray-100 hover:text-blue-700 mt-auto"
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
          <p className="text-md font-bold text-slate-800 truncate">{profile.username}</p>
          <p className="text-sm font-semibold text-blue-700 capitalize border-l-4 border-blue-800 pl-2">{profile.role}</p>
        </div>
      )}
    </aside>
  )
}