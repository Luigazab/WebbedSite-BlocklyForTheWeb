import { useAuthStore } from '../../../store/authStore'
import ProfileMenu from '../../../components/ui/ProfileMenu'
import NotificationPanel from '../../../components/ui/NotificationPanel'

export default function AdminNavbar() {
  const profile = useAuthStore((state) => state.profile)

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20">
      <div>
        <p className="text-sm text-slate-500">
          Welcome back,{' '}
          <span className="font-semibold text-slate-800">{profile?.username}</span>
        </p>
      </div>

      <div className="flex items-center gap-1">
        <NotificationPanel />
        <ProfileMenu />
      </div>
    </header>
  )
}