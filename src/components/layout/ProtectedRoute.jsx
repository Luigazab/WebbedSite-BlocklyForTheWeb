import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuthStore } from '../../store/authStore'
import Loader from './Loader'
import AccountLoadError from './AccountLoadError'

const ROLE_HOME = {
  student: '/student',
  teacher: '/teacher',
  admin:   '/admin',
}

export function ProtectedRoute({ allowedRole }) {
  const { user, profile, loading, profileError, recovery } = useAuthStore()
  const location = useLocation()

  if (loading) return <Loader />
  if (recovery) return <Navigate to="/update-password" replace />
  if (!user) return <Navigate to="/login" replace />
  if (profileError) return <AccountLoadError />

  if (profile?.role !== allowedRole) {
    const home = ROLE_HOME[profile?.role] ?? '/login'
    return <Navigate to={home} replace />
  }
  if (allowedRole === 'student' && !profile.onboarding_completed_at && location.pathname !== '/student/welcome') {
    return <Navigate to="/student/welcome" replace />
  }
  if (allowedRole === 'student' && profile.onboarding_completed_at && location.pathname === '/student/welcome') {
    return <Navigate to="/student" replace />
  }
  return <Outlet />
}
