import { supabase } from '../supabaseClient'
import { createDefaultProjectFiles } from './projectfiles.service'

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
        type,
        created_at,
        updated_at,
        likes_count,
        views_count
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

  async createBlocksProject({ title, description = '', type = 'blocks' }) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id:        user.id,
        title,
        description,
        type,
        is_public:      false,
        updated_at:     new Date().toISOString()
      })
      .select()
      .single()

    if (projectError) throw projectError
    await createDefaultProjectFiles(project.id)
    return project
  },

  async getPublicProjectsByUser(userId) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .eq('is_public', true)
      .order('updated_at', { ascending: false })
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
  async updateProjectFileCode(fileId, code) {
    const { error } = await supabase
      .from('project_files')
      .update({
        code, 
        updated_at: new Date().toISOString(),
      })
      .eq('id', fileId)

    if (error) throw error
  }
}