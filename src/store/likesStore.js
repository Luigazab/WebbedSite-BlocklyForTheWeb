import { create } from 'zustand'
import { likesService } from '../services/likes.service'

export const useLikesStore = create((set, get) => ({
  likedProjects: new Set(), // Set of project IDs that user has liked
  loading: false,
  error: null,

  // Load user's likes for a list of projects
  loadUserLikes: async (projectIds, userId) => {
    if (!userId || projectIds.length === 0) return
    
    set({ loading: true, error: null })
    try {
      const likedProjectIds = await likesService.getUserLikesForProjects(projectIds, userId)
      set({ likedProjects: new Set(likedProjectIds), loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  // Toggle like for a project
  toggleLike: async (projectId, userId) => {
    try {
      const isLiked = await likesService.toggleLike(projectId, userId)
      
      const likedProjects = new Set(get().likedProjects)
      if (isLiked) {
        likedProjects.add(projectId)
      } else {
        likedProjects.delete(projectId)
      }
      
      set({ likedProjects })
      return isLiked
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  // Check if project is liked
  isLiked: (projectId) => {
    return get().likedProjects.has(projectId)
  }
}))