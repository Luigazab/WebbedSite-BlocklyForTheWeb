import { create } from 'zustand'
import { lessonService } from '../services/lesson.service'
import { quizService } from '../services/quiz.service'

export const useLessonStore = create((set, get) => ({
  lessons: [],
  currentLesson: null,
  lessonProgress: {},   // { [lessonId]: { is_completed, completed_at } }
  quizAttempt: null,    // result of the latest quiz submission
  loading: false,
  error: null,

  // ─── Teacher ─────────────────────────────────────────

  fetchTeacherLessons: async (teacherId) => {
    set({ loading: true, error: null })
    try {
      const lessons = await lessonService.getLessonsByTeacher(teacherId)
      set({ lessons, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  createLesson: async (payload) => {
    const lesson = await lessonService.createLesson(payload)
    set((state) => ({ lessons: [lesson, ...state.lessons] }))
    return lesson
  },

  updateLesson: async (lessonId, updates) => {
    const lesson = await lessonService.updateLesson(lessonId, updates)
    set((state) => ({
      lessons: state.lessons.map((l) => (l.id === lessonId ? lesson : l)),
    }))
    return lesson
  },

  deleteLesson: async (lessonId) => {
    await lessonService.deleteLesson(lessonId)
    set((state) => ({
      lessons: state.lessons.filter((l) => l.id !== lessonId),
    }))
  },

  // ─── Student ─────────────────────────────────────────

  fetchClassroomLessons: async (classroomId) => {
    set({ loading: true, error: null })
    try {
      const lessons = await lessonService.getLessonsByClassroom(classroomId)
      set({ lessons, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  fetchLesson: async (lessonId) => {
    set({ loading: true, error: null, quizAttempt: null })
    try {
      const lesson = await lessonService.getLessonById(lessonId)
      set({ currentLesson: lesson, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  fetchProgress: async (studentId, classroomId) => {
    const progress = await lessonService.getLessonProgress(studentId, classroomId)
    const progressMap = {}
    progress.forEach((p) => { progressMap[p.lesson_id] = p })
    set({ lessonProgress: progressMap })
  },

  markComplete: async (studentId, lessonId) => {
    await lessonService.markLessonComplete(studentId, lessonId)
    set((state) => ({
      lessonProgress: {
        ...state.lessonProgress,
        [lessonId]: { is_completed: true, completed_at: new Date().toISOString() },
      },
    }))
  },

  submitQuiz: async (quizId, studentId, answers, questions) => {
    const result = await quizService.submitAttempt(quizId, studentId, answers, questions)
    set({ quizAttempt: result })
    return result
  },

  clearCurrentLesson: () => set({ currentLesson: null, quizAttempt: null }),
}))