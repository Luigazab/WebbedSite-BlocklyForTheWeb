import { supabase } from '../supabaseClient'

export const notificationService = {
  async getNotifications(userId, limit = 20) {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        from_user:profiles!notifications_from_user_id_fkey(username, avatar_url)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data
  },

  async getUnreadCount(userId) {
    const { count, error } = await supabase.from('notifications')
      .select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('is_read', false)
    if (error) throw error
    return count ?? 0
  },

  async getNotification(id) {
    const { data, error } = await supabase.from('notifications').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return data
  },

  async markAsRead(notificationId) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
    if (error) throw error
  },

  async markAllAsRead(userId) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
    if (error) throw error
  },

  subscribeToNotifications(userId, onNew) {
    return supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => onNew(payload.new)
      )
      .subscribe((status) => { if (status === 'SUBSCRIBED') onNew() })
  },
}
