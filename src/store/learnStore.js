import { create } from 'zustand'
import { learnService } from '../services/learn.service'

export const useLearnStore = create((set) => ({
  categories: [],
  currentCategory: null,
  currentTopic: null,
  studentProgress: {},
  loading: false,
  error: null,

  // ─── Categories ─────────────────────────────────────────

  fetchCategories: async () => {
    set({ loading: true, error: null })
    try {
      const categories = await learnService.getCategories()
      set({ categories, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  fetchCategoryWithTopics: async (categoryId) => {
    set({ loading: true, error: null })
    try {
      const category = await learnService.getCategoryWithTopics(categoryId)
      set({ currentCategory: category, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  // ─── Topics ─────────────────────────────────────────────

  fetchTopic: async (topicId) => {
    set({ loading: true, error: null })
    try {
      const topic = await learnService.getTopicById(topicId)
      set({ currentTopic: topic, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  // ─── Progress Tracking ──────────────────────────────────

  fetchStudentProgress: async (studentId) => {
    try {
      const progress = await learnService.getStudentProgress(studentId)
      const progressMap = progress.reduce((acc, p) => {
        acc[p.topic_id] = p
        return acc
      }, {})
      set({ studentProgress: progressMap })
    } catch (err) {
      set({ error: err.message })
    }
  },

  updateTopicProgress: async (studentId, topicId, progressPercentage) => {
    try {
      const progress = await learnService.updateTopicProgress(
        studentId,
        topicId,
        progressPercentage
      )
      set((state) => ({
        studentProgress: {
          ...state.studentProgress,
          [topicId]: progress,
        },
      }))
      return progress
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  getTopicProgress: (topicId) => {
    const state = useLearnStore.getState()
    return state.studentProgress[topicId] || { progress_percentage: 0 }
  },
}))