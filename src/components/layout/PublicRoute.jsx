import { Navigate, Outlet, useLocation } from 'react-router'
import { notificationReturnPath } from '../../lib/notificationLinks'
import { useAuthStore } from '../../store/authStore'
import Loader from './Loader'
import AccountLoadError from './AccountLoadError'

const ROLE_HOME = {
  student: '/student',
  teacher: '/teacher',
  admin:   '/admin',
}

export function PublicRoute() {
  const location = useLocation()
  const { user, profile, loading, profileError, recovery } = useAuthStore()

  if (loading) return <Loader />
  if (recovery) return <Navigate to="/update-password" replace />
  if (user && profileError) return <AccountLoadError />

  if (user && profile) {
    const destination = notificationReturnPath(location.search) ?? ROLE_HOME[profile.role] ?? '/login'
    return <Navigate to={destination} replace />
  }

  return <Outlet />
}
