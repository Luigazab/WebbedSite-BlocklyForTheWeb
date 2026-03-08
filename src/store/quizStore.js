import { create } from 'zustand'
import { quizService } from '../services/quiz.service'

export const useQuizStore = create((set) => ({
  quizzes: [],
  currentQuiz: null,
  quizAttempt: null,
  loading: false,
  error: null,

  // ─── Teacher: CRUD Operations ──────────────────────────

  fetchTeacherQuizzes: async (teacherId) => {
    set({ loading: true, error: null })
    try {
      const quizzes = await quizService.getQuizzesByTeacher(teacherId)
      set({ quizzes, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  fetchQuiz: async (quizId) => {
    set({ loading: true, error: null })
    try {
      const quiz = await quizService.getQuizById(quizId)
      set({ currentQuiz: quiz, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  createQuiz: async (payload) => {
    try {
      const quiz = await quizService.createQuiz(payload)
      set((state) => ({
        quizzes: [quiz, ...state.quizzes],
        currentQuiz: quiz,
      }))
      return quiz
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  updateQuiz: async (quizId, updates) => {
    try {
      const quiz = await quizService.updateQuiz(quizId, updates)
      set((state) => ({
        quizzes: state.quizzes.map((q) => (q.id === quizId ? quiz : q)),
        currentQuiz: quiz,
      }))
      return quiz
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  deleteQuiz: async (quizId) => {
    try {
      await quizService.deleteQuiz(quizId)
      set((state) => ({
        quizzes: state.quizzes.filter((q) => q.id !== quizId),
      }))
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  // ─── Questions Management ──────────────────────────────

  addQuestion: async (quizId, question) => {
    try {
      const newQuestion = await quizService.addQuestion(quizId, question)
      set((state) => ({
        currentQuiz: state.currentQuiz
          ? {
              ...state.currentQuiz,
              questions: [...(state.currentQuiz.questions || []), newQuestion],
            }
          : null,
      }))
      return newQuestion
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  updateQuestion: async (questionId, updates) => {
    try {
      const question = await quizService.updateQuestion(questionId, updates)
      set((state) => ({
        currentQuiz: state.currentQuiz
          ? {
              ...state.currentQuiz,
              questions: state.currentQuiz.questions.map((q) =>
                q.id === questionId ? question : q
              ),
            }
          : null,
      }))
      return question
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  deleteQuestion: async (questionId) => {
    try {
      await quizService.deleteQuestion(questionId)
      set((state) => ({
        currentQuiz: state.currentQuiz
          ? {
              ...state.currentQuiz,
              questions: state.currentQuiz.questions.filter((q) => q.id !== questionId),
            }
          : null,
      }))
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  // ─── Student: Quiz Attempts ────────────────────────────

  submitAttempt: async (quizId, studentId, answers, questions) => {
    try {
      const attempt = await quizService.submitAttempt(quizId, studentId, answers, questions)
      set({ quizAttempt: attempt })
      return attempt
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  clearAttempt: () => {
    set({ quizAttempt: null })
  },

  getBestAttempt: async (studentId, quizId) => {
    try {
      const attempt = await quizService.getBestAttempt(studentId, quizId)
      return attempt
    } catch (err) {
      set({ error: err.message })
      return null
    }
  },
}))