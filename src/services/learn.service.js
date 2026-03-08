import { supabase } from '../supabaseClient'

export const learnService = {
  // ─── Categories ─────────────────────────────────────────
  
  async getCategories() {
    const { data, error } = await supabase
      .from('learn_categories')
      .select('*')
      .order('order_index', { ascending: true })
    if (error) throw error
    return data
  },

  async getCategoryWithTopics(categoryId) {
    const { data, error } = await supabase
      .from('learn_categories')
      .select(`
        *,
        topics:learn_topics(*)
      `)
      .eq('id', categoryId)
      .single()
    if (error) throw error
    return data
  },

  // ─── Topics ─────────────────────────────────────────────
  
  async getTopicById(topicId) {
    const { data, error } = await supabase
      .from('learn_topics')
      .select(`
        *,
        category:learn_categories(*)
      `)
      .eq('id', topicId)
      .single()
    if (error) throw error
    return data
  },

  // ─── Progress ───────────────────────────────────────────
  
  async updateTopicProgress(studentId, topicId, progressPercentage) {
    const completed_at = progressPercentage >= 100 ? new Date().toISOString() : null

    const { data, error } = await supabase
      .from('learn_topic_progress')
      .upsert({
        student_id: studentId,
        topic_id: topicId,
        progress_percentage: progressPercentage,
        completed_at,
        last_accessed: new Date().toISOString(),
      })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getStudentProgress(studentId) {
    const { data, error } = await supabase
      .from('learn_topic_progress')
      .select('*')
      .eq('student_id', studentId)
    if (error) throw error
    return data || []
  },
}