// src/components/layout/EditorHeader.jsx
import { useState, useRef, useEffect } from 'react'
import { Menu, Home, FolderOpen, University, BookOpen, UserSquare2, Settings, Plus, Save, Download } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useAuthStore } from '../../store/authStore'

/**
 * Props:
 *  onNew()       — create a new project
 *  onSave()      — open save modal
 *  onLoad()      — open load modal
 *  projectTitle  — current project title shown beside the logo (optional, falls back to 'WebbedSite')
 */
const EditorHeader = ({ onNew, onSave, onLoad, projectTitle }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate       = useNavigate()
  const desktopMenuRef = useRef(null)
  const mobileMenuRef  = useRef(null)
  const profile        = useAuthStore((s) => s.profile)

  const menuItems = [
    { icon: Home,        label: 'Home',       href: `/${profile?.role}`            },
    { icon: FolderOpen,  label: 'Projects',   href: `/${profile?.role}/projects`   },
    { icon: University,  label: 'Classrooms', href: `/${profile?.role}/classrooms` },
    { icon: BookOpen,    label: 'Learn',      href: `/${profile?.role}/lessons`    },
    { icon: UserSquare2, label: 'Profile',    href: `/${profile?.role}/profile`    },
    { icon: Settings,    label: 'Settings',   href: `/${profile?.role}/settings`   },
  ]

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isDesktopClickOutside = desktopMenuRef.current && !desktopMenuRef.current.contains(event.target)
      const isMobileClickOutside  = mobileMenuRef.current  && !mobileMenuRef.current.contains(event.target)
      if (isDesktopClickOutside && isMobileClickOutside) setIsMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNavigation = (href) => {
    setIsMenuOpen(false)
    navigate(href)
  }

  // What to show beside the logo: project title if set, else app name
  const headerLabel = projectTitle?.trim() || 'WebbedSite'
  const isProjectTitle = Boolean(projectTitle?.trim())

  return (
    <header className="w-full bg-white border-b border-gray-200 relative z-99">

      {/* ── Desktop Layout ─────────────────────────────────── */}
      <div className="hidden lg:flex items-center justify-between px-6 py-3">

        {/* Left: hamburger + logo + title */}
        <div className="flex items-center space-x-3 relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </button>

          <img src="/anotherlogo.png" alt="Logo" className="w-auto h-12" />

          <div className="flex flex-col leading-tight">
            {isProjectTitle ? (
              <>
                <span className="text-xs text-gray-400 font-medium">WebbedSite</span>
                <span className="font-bold text-gray-800 text-base truncate max-w-64">{headerLabel}</span>
              </>
            ) : (
              <span className="font-semibold text-gray-800 text-lg">WebbedSite</span>
            )}
          </div>

          {/* Desktop Dropdown */}
          {isMenuOpen && (
            <div
              ref={desktopMenuRef}
              className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
            >
              {menuItems.map((item, index) => {
                const Icon = item.icon
                return (
                  <button
                    key={index}
                    onClick={() => handleNavigation(item.href)}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700 text-left"
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Right: action buttons */}
        <div className="flex gap-2">
          <button onClick={onNew}  className="btn flex items-center space-x-2 btn-lead">
            <Plus size={18} /><span>New</span>
          </button>
          <button onClick={onSave} className="btn flex items-center space-x-2 btn-secondary">
            <Save size={18} /><span>Save</span>
          </button>
          <button onClick={onLoad} className="btn flex items-center space-x-2 btn-primary">
            <Download size={18} /><span>Load</span>
          </button>
        </div>
      </div>

      {/* ── Mobile Layout ──────────────────────────────────── */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              <Menu size={24} />
            </button>
            <img src="/anotherlogo.png" alt="Logo" className="h-8" />
          </div>

          <div className="flex flex-col items-end leading-tight">
            {isProjectTitle ? (
              <>
                <span className="text-[10px] text-gray-400">WebbedSite</span>
                <span className="font-bold text-gray-700 text-sm truncate max-w-40">{headerLabel}</span>
              </>
            ) : (
              <span className="font-bold text-gray-700">WebbedSite</span>
            )}
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="absolute left-4 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
          >
            {menuItems.map((item, index) => {
              const Icon = item.icon
              return (
                <button
                  key={index}
                  onClick={() => handleNavigation(item.href)}
                  className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700 text-left"
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Mobile action buttons */}
        <div className="flex justify-center space-x-2 px-4 pb-3">
          <button onClick={onNew}  className="btn flex items-center space-x-1 bg-orange-600 text-white text-sm px-3 py-2 rounded-md font-semibold">
            <Plus size={16} /><span>New</span>
          </button>
          <button onClick={onSave} className="btn flex items-center space-x-1 bg-green-600 text-white text-sm px-3 py-2 rounded-md font-semibold">
            <Save size={16} /><span>Save</span>
          </button>
          <button onClick={onLoad} className="btn flex items-center space-x-1 bg-blue-600 text-white text-sm px-3 py-2 rounded-md font-semibold">
            <Download size={16} /><span>Load</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default EditorHeader