import { useAuthStore } from '../../../store/authStore'
import ProfileMenu from '../../../components/ui/ProfileMenu'
import NotificationPanel from '../../../components/ui/NotificationPanel'

export default function AdminNavbar() {
  const profile = useAuthStore((state) => state.profile)

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shrink-0 z-20">
      <div className='leading-tightest'>
        <p className="text-sm text-muted-foreground">
          Admin Dashboard
        </p>
        <span className="font-semibold text-foreground">{profile?.username}</span>
      </div>

      <div className="flex items-center gap-1">
        <NotificationPanel />
        <ProfileMenu />
      </div>
    </header>
  )
}