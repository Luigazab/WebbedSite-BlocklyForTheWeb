import { supabase } from '../supabaseClient'

export const notificationService = {
  async getNotifications(userId) {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        from_user:profiles!notifications_from_user_id_fkey(username, avatar_url)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
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

  // Realtime subscription — returns the channel so caller can remove it on cleanup
  subscribeToNotifications(userId, onNew) {
    return supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => onNew(payload.new)
      )
      .subscribe()
  },
}