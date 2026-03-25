import { create } from 'zustand'
import {
  fetchLearnCategories,
  fetchLearnTopics,
  fetchTopicProgress,
  upsertTopicProgress,
} from '../services/learnService'

export const useLearnStore = create((set, get) => ({
  categories: [],
  topics: [],
  progress: [],
  loading: false,
  error: null,

  // ─── Fetch ────────────────────────────────────────────────────────────────

  fetchAll: async (studentId) => {
    set({ loading: true, error: null })
    try {
      const [categories, topics, progress] = await Promise.all([
        fetchLearnCategories(),
        fetchLearnTopics(),
        studentId ? fetchTopicProgress(studentId) : Promise.resolve([]),
      ])
      set({ categories, topics, progress, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  refreshProgress: async (studentId) => {
    try {
      const progress = await fetchTopicProgress(studentId)
      set({ progress })
    } catch (err) {
      set({ error: err.message })
    }
  },

  // ─── Progress mutations ───────────────────────────────────────────────────

  markTopicStarted: async (studentId, topicId) => {
    try {
      const row = await upsertTopicProgress(studentId, topicId, { progress_percentage: 0 })
      set((state) => ({
        progress: [...state.progress.filter((p) => p.topic_id !== topicId), row],
      }))
      return row
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  markTopicComplete: async (studentId, topicId) => {
    try {
      const row = await upsertTopicProgress(studentId, topicId, {
        progress_percentage: 100,
        completed_at: new Date().toISOString(),
      })
      set((state) => ({
        progress: [...state.progress.filter((p) => p.topic_id !== topicId), row],
      }))
      return row
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  // ─── Derived helpers ──────────────────────────────────────────────────────

  getProgressFor: (topicId) =>
    get().progress.find((p) => p.topic_id === topicId) ?? null,

  isTopicCompleted: (topicId) => {
    const p = get().progress.find((p) => p.topic_id === topicId)
    return !!p?.completed_at
  },

  /**
   * Students: locked if prerequisite exists and hasn't been completed.
   * Pass isTeacher=true to always return unlocked (teachers browse freely).
   */
  isTopicUnlocked: (topic, isTeacher = false) => {
    if (isTeacher) return true
    if (!topic.prerequisite_topic) return true
    return get().isTopicCompleted(topic.prerequisite_topic)
  },

  getTopicsForCategory: (categoryId) =>
    get().topics.filter((t) => t.category_id === categoryId),
}))