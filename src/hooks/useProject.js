import { toast } from 'sonner'
import { useProjectStore } from '../store/projectStore'

export function useProject() {
  const store = useProjectStore()

  const fetchProjects = async (opts) => {
    try {
      return await store.fetchProjects(opts)
    } catch (err) {
      toast.error(err.message || 'Failed to load projects.')
      return []
    }
  }

  const fetchProject = async (projectId) => {
    if (!projectId) return null
    try {
      return await store.fetchProject(projectId)
    } catch (err) {
      toast.error(err.message || 'Failed to load project.')
      return null
    }
  }

  const handleCreateProject = async ({ title, description, type = 'block' }) => {
    try {
      const project = await store.createProject({ title, description, type })
      toast.success(`Project "${project.title}" created!`)
      return project
    } catch (err) {
      toast.error(err.message || 'Failed to create project.')
      throw err
    }
  }

  const handleUpdateProject = async (projectId, updates) => {
    try {
      const project = await store.updateProject(projectId, updates)
      toast.success('Project saved!')
      return project
    } catch (err) {
      toast.error(err.message || 'Failed to save project.')
      throw err
    }
  }

  const handleDeleteProject = async (projectId, title) => {
    try {
      await store.deleteProject(projectId)
      toast.info(`"${title || 'Project'}" deleted.`)
    } catch (err) {
      toast.error(err.message || 'Failed to delete project.')
      throw err
    }
  }

  const handleToggleVisibility = async (projectId, isPublic) => {
    try {
      return await store.toggleVisibility(projectId, isPublic)
    } catch (err) {
      toast.error(err.message || 'Failed to update visibility.')
      throw err
    }
  }

  return {
    projects: store.projects,
    currentProject: store.currentProject,
    loading: store.loading,
    saving: store.saving,
    deleting: store.deleting,
    error: store.error,

    fetchProjects,
    fetchProject,
    handleCreateProject,
    handleUpdateProject,
    handleDeleteProject,
    handleToggleVisibility,
    setCurrentProject: store.setCurrentProject,
    clearCurrentProject: store.clearCurrentProject,
  }
}