import { create } from 'zustand'
import { commentsService } from '../services/comments.service'

export const useCommentsStore = create((set, get) => ({
  comments: [],
  loading: false,
  error: null,

  loadComments: async (projectId) => {
    set({ loading: true, error: null })
    try {
      const comments = await commentsService.getProjectComments(projectId)
      set({ comments, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  addComment: async (projectId, content) => {
    try {
      const newComment = await commentsService.addComment(projectId, content)
      set({ comments: [newComment, ...get().comments] })
      return newComment
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  deleteComment: async (commentId) => {
    try {
      await commentsService.deleteComment(commentId)
      set({ comments: get().comments.filter(c => c.id !== commentId) })
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  }
}))