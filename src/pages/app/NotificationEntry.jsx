import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router'
import { useAuthStore } from '../../store/authStore'
import { notificationService } from '../../services/notification.service'
import { notificationDestination } from '../../lib/notificationLinks'
import Loader from '../../components/layout/Loader'

export default function NotificationEntry() {
  const { user, profile, loading } = useAuthStore()
  const location = useLocation()
  if (loading) return <Loader />
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />
  return <OpenNotification key={`${user.id}:${location.pathname}`} role={profile?.role} />
}

function OpenNotification({ role }) {
  const { notificationId } = useParams()
  const navigate = useNavigate()
  const [message, setMessage] = useState(null)
  useEffect(() => {
    let active = true
    async function open() {
      try {
        const notification = await notificationService.getNotification(notificationId)
        if (!active) return
        if (!notification) { setMessage('This notification is unavailable for your account.'); return }
        // Opening the destination remains possible if marking read fails.
        try { await notificationService.markAsRead(notificationId) } catch { /* Retry from the bell later. */ }
        if (!active) return
        const target = notificationDestination(notification, role)
        if (target) navigate(target, { replace: true })
        else setMessage(notification.content || 'The content for this notification is no longer available.')
      } catch {
        if (active) setMessage('Could not open this notification. Please try again.')
      }
    }
    open()
    return () => { active = false }
  }, [notificationId, role, navigate])
  if (!message) return <Loader />
  return <main className="max-w-xl mx-auto p-8"><p role="status">{message}</p><Link className="underline" to={`/${role || 'student'}`}>Back to dashboard</Link></main>
}
