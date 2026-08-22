import { create } from 'zustand'
import {
  completeLesson as completeLessonService,
  startQuizAttempt as startQuizAttemptService,
  submitQuizAttempt as submitQuizAttemptService,
  completeLaboratory as completeLaboratoryService,
  completeTutorialStep as completeTutorialStepService,
  getStepStartingContent as getStepStartingContentService,
  getStudentProgress as getStudentProgressService,
  getLessonProgress as getLessonProgressService,
} from '../services/progressService'

export const useProgressStore = create((set, get) => ({
  studentProgress: null,
  lessonProgress:  {},
  actionLoading:   false,
  error:           null,

  fetchStudentProgress: async (userId, classroomId) => {
    try {
      const progress = await getStudentProgressService(userId, classroomId)
      set({ studentProgress: progress })
      return progress
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  fetchLessonProgress: async (userId, lessonId) => {
    const progress = await getLessonProgressService(userId, lessonId)
    set((s) => ({ lessonProgress: { ...s.lessonProgress, [lessonId]: progress } }))
    return progress
  },

  completeLesson: async (params) => {
    set({ actionLoading: true })
    try {
      const result = await completeLessonService(params)
      set((s) => ({
        lessonProgress: { ...s.lessonProgress, [params.lessonId]: { is_completed: true } },
        studentProgress: s.studentProgress
          ? { ...s.studentProgress, current_xp: result.totalXp, total_xp: result.totalXp, current_level: result.level }
          : s.studentProgress,
      }))
      return result
    } finally {
      set({ actionLoading: false })
    }
  },

  startQuizAttempt: (userId, quizId) => startQuizAttemptService(userId, quizId),

  submitQuizAttempt: async (params) => {
    set({ actionLoading: true })
    try {
      const result = await submitQuizAttemptService(params)
      if (result.passed) {
        set((s) => ({ lessonProgress: { ...s.lessonProgress, [params.lessonId]: { is_completed: true } } }))
      }
      return result
    } finally {
      set({ actionLoading: false })
    }
  },

  completeLaboratory: async (params) => {
    set({ actionLoading: true })
    try {
      const result = await completeLaboratoryService(params)
      set((s) => ({
        lessonProgress: { ...s.lessonProgress, [params.lessonId]: { is_completed: true } },
      }))
      return result
    } finally {
      set({ actionLoading: false })
    }
  },

  completeTutorialStep: (params) => completeTutorialStepService(params),

  getStepStartingContent: (params) => getStepStartingContentService(params),
}))