import { supabase } from '../supabaseClient'

export const feedbackService = {
  // ─── Student / Teacher ────────────────────────────────

  async submitFeedback(payload) {
    // payload: { sender_id, role, title, message, category }
    const { data, error } = await supabase
      .from('feedback')
      .insert({
        user_id: payload.sender_id,
        title:      payload.title,
        message:    payload.message,
        type:       payload.category,
        status:     'open',
      })
      .select()
      .single()
    if (error) throw error
    return Array.isArray(data) ? data.map(row => ({ ...row, category: row.type })) : data
  },

  async getMyFeedback(userId) {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return Array.isArray(data) ? data.map(row => ({ ...row, category: row.type })) : data
  },

  // ─── Admin ────────────────────────────────────────────

  async getAllFeedback(filters = {}) {
    let query = supabase
      .from('feedback')
      .select(`
        *,
        sender:profiles!feedback_user_id_fkey(id, username, email, avatar_url, role)
      `)
      .order('created_at', { ascending: false })

    if (filters.status)   query = query.eq('status', filters.status)
    if (filters.category) query = query.eq('type', filters.category)

    const { data, error } = await query
    if (error) throw error
    return Array.isArray(data) ? data.map(row => ({ ...row, category: row.type })) : data
  },

  async updateFeedbackStatus(feedbackId, status) {
    const { data, error } = await supabase
      .from('feedback')
      .update({ status })
      .eq('id', feedbackId)
      .select()
      .single()
    if (error) throw error
    return Array.isArray(data) ? data.map(row => ({ ...row, category: row.type })) : data
  },

  async deleteFeedback(feedbackId) {
    const { error } = await supabase
      .from('feedback')
      .delete()
      .eq('id', feedbackId)
    if (error) throw error
  },
}