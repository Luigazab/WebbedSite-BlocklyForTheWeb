import { supabase } from '../supabaseClient'

export const projectService = {
  async getUserProjects({ filter = 'All', sortBy = 'Recent' } = {}) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    let query = supabase
      .from('projects')
      .select(`
        id,
        title,
        description,
        thumbnail_url,
        is_public,
        created_at,
        updated_at,
        likes_count,
        views_count,
        generated_html,
        blocks_json 
      `)
      .eq('user_id', user.id)

    if (filter === 'Public')  query = query.eq('is_public', true)
    if (filter === 'Private') query = query.eq('is_public', false)

    if (sortBy === 'Recent')    query = query.order('updated_at', { ascending: false })
    if (sortBy === 'Name')      query = query.order('title',      { ascending: true  })
    if (sortBy === 'Most Liked') query = query.order('likes_count', { ascending: false })

    const { data, error } = await query
    if (error) throw error
    return data
  },

  async createBlocksProject({ title, description = '' }) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id:        user.id,
        title,
        description,
        blocks_json:    {},          // empty workspace
        generated_html: '',
        is_public:      false,
        updated_at:     new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async toggleVisibility(projectId, isPublic) {
    const { data, error } = await supabase
      .from('projects')
      .update({ is_public: isPublic, updated_at: new Date().toISOString() })
      .eq('id', projectId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async deleteProject(projectId) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
    if (error) throw error
  },
  async updateProjectGeneratedHtml(projectId, generatedHtml) {
    const { error } = await supabase
      .from('projects')
      .update({ 
        generated_html: generatedHtml,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)

    if (error) throw error
  }
}