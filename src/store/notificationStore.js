import { create } from 'zustand'
import { notificationService } from '../services/notification.service'

let request = 0
export const useNotificationStore = create((set, get) => ({
  notifications: [], unreadCount: 0, loading: false, error: null, userId: null, limit: 20, hasMore: false,
  reset: (userId = null) => {
    request++
    set({ notifications: [], unreadCount: 0, loading: false, error: null, userId, limit: 20, hasMore: false })
  },
  fetch: async (userId) => {
    if (!userId || get().userId !== userId) return
    const current = ++request
    const limit = get().limit
    set({ loading: true, error: null })
    try {
      const [rows, unreadCount] = await Promise.all([
        notificationService.getNotifications(userId, limit + 1),
        notificationService.getUnreadCount(userId),
      ])
      if (current === request) set({ notifications: rows.slice(0, limit), unreadCount, hasMore: rows.length > limit, loading: false })
    } catch {
      if (current === request) set({ loading: false, error: 'Could not load notifications. Please try again.' })
    }
  },
  loadMore: () => {
    if (get().loading) return
    set({ limit: get().limit + 20 })
    return get().fetch(get().userId)
  },
  markAsRead: async (id) => {
    const userId = get().userId
    await notificationService.markAsRead(id)
    await get().fetch(userId)
  },
  markAllAsRead: async () => {
    const userId = get().userId
    if (!userId) return
    await notificationService.markAllAsRead(userId)
    await get().fetch(userId)
  },
}))
