import { Navigate, Outlet } from 'react-router'
import { useAuthStore } from '../../store/authStore'
import Loader from './Loader'

const ROLE_HOME = {
  student: '/student',
  teacher: '/teacher',
  admin:   '/admin',
}

export function ProtectedRoute({ allowedRole }) {
  const { user, profile, loading } = useAuthStore()

  if (loading) return <Loader />
  if (!user) return <Navigate to="/login" replace />

  if (profile?.role !== allowedRole) {
    const home = ROLE_HOME[profile?.role] ?? '/login'
    return <Navigate to={home} replace />
  }
  return <Outlet />
}
