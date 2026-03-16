import { create } from 'zustand'
import { lessonService } from '../services/lesson.service'

export const useLessonStore = create((set, get) => ({
  lessons: [],
  currentLesson: null,
  lessonProgress: {},
  classroomAssignments: [],
  classroomMembers: [],
  classroomBadges: [],
  achievements: [],
  lessonAssignments: [],
  quizAttemptHistory: [],   // [{quizId, title, passing_score, attempts:[], bestScore, attemptCount, badge}]
  loading: false,
  error: null,

  // ─── Teacher: CRUD ─────────────────────────────────────

  fetchTeacherLessons: async (teacherId) => {
    set({ loading: true, error: null })
    try {
      const lessons = await lessonService.getLessonsByTeacher(teacherId)
      set({ lessons, loading: false })
    } catch (err) { set({ error: err.message, loading: false }) }
  },

  fetchLesson: async (lessonId) => {
    set({ loading: true, error: null })
    try {
      const lesson = await lessonService.getLessonById(lessonId)
      set({ currentLesson: lesson, loading: false })
    } catch (err) { set({ error: err.message, loading: false }) }
  },

  clearCurrentLesson: () => set({ currentLesson: null }),

  createLesson: async (payload) => {
    try {
      const lesson = await lessonService.createLesson(payload)
      set((state) => ({ lessons: [lesson, ...state.lessons], currentLesson: lesson }))
      return lesson
    } catch (err) { set({ error: err.message }); throw err }
  },

  updateLesson: async (lessonId, updates) => {
    try {
      const lesson = await lessonService.updateLesson(lessonId, updates)
      set((state) => ({
        lessons: state.lessons.map((l) => (l.id === lessonId ? lesson : l)),
        currentLesson: lesson,
      }))
      return lesson
    } catch (err) { set({ error: err.message }); throw err }
  },

  deleteLesson: async (lessonId) => {
    try {
      await lessonService.deleteLesson(lessonId)
      set((state) => ({ lessons: state.lessons.filter((l) => l.id !== lessonId) }))
    } catch (err) { set({ error: err.message }); throw err }
  },

  togglePublish: async (lessonId, isPublished) => {
    try {
      const lesson = await lessonService.updateLesson(lessonId, { is_published: !isPublished })
      set((state) => ({
        lessons: state.lessons.map((l) => (l.id === lessonId ? lesson : l)),
      }))
      return lesson
    } catch (err) { set({ error: err.message }); throw err }
  },

  // ─── Teacher: Classroom Assignment ─────────────────────

  fetchClassroomAssignments: async (classroomId) => {
    set({ loading: true, error: null })
    try {
      const assignments = await lessonService.getClassroomAssignments(classroomId)
      set({ lessons: assignments, loading: false })
    } catch (err) { set({ error: err.message, loading: false }) }
  },

  fetchClassroomLessons: async (classroomId) => {
    set({ loading: true, error: null })
    try {
      const assignments = await lessonService.getClassroomAssignments(classroomId)
      set({ lessons: assignments, loading: false })
    } catch (err) { set({ error: err.message, loading: false }) }
  },

  assignToClassroom: async (payload) => {
    try { return await lessonService.assignToClassroom(payload) }
    catch (err) { set({ error: err.message }); throw err }
  },

  // ─── Student: Classroom Detail ─────────────────────────

  fetchClassroomLessonsForStudent: async (classroomId, studentId) => {
    set({ loading: true, error: null })
    try {
      const assignments = await lessonService.getClassroomLessonsForStudent(classroomId, studentId)
      set({ classroomAssignments: assignments, loading: false })
    } catch (err) { set({ error: err.message, loading: false }) }
  },

  fetchClassroomMembers: async (classroomId) => {
    try {
      const members = await lessonService.getClassroomMembers(classroomId)
      set({ classroomMembers: members })
    } catch (err) { set({ error: err.message }) }
  },

  fetchClassroomBadges: async (classroomId) => {
    try {
      const badges = await lessonService.getClassroomBadges(classroomId)
      set({ classroomBadges: badges })
    } catch (err) { set({ error: err.message }) }
  },

  // ─── Student: Quiz Attempt History ─────────────────────

  fetchQuizAttemptHistory: async (studentId, classroomId) => {
    try {
      const history = await lessonService.getStudentQuizAttemptsForClassroom(studentId, classroomId)
      set({ quizAttemptHistory: history })
    } catch (err) { set({ error: err.message }) }
  },

  // ─── Student: Assignments Tab ──────────────────────────

  fetchStudentLessonAssignments: async (studentId) => {
    set({ loading: true, error: null })
    try {
      const assignments = await lessonService.getStudentLessonAssignments(studentId)
      set({ lessonAssignments: assignments, loading: false })
    } catch (err) { set({ error: err.message, loading: false }) }
  },

  // ─── Student: Achievements ─────────────────────────────

  fetchStudentAchievements: async (studentId) => {
    try {
      const achievements = await lessonService.getStudentAchievements(studentId)
      set({ achievements })
    } catch (err) { set({ error: err.message }) }
  },

  // ─── Student: Progress Tracking ────────────────────────

  fetchProgress: async (studentId, lessonId) => {
    try {
      const progress = await lessonService.getStudentProgress(studentId, lessonId)
      set((state) => ({ lessonProgress: { ...state.lessonProgress, [lessonId]: progress } }))
      return progress
    } catch (err) { set({ error: err.message }) }
  },

  updateProgress: async (studentId, lessonId, updates) => {
    try {
      const progress = await lessonService.updateProgress(studentId, lessonId, updates)
      set((state) => ({ lessonProgress: { ...state.lessonProgress, [lessonId]: progress } }))
      return progress
    } catch (err) { set({ error: err.message }); throw err }
  },
}))