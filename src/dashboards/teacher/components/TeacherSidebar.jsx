import { NavLink, useLocation } from 'react-router'
import { useUIStore } from '../../../store/uiStore'
import { useAuthStore } from '../../../store/authStore'
import { useTour } from '../../../components/tour/TourProvider'
import { ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react'
import { useState } from 'react'

const links = [
  { to: '/teacher',            label: 'Home',               icon: (props) => <img src="/svghome.svg" alt="" {...props} />           },
  { to: '/teacher/projects',   label: 'Projects',           icon: (props) => <img src="/svgfolder.svg" alt="" {...props} />     },
  { to: '/teacher/content',    label: 'Content Management', icon: (props) => <img src="/svgbook.svg" alt="" {...props} /> },
  // { to: '/teacher/quizzes',    label: 'Quizzes',            icon: (props) => <img src="/svghome.svg" alt="" {...props} />   },
  // { to: '/teacher/tutorials',  label: 'Tutorials',          icon: (props) => <img src="/svghome.svg" alt="" {...props} />     },
  { to: '/teacher/classrooms', label: 'Classrooms',         icon: (props) => <img src="/svgclass.svg" alt="" {...props} />     },
  { to: '/teacher/students',    label: 'Students',          icon: (props) => <img src="/svgstudent.svg" alt="" {...props} />    },
  { to: '/teacher/grades',    label: 'Grades',              icon: (props) => <img src="/svggrade.svg" alt="" {...props} />    },
  { to: '/teacher/profile',    label: 'Profile',            icon: (props) => <img src="/svgprofile.svg" alt="" {...props} />    },
  // { to: '/teacher/settings',   label: 'Settings',           icon: (props) => <img src="/svgsettings.svg" alt="" {...props} />       },
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
    <aside className={`fixed top-0 left-0 h-screen bg-white border-r border-slate-200 flex flex-col transition-all! duration-300! z-30 ${sidebarOpen ? 'w-75' : 'w-16'}`}>
      <div className="flex items-center justify-start px-4 pt-10 pb-3">
        {sidebarOpen && (
          <img src="/anotherlogo.png" alt="WebbedSite" className="h-14 text-lg font-bold text-blockly-purple" />
        )}
        <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-slate-100 ml-auto">
          {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-1 px-2 flex flex-col gap-1 overflow-y-auto">
        {/* Regular links up to classrooms */}
        {links.slice(0, 7).map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/teacher'}
            className={({ isActive }) =>
              `flex items-center w-full ${sidebarOpen ? 'justify-start gap-3 px-5' : 'justify-center'} px-5 text-lg py-2 rounded-2xl font-bold transition-colors!
              ${isActive ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`
            }
          >
            <Icon className="w-10 h-10 shrink-0 min-w-[2.5rem] min-h-[2.5rem] object-contain" />
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