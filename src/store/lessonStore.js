import { create } from 'zustand'
import { lessonService } from '../services/lesson.service'

export const useLessonStore = create((set) => ({
  lessons: [],
  currentLesson: null,
  lessonProgress: {},
  loading: false,
  error: null,

  // ─── Teacher: CRUD Operations ──────────────────────────

  fetchTeacherLessons: async (teacherId) => {
    set({ loading: true, error: null })
    try {
      const lessons = await lessonService.getLessonsByTeacher(teacherId)
      set({ lessons, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  fetchLesson: async (lessonId) => {
    set({ loading: true, error: null })
    try {
      const lesson = await lessonService.getLessonById(lessonId)
      set({ currentLesson: lesson, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  createLesson: async (payload) => {
    try {
      const lesson = await lessonService.createLesson(payload)
      set((state) => ({
        lessons: [lesson, ...state.lessons],
        currentLesson: lesson,
      }))
      return lesson
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  updateLesson: async (lessonId, updates) => {
    try {
      const lesson = await lessonService.updateLesson(lessonId, updates)
      set((state) => ({
        lessons: state.lessons.map((l) => (l.id === lessonId ? lesson : l)),
        currentLesson: lesson,
      }))
      return lesson
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  deleteLesson: async (lessonId) => {
    try {
      await lessonService.deleteLesson(lessonId)
      set((state) => ({
        lessons: state.lessons.filter((l) => l.id !== lessonId),
      }))
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  togglePublish: async (lessonId, isPublished) => {
    try {
      const lesson = await lessonService.updateLesson(lessonId, { is_published: !isPublished })
      set((state) => ({
        lessons: state.lessons.map((l) => (l.id === lessonId ? lesson : l)),
      }))
      return lesson
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  // ─── Student: Progress Tracking ────────────────────────

  fetchProgress: async (studentId, lessonId) => {
    try {
      const progress = await lessonService.getStudentProgress(studentId, lessonId)
      set((state) => ({
        lessonProgress: {
          ...state.lessonProgress,
          [lessonId]: progress,
        },
      }))
      return progress
    } catch (err) {
      set({ error: err.message })
    }
  },

  updateProgress: async (studentId, lessonId, updates) => {
    try {
      const progress = await lessonService.updateProgress(studentId, lessonId, updates)
      set((state) => ({
        lessonProgress: {
          ...state.lessonProgress,
          [lessonId]: progress,
        },
      }))
      return progress
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  // ─── Classroom Assignments ─────────────────────────────

  fetchClassroomAssignments: async (classroomId) => {
    set({ loading: true, error: null })
    try {
      const assignments = await lessonService.getClassroomAssignments(classroomId)
      set({ lessons: assignments, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  assignToClassroom: async (payload) => {
    try {
      const assignment = await lessonService.assignToClassroom(payload)
      return assignment
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },
}))