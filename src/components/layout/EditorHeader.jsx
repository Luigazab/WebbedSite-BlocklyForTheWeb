import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { Menu, X, Home, FolderOpen, University, Settings, Plus, Save, Download } from 'lucide-react'
import ThemeSelect from '../common/ThemeSelect'
import BackButton from '#components/common/BackButton'
import { useAuthStore } from '../../store/authStore'
import { TourHelpButton } from '../tour/EditorTour'
import { Button } from '#components/ui/button'

const EditorHeader = ({ onNew, onSave, onLoad, projectTitle }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()
  const menuRef = useRef(null)
  const profile = useAuthStore((s) => s.profile)

  const menuItems = [
    { icon: Home, label: 'Home', href: `/${profile?.role}` },
    { icon: FolderOpen, label: 'Projects', href: `/${profile?.role}/projects` },
    { icon: University, label: 'Classrooms', href: `/${profile?.role}/classrooms` },
    { icon: Settings, label: 'Settings', href: `/${profile?.role}/settings` },
  ]

  // Close on outside touch or click
  useEffect(() => {
    const handleOutside = (event) => {
      if (isMenuOpen && menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('touchstart', handleOutside)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('touchstart', handleOutside)
    }
  }, [isMenuOpen])

  const handleNavigation = (href) => {
    setIsMenuOpen(false)
    navigate(href)
  }

  const headerLabel = projectTitle?.trim() || 'Untitled Project'
  const isProjectTitle = Boolean(projectTitle?.trim())

  return (
    <>
      <header
        data-tour="editor-header"
        className="w-full border-b border-border bg-sidebar px-3 py-2 shrink-0 z-30"
      >
        <div className="flex items-center justify-between gap-2 max-w-full">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Logo and Back button */}
            <Link to="/" className="shrink-0 flex items-center">
              <img src="/icon.png" alt="Logo" className="w-7 h-7 object-contain" />
            </Link>
            
            <BackButton />

            <span className="text-muted-foreground/40 hidden sm:inline">/</span>

            {/* Truncated Project Title */}
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-[10px] text-muted-foreground font-medium hidden sm:inline">
                WebbedSite
              </span>
              <span
                title={headerLabel}
                className="font-bold text-foreground text-xs sm:text-sm truncate max-w-[130px] sm:max-w-[200px] md:max-w-xs"
              >
                {headerLabel}
              </span>
            </div>
          </div>

          {/* ── Center / Right Desktop Action Buttons (lg+) ──── */}
          <div className="hidden lg:flex items-center gap-2" data-tour="file-actions">
            <Button onClick={onNew} variant='secondary'>
              <Plus size={14} />
              <span>New</span>
            </Button>
            <Button onClick={onLoad} variant='primary'>
              <Download size={14} />
              <span>Load</span>
            </Button>
            <Button onClick={onSave} data-tour="save-btn" variant='success'>
              <Save size={14} />
              <span>Save</span>
            </Button>

            <div className="h-4 w-px bg-border mx-1" />

            <ThemeSelect compact iconOnly />
            <TourHelpButton />
          </div>

          {/* ── Mobile Right Actions (Compact Single Row) ───── */}
          <div className="flex lg:hidden items-center gap-1.5 shrink-0">
            {/* Always accessible Primary Save Button */}
            <Button
              onClick={onSave}
              data-tour="save-btn"
              variant='success'
              size='sm'
            >
              <Save size={14} />
              <span>Save</span>
            </Button>

            <div className="scale-90 origin-right">
              <ThemeSelect iconOnly />
            </div>
          </div>
        </div>
      </header>

      {/* ── Backdrop for Mobile Menu ─────────────────────────── */}
      {isMenuOpen && (
        <div
          role="presentation"
          onClick={() => setIsMenuOpen(false)}
          className="fixed inset-0 z-99 bg-black/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* ── Mobile Drawer Dropdown Menu ──────────────────────── */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          className="fixed left-3 top-14 z-100 w-64 rounded-xl border border-border bg-card p-2 shadow-2xl lg:hidden flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Project File Actions inside Menu */}
          <div className="px-2 py-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Project Actions
          </div>

          <button
            onClick={() => {
              setIsMenuOpen(false)
              onNew?.()
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted transition-colors text-left"
          >
            <Plus size={16} className="text-emerald-500" />
            <span className="font-medium">New Project</span>
          </button>

          <button
            onClick={() => {
              setIsMenuOpen(false)
              onLoad?.()
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted transition-colors text-left"
          >
            <Download size={16} className="text-blue-500" />
            <span className="font-medium">Load from Device / Cloud</span>
          </button>

          <div className="my-1 border-t border-border" />

          {/* App Navigation */}
          <div className="px-2 py-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Navigate
          </div>

          {menuItems.map((item, index) => {
            const Icon = item.icon
            return (
              <button
                key={index}
                onClick={() => handleNavigation(item.href)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted transition-colors text-left"
              >
                <Icon size={16} className="text-muted-foreground" />
                <span>{item.label}</span>
              </button>
            )
          })}

          <div className="my-1 border-t border-border" />

          {/* Footer Utility in Menu */}
          <div className="px-2 py-1 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Editor Tour</span>
            <TourHelpButton />
          </div>
        </div>
      )}
    </>
  )
}

export default EditorHeader