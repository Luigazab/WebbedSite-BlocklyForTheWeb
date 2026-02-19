import { Navigate, Outlet } from 'react-router'
import { useAuthStore } from '../../store/authStore'
import Loader from './Loader'

const ROLE_HOME = {
  student: '/student',
  teacher: '/teacher',
  admin:   '/admin',
}

export function PublicRoute() {
  const { user, profile, loading } = useAuthStore()

  // Still initializing — don't flash the login page to logged-in users
  if (loading) return <Loader />

  // Already logged in → send them home
  if (user && profile) {
    const destination = ROLE_HOME[profile.role] ?? '/login'
    return <Navigate to={destination} replace />
  }

  return <Outlet />
}