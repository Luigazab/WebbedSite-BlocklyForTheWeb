import { NavLink, useLocation } from 'react-router'
import { useUIStore } from '../../../store/uiStore'
import { useAuthStore } from '../../../store/authStore'
import { useTour } from '../../../components/tour/TourProvider'
import {
  Home, BookOpen, PlayCircle, FolderOpen,
  BarChart2, ChevronLeft, ChevronRight,
  HelpCircle, Settings, UserSquare2, University,
  ClipboardMinus, FileQuestion, ChevronDown, Map,
} from 'lucide-react'
import { useState } from 'react'

const links = [
  { to: '/teacher',            label: 'Home',            icon: Home           },
  { to: '/teacher/projects',   label: 'Projects',        icon: FolderOpen     },
  { to: '/teacher/lessons',    label: 'Class Materials', icon: ClipboardMinus },
  { to: '/teacher/quizzes',    label: 'Quizzes',         icon: FileQuestion   },
  { to: '/teacher/tutorials',  label: 'Tutorials',       icon: PlayCircle     },
  { to: '/teacher/classrooms', label: 'Classrooms',      icon: University     },
  // Learn is a group — handled separately below
  { to: '/teacher/profile',    label: 'Profile',         icon: UserSquare2    },
  { to: '/teacher/settings',   label: 'Settings',        icon: Settings       },
]

const learnLinks = [
  { to: '/teacher/learn',            label: 'Learn Page'  },
  { to: '/teacher/learn/management', label: 'Management'  },
]

export default function TeacherSidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const profile = useAuthStore((state) => state.profile)
  const { startTour } = useTour()
  const location = useLocation()

  const [learnOpen, setLearnOpen] = useState(
    location.pathname.startsWith('/teacher/learn')
  )

  const getTourForRoute = () => {
    const path = location.pathname
    if (path === '/teacher') return 'home'
    if (path.includes('/projects'))   return 'projects'
    if (path.includes('/classrooms')) return 'classrooms'
    if (path.includes('/lessons'))    return 'lessons'
    if (path.includes('/tutorials'))  return 'tutorials'
    if (path.includes('/editor'))     return 'editor'
    if (path.includes('/profile'))    return 'profile'
    if (path.includes('/settings'))   return 'settings'
    return null
  }

  const tourId = getTourForRoute()

  const isLearnActive = location.pathname.startsWith('/teacher/learn')

  return (
    <aside className={`fixed top-0 left-0 h-screen bg-white border-r border-slate-200 flex flex-col transition-all! duration-300! z-30 ${sidebarOpen ? 'w-64' : 'w-16'}`}>
      <div className="flex items-center justify-between px-4 py-5 border-b border-slate-100">
        {sidebarOpen && (
          <img src="/anotherlogo.png" alt="WebbedSite" className="h-10 text-lg font-bold text-blockly-purple" />
        )}
        <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-slate-100 ml-auto">
          {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-1 px-2 py-4 flex flex-col gap-1 overflow-y-auto">
        {/* Regular links up to classrooms */}
        {links.slice(0, 6).map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/teacher'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-2xl font-bold transition-colors!
              ${isActive ? 'bg-indigo-900 text-amber-200' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-800'}`
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>{label}</span>}
          </NavLink>
        ))}

        {/* Learn group with sub-nav */}
        <div>
          <button
            onClick={() => { if (sidebarOpen) setLearnOpen((v) => !v) }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl font-bold transition-colors!
              ${isLearnActive ? 'bg-indigo-900 text-amber-200' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-800'}`}
          >
            <BookOpen className="w-5 h-5 shrink-0" />
            {sidebarOpen && (
              <>
                <span className="flex-1 text-left">Learn</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform! ${learnOpen ? 'rotate-180' : ''}`}
                />
              </>
            )}
          </button>

          {sidebarOpen && learnOpen && (
            <div className="ml-8 mt-1 flex flex-col gap-0.5">
              {learnLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-2xl text-sm font-semibold transition-colors!
                    ${isActive ? 'bg-indigo-900 text-amber-200' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-800'}`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Remaining links */}
        {links.slice(6).map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/teacher'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-2xl font-bold transition-colors!
              ${isActive ? 'bg-indigo-900 text-amber-200' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-800'}`
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>{label}</span>}
          </NavLink>
        ))}

        {tourId && (
          <button
            onClick={() => startTour(tourId)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors! text-blue-950 hover:bg-gray-100 hover:text-blue-700 mt-auto"
          >
            <HelpCircle className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>Help Tour</span>}
          </button>
        )}
      </nav>

      {sidebarOpen && profile && (
        <div className="px-4 py-4 border-t border-gray-100">
          <p className="text-md font-bold text-slate-600 truncate">{profile.username}</p>
          <p className="text-sm font-semibold text-blue-700 capitalize border-l-4 border-blue-800 pl-2">{profile.role}</p>
        </div>
      )}
    </aside>
  )
}