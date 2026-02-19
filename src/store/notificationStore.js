import { create } from 'zustand'
import { notificationService } from '../services/notification.service'

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetch: async (userId) => {
    set({ loading: true })
    try {
      const notifications = await notificationService.getNotifications(userId)
      const unreadCount = notifications.filter((n) => !n.is_read).length
      set({ notifications, unreadCount, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  markAsRead: async (notificationId) => {
    await notificationService.markAsRead(notificationId)
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notificationId ? { ...n, is_read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }))
  },

  markAllAsRead: async (userId) => {
    await notificationService.markAllAsRead(userId)
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    }))
  },

  // Called from realtime subscription
  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }))
  },
}))