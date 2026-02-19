import { NavLink } from 'react-router'
import { useUIStore } from '../../../store/uiStore'
import { useAuthStore } from '../../../store/authStore'
import {
  Home, BookOpen, PlayCircle, Code2,
  MessageSquare, User, ChevronLeft, ChevronRight,
  University
} from 'lucide-react'

const links = [
  { to: '/student',           label: 'Home',      icon: Home        },
  { to: '/student/lessons',   label: 'Lessons',   icon: BookOpen    },
  { to: '/student/tutorials', label: 'Tutorials', icon: PlayCircle  },
  { to: '/student/classrooms', label: 'Classrooms', icon: University  },
  { to: '/student/editor',    label: 'Editor',    icon: Code2       },
  { to: '/student/feedback',  label: 'Feedback',  icon: MessageSquare },
  { to: '/student/profile',   label: 'Profile',   icon: User        },
]

export default function StudentSidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const profile = useAuthStore((state) => state.profile)

  return (
    <aside className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 z-30 ${sidebarOpen ? 'w-64' : 'w-16'}`}>
      {/* Logo / Brand */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100">
        {sidebarOpen && (
          <img src="/anotherlogo.png" alt="WebbedSite"  className='h-10 text-lg font-bold text-blockly-purple'/>
        )}
        <button onClick={toggleSidebar} className="p-1 rounded-md hover:bg-gray-100 ml-auto">
          {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-2 py-4 flex flex-col gap-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/student'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold transition-colors
              ${isActive
                ? 'bg-blockly-blue/10 text-blockly-blue'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User info at bottom */}
      {sidebarOpen && profile && (
        <div className="px-4 py-4 border-t border-gray-100">
          <p className="text-md font-bold text-gray-800 truncate">{profile.username}</p>
          <p className="text-sm text-gray-400 capitalize">{profile.role}</p>
        </div>
      )}
    </aside>
  )
}