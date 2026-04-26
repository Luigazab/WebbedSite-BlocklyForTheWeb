import { create } from 'zustand'
import {
  fetchLearnCategories,
  fetchLearnTopics,
  fetchTopicProgress,
  upsertTopicProgress,
  fetchLearnTopicById,
  fetchSingleTopicProgress,
  fetchLearnTopicsForManagement,
  fetchTopicStudentProgress,
  updateTopicPrerequisite,
  removeLearnTopic,
  updateTopicOrder,
} from '../services/learnService'

export const useLearnStore = create((set, get) => ({
  categories: [],
  topics: [],
  progress: [],       // learn_topic_progress rows for current student
  currentTopic: null, // full topic + lesson for viewer
  currentTopicProgress: null,
  loading: false,
  topicLoading: false,
  error: null,

  // ─── Public learn page ────────────────────────────────────────────────────

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

  // ─── Topic viewer ─────────────────────────────────────────────────────────

  fetchTopic: async (topicId, studentId) => {
    set({ topicLoading: true, error: null })
    try {
      const [topic, progress] = await Promise.all([
        fetchLearnTopicById(topicId),
        studentId ? fetchSingleTopicProgress(studentId, topicId) : Promise.resolve(null),
      ])
      set({ currentTopic: topic, currentTopicProgress: progress, topicLoading: false })
    } catch (err) {
      set({ error: err.message, topicLoading: false })
    }
  },

  clearCurrentTopic: () => set({ currentTopic: null, currentTopicProgress: null }),

  updateCurrentTopicProgress: async (studentId, topicId, updates) => {
    try {
      const row = await upsertTopicProgress(studentId, topicId, updates)
      set({ currentTopicProgress: row })
      // Also update the progress array used by the learn page
      set((state) => ({
        progress: [
          ...state.progress.filter((p) => p.topic_id !== topicId),
          row,
        ],
      }))
      return row
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  // ─── Progress mutations (learn page) ─────────────────────────────────────

  markTopicStarted: async (studentId, topicId) => {
    try {
      const row = await upsertTopicProgress(studentId, topicId, { progress_percentage: 0 })
      set((state) => ({
        progress: [...state.progress.filter((p) => p.topic_id !== topicId), row],
        currentTopicProgress: row,
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
        currentTopicProgress: row,
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

  isTopicUnlocked: (topic, isTeacher = false) => {
    if (isTeacher) return true
    if (!topic.prerequisite_topic) return true
    return get().isTopicCompleted(topic.prerequisite_topic)
  },

  getTopicsForCategory: (categoryId) =>
    get().topics.filter((t) => t.category_id === categoryId),

  // ─── Management (teacher) ─────────────────────────────────────────────────

  managementTopics: [],
  managementLoading: false,
  topicStudentProgress: [],   // [{student, progress:[]}]

  fetchManagementTopics: async () => {
    set({ managementLoading: true })
    try {
      const topics = await fetchLearnTopicsForManagement()
      set({ managementTopics: topics, managementLoading: false })
    } catch (err) {
      set({ error: err.message, managementLoading: false })
    }
  },

  fetchTopicStudentProgress: async (topicId) => {
    try {
      const data = await fetchTopicStudentProgress(topicId)
      set({ topicStudentProgress: data })
    } catch (err) {
      set({ error: err.message })
    }
  },

  updatePrerequisite: async (topicId, prerequisiteTopicId) => {
    try {
      const updated = await updateTopicPrerequisite(topicId, prerequisiteTopicId)
      set((state) => ({
        managementTopics: state.managementTopics.map((t) =>
          t.id === topicId ? { ...t, prerequisite_topic: prerequisiteTopicId } : t
        ),
      }))
      return updated
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  removeTopic: async (topicId) => {
    try {
      const result = await removeLearnTopic(topicId)
      set((state) => ({
        managementTopics: state.managementTopics.filter((t) => t.id !== topicId),
        // Also null out any cached prerequisite references
        topics: state.topics
          .filter((t) => t.id !== topicId)
          .map((t) => t.prerequisite_topic === topicId ? { ...t, prerequisite_topic: null } : t),
      }))
      return result
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },
  // ─── Topic ordering (teacher management) ───────────────────────────────

  reorderTopics: async (categoryId, reorderedTopics) => {
    try {
      // build DB updates
      const updates = reorderedTopics.map((topic, index) => ({
        id: topic.id,
        order_index: index,
      }))

      // save to Supabase
      await updateTopicOrder(updates)

      // update local state immediately
      set((state) => ({
        managementTopics: state.managementTopics.map((t) => {
          const updated = updates.find((u) => u.id === t.id)
          return updated ? { ...t, order_index: updated.order_index } : t
        }),
        topics: state.topics.map((t) => {
          const updated = updates.find((u) => u.id === t.id)
          return updated ? { ...t, order_index: updated.order_index } : t
        }),
      }))
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },
}))