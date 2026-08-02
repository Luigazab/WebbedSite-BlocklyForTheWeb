import { NavLink } from 'react-router'
import { useUIStore } from '../../../store/uiStore'
import { useAuthStore } from '../../../store/authStore'
import { Home, Users, Activity, FileText, User, ChevronRight, ChevronLeft, Settings, LucideLibraryBig, Settings2, BookOpen } from 'lucide-react'

const links = [
  { to: '/admin',            label: 'Home',       icon: Home     },
  { to: '/admin/users',      label: 'Users',      icon: Users    },
  { to: '/admin/courses',    label: 'Courses',    icon: BookOpen },
  { to: '/admin/analytics',  label: 'Analytics',  icon: Activity },
  { to: '/admin/reports',    label: 'Reports',    icon: FileText },
  // { to: '/admin/engagement', label: 'Engagement', icon: Activity },
  // { to: '/admin/contents',   label: 'Contents',   icon: LucideLibraryBig },
  // { to: '/admin/config',     label: 'Platform Config', icon: Settings2 },
  { to: '/admin/profile',    label: 'Profile',    icon: User     },
  // { to: '/admin/settings',   label: 'Settings',   icon: Settings     },
]

export default function StudentSidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const profile = useAuthStore((state) => state.profile)

  return (
    <aside className={`fixed top-0 left-0 h-screen bg-white border-r border-slate-200 flex flex-col transition-all! duration-300! z-30 ${sidebarOpen ? 'w-64' : 'w-16'}`}>
      <div className="flex items-center justify-start px-4 pt-10 pb-3">
        {sidebarOpen && (
          <img src="/anotherlogo.png" alt="WebbedSite"  className='h-14 text-lg font-bold text-blockly-purple'/>
        )}
        <button onClick={toggleSidebar} className="p-1 rounded-md hover:bg-slate-100 ml-auto">
          {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>

      {/* Nav Links */}
      <nav className={`flex-1 px-2 flex flex-col gap-1 overflow-y-auto ${sidebarOpen ? '' : 'pt-7'}`}>
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold tracking-wider transition-colors! 
              ${isActive
                ? 'bg-indigo-100 text-slate-800'
                : 'text-slate-500 hover:bg-indigo-50'
              }`
            }
          >
            <Icon className="w-5 h-5 shrink-0"/>
            {sidebarOpen && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User info at bottom */}
      {sidebarOpen && profile && (
        <div className="px-4 py-4 border-t border-slate-100">
          <p className="text-md font-bold text-slate-600 truncate">{profile.username}</p>
          <p className="text-sm font-semibold text-emerald-700 capitalize border-l-4 border-emerald-800 pl-2">{profile.role}</p>
        </div>
      )}
    </aside>
  )
}