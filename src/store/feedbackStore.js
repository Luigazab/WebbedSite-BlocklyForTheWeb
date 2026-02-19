import { create } from 'zustand'
import { feedbackService } from '../services/feedback.service'

export const useFeedbackStore = create((set) => ({
  myFeedback:  [],
  allFeedback: [],
  loading: false,
  error: null,

  fetchMyFeedback: async (userId) => {
    set({ loading: true, error: null })
    try {
      const myFeedback = await feedbackService.getMyFeedback(userId)
      set({ myFeedback, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  fetchAllFeedback: async (filters) => {
    set({ loading: true, error: null })
    try {
      const allFeedback = await feedbackService.getAllFeedback(filters)
      set({ allFeedback, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  addFeedback: (item) =>
    set((state) => ({ myFeedback: [item, ...state.myFeedback] })),

  updateStatus: (id, status) =>
    set((state) => ({
      allFeedback: state.allFeedback.map((f) =>
        f.id === id ? { ...f, status } : f
      ),
    })),

  removeFeedback: (id) =>
    set((state) => ({
      allFeedback: state.allFeedback.filter((f) => f.id !== id),
    })),
}))