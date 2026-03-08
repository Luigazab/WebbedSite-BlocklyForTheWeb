import { supabase } from '../supabaseClient'

export const commentsService = {
  async getProjectComments(projectId) {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          avatar_url
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async addComment(projectId, content) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Must be logged in to comment')

    const { data, error } = await supabase
      .from('comments')
      .insert({
        project_id: projectId,
        user_id: user.id,
        content
      })
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          avatar_url
        )
      `)
      .single()

    if (error) throw error
    
    return data
  },

  async deleteComment(commentId) {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)

    if (error) throw error
  }
}