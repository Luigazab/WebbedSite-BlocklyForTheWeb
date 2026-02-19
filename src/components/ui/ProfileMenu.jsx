import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { User, Settings, Trophy, LogOut, ChevronDown } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useAuth } from '../../hooks/useAuth'

const menuItems = (role) => [
  {
    label: 'Profile',
    icon: User,
    to: `/${role}/profile`,
  },
  {
    label: 'Settings',
    icon: Settings,
    to: `/${role}/settings`,
  },
  {
    label: 'Achievements',
    icon: Trophy,
    to: `/${role}/achievements`,
  },
]

export default function ProfileMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()
  const profile = useAuthStore((state) => state.profile)
  const { handleSignOut } = useAuth()

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleNavigate = (to) => {
    navigate(to)
    setOpen(false)
  }

  const handleLogout = async () => {
    setOpen(false)
    await handleSignOut()
  }

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
      >
        <img
          src={profile?.avatar_url || '/default-avatar.png'}
          alt="avatar"
          className="w-8 h-8 rounded-full object-cover border-2 border-blockly-purple/30"
        />
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* User info header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-3">
              <img
                src={profile?.avatar_url || '/default-avatar.png'}
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover border-2 border-blockly-purple/30"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{profile?.username}</p>
                <p className="text-xs text-gray-400 truncate">{profile?.email}</p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            {menuItems(profile?.role).map(({ label, icon: Icon, to }) => (
              <button
                key={label}
                onClick={() => handleNavigate(to)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blockly-purple transition-colors text-left"
              >
                <Icon className="w-4 h-4 shrink-0 text-gray-400" />
                {label}
              </button>
            ))}
          </div>

          {/* Logout — separated */}
          <div className="border-t border-gray-100 py-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors text-left"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}