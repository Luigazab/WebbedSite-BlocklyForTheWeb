import ThemeSelect from '../common/ThemeSelect'
import { useState, useRef, useEffect } from 'react'
import { Menu, Home, FolderOpen, University, Settings, Plus, Save, Download } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { useAuthStore } from '../../store/authStore'
import { TourHelpButton } from '../tour/EditorTour'
import BackButton from '#components/common/BackButton'

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
    { icon: Settings,    label: 'Settings',   href: `/${profile?.role}/settings`   },
  ]

  useEffect(() => {
  const handleClickOutside = (event) => {
    if (!isMenuOpen) return;

    const desktopMenu = desktopMenuRef.current;
    const mobileMenu  = mobileMenuRef.current;

    const isDesktopOpen = window.innerWidth >= 1024;
    const activeMenu = isDesktopOpen ? desktopMenu : mobileMenu;

    if (activeMenu && !activeMenu.contains(event.target)) {
      setIsMenuOpen(false);
    }
  };
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, [isMenuOpen]);

  const handleNavigation = (href) => {
    setIsMenuOpen(false)
    navigate(href)
  }

  // What to show beside the logo: project title if set, else app name
  const headerLabel = projectTitle?.trim() || 'WebbedSite'
  const isProjectTitle = Boolean(projectTitle?.trim())

  return (
    <header data-tour="editor-header" className="w-full relative z-99">

      {/* ── Desktop Layout ─────────────────────────────────── */}
      <div className="hidden lg:flex items-center justify-between px-4 py-2.5">

        {/* Left: hamburger + logo + title */}
        <div className="flex items-center space-x-3 relative">

          <Link to="/"><img src="/icon.png" alt="icon image" className='w-8 h-8' /></Link>
          <BackButton />
          <span className="text-muted-foreground">/</span>
          <div className="flex flex-col leading-tight">
            {isProjectTitle ? (
              <>
                <span className="text-xs text-muted-foreground font-medium">WebbedSite</span>
                <span className="font-bold text-foreground text-base truncate max-w-64">{headerLabel}</span>
              </>
            ) : (
              <span className="font-semibold text-foreground text-lg">WebbedSite</span>
            )}
          </div>

          {/* Desktop Dropdown */}
          {isMenuOpen && (
            <div
              ref={desktopMenuRef}
              className="absolute top-full left-0 mt-2 w-56 bg-card rounded-lg shadow-lg border border-border py-2 z-50"
            >
              {menuItems.map((item, index) => {
                const Icon = item.icon
                return (
                  <button
                    key={index}
                    onClick={() => handleNavigation(item.href)}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-muted transition-colors text-foreground text-left"
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
        <div className="flex gap-2" data-tour="file-actions">
          <button onClick={onNew}  className="btn flex items-center space-x-2 btn-lead">
            <Plus size={15} /><span>New</span>
          </button>
          <button onClick={onSave}  data-tour="save-btn" className="btn flex items-center space-x-2 btn-secondary">
            <Save size={15} /><span>Save</span>
          </button>
          <button onClick={onLoad} className="btn flex items-center space-x-2 btn-primary">
            <Download size={15} /><span>Load</span>
          </button>
        </div>
        <ThemeSelect compact />
        <TourHelpButton/>
      </div>

      {/* ── Mobile Layout ──────────────────────────────────── */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Toggle menu"
            >
              <Menu size={24} />
            </button>
            <img src="/anotherlogo.png" alt="Logo" className="h-8" />
          </div>

          <div className="flex flex-col items-end leading-tight">
            {isProjectTitle ? (
              <>
                <span className="text-[10px] text-muted-foreground">WebbedSite</span>
                <span className="font-bold text-foreground text-sm truncate max-w-40">{headerLabel}</span>
              </>
            ) : (
              <span className="font-bold text-foreground">WebbedSite</span>
            )}
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="absolute left-4 mt-1 w-56 bg-card rounded-lg shadow-lg border border-border py-2 z-50"
          >
            {menuItems.map((item, index) => {
              const Icon = item.icon
              return (
                <button
                  key={index}
                  onClick={() => handleNavigation(item.href)}
                  className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-muted transition-colors text-foreground text-left"
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Mobile action buttons */}
        <div className="flex flex-wrap justify-center gap-2 px-4 pb-3">
          <ThemeSelect compact />
          <button onClick={onNew}  className="btn flex items-center space-x-1 btn-lead text-sm px-3 py-2 rounded-md font-semibold">
            <Plus size={16} /><span>New</span>
          </button>
          <button onClick={onSave} className="btn flex items-center space-x-1 btn-secondary text-sm px-3 py-2 rounded-md font-semibold">
            <Save size={16} /><span>Save</span>
          </button>
          <button onClick={onLoad} className="btn flex items-center space-x-1 btn-primary text-sm px-3 py-2 rounded-md font-semibold">
            <Download size={16} /><span>Load</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default EditorHeader
