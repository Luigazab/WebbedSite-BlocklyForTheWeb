import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { useNotificationStore } from '../store/notificationStore'
import { notificationService } from '../services/notification.service'
import { supabase } from '../supabaseClient'

export function useNotifications() {
  const userId = useAuthStore((state) => state.user?.id)
  const { notifications, unreadCount, loading, fetch, markAsRead, markAllAsRead, addNotification } =
    useNotificationStore()

  // Fetch on mount + subscribe to realtime inserts
  useEffect(() => {
    if (!userId) return

    fetch(userId)

    const channel = notificationService.subscribeToNotifications(userId, (newNotification) => {
      addNotification(newNotification)
    })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead: () => markAllAsRead(userId),
  }
}