import { supabase } from '../supabaseClient'

export const likesService = {
  async hasLiked(projectId, userId) {
    const { data, error } = await supabase
      .from('project_likes')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .maybeSingle()

    if (error) throw error
    return !!data
  },

  async getUserLikesForProjects(projectIds, userId) {
    if (!projectIds.length) return []
    const { data, error } = await supabase
      .from('project_likes')
      .select('project_id')
      .eq('user_id', userId)
      .in('project_id', projectIds)

    if (error) throw error
    return data?.map(like => like.project_id) || []
  },

  async toggleLike(projectId, userId) {
    const hasLiked = await this.hasLiked(projectId, userId)

    if (hasLiked) {
      const { error } = await supabase
        .from('project_likes')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', userId)
      if (error) throw error

      // Use rpc to safely decrement
      await supabase.rpc('decrement_likes', { project_id: projectId })
      return false
    } else {
      const { error } = await supabase
        .from('project_likes')
        .insert({ project_id: projectId, user_id: userId })
      if (error) throw error

      await supabase.rpc('increment_likes', { project_id: projectId })
      return true
    }
  },

  // Get fresh likes_count for a project
  async getLikesCount(projectId) {
    const { data, error } = await supabase
      .from('projects')
      .select('likes_count')
      .eq('id', projectId)
      .single()
    if (error) throw error
    return data.likes_count
  }
}