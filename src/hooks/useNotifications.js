import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { useNotificationStore } from '../store/notificationStore'
import { notificationService } from '../services/notification.service'
import { supabase } from '../supabaseClient'

export function useNotifications() {
  const userId = useAuthStore((state) => state.user?.id)
  const state = useNotificationStore()
  const { fetch, reset } = state
  useEffect(() => {
    reset(userId)
    if (!userId) return
    const refresh = () => fetch(userId)
    refresh()
    const channel = notificationService.subscribeToNotifications(userId, refresh)
    window.addEventListener('focus', refresh)
    const timer = window.setInterval(refresh, 60000)
    return () => {
      supabase.removeChannel(channel)
      window.removeEventListener('focus', refresh)
      window.clearInterval(timer)
      reset()
    }
  }, [userId, fetch, reset])
  return { ...state, retry: () => fetch(userId) }
}
