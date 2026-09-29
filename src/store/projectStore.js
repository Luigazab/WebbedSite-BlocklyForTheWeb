import { create } from 'zustand'
import { projectService } from '@/services/project.service'

export const useProjectStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  loading: false,
  saving: false,
  deleting: false,
  error: null,

  fetchProjects: async ({ filter = 'All', sortBy = 'Recent' } = {}) => {
    set({ loading: true, error: null })
    try {
      const projects = await projectService.getUserProjects({ filter, sortBy })
      set({ projects, loading: false })
      return projects
    } catch (err) {
      set({ error: err.message, loading: false })
      throw err
    }
  },

  fetchProject: async (projectId) => {
    set({ loading: true, error: null })
    try {
      const project = await projectService.getProjectById(projectId)
      set({ currentProject: project, loading: false })
      return project
    } catch (err) {
      set({ error: err.message, loading: false })
      throw err
    }
  },

  createProject: async ({ title, description, type = 'block' }) => {
    set({ saving: true, error: null })
    try {
      const project = await projectService.createProject({ title, description, type })
      set((s) => ({
        projects: [project, ...s.projects],
        currentProject: project,
        saving: false,
      }))
      return project
    } catch (err) {
      set({ error: err.message, saving: false })
      throw err
    }
  },

  updateProject: async (projectId, updates) => {
    set({ saving: true, error: null })
    try {
      const updated = await projectService.updateProject(projectId, updates)
      set((s) => ({
        projects: s.projects.map((p) => (p.id === projectId ? updated : p)),
        currentProject: s.currentProject?.id === projectId ? updated : s.currentProject,
        saving: false,
      }))
      return updated
    } catch (err) {
      set({ error: err.message, saving: false })
      throw err
    }
  },

  deleteProject: async (projectId) => {
    set({ deleting: true, error: null })
    try {
      await projectService.deleteProject(projectId)
      set((s) => ({
        projects: s.projects.filter((p) => p.id !== projectId),
        currentProject: s.currentProject?.id === projectId ? null : s.currentProject,
        deleting: false,
      }))
    } catch (err) {
      set({ error: err.message, deleting: false })
      throw err
    }
  },

  toggleVisibility: async (projectId, isPublic) => {
    try {
      const updated = await projectService.toggleVisibility(projectId, isPublic)
      set((s) => ({
        projects: s.projects.map((p) => (p.id === projectId ? updated : p)),
        currentProject: s.currentProject?.id === projectId ? updated : s.currentProject,
      }))
      return updated
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  setCurrentProject: (project) => set({ currentProject: project }),
  clearCurrentProject: () => set({ currentProject: null }),
}))