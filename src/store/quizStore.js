import { create } from 'zustand'
import { quizService } from '../services/quiz.service'
import { createLessonBase, updateLessonBase, removeLessonById, fetchTopicGroupsForAuthoring } from "@/services/lessonService";
import { fetchQuizEditorData, upsertQuizContent } from "@/services/quizService";

const emptyQuiz = {
  id: null,
  title: "",
  topicId: "",
  timeLimit: "",
  passingScore: "",
  questions: null, // null = "no server data yet", let the hook decide the default question shape
};

export const useQuizStore = create((set) => ({
  quizzes: [],
  currentQuiz: null,
  quizAttempt: null,
  loading: false,
  error: null,

  topics: [],
  topicsLoading: false,

  quiz: emptyQuiz,
  quizLoading: false,

  saving: false,
  deleting: false,

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

  fetchTopics: async () => {
    set({ topicsLoading: true });
    try {
      const topics = await fetchTopicGroupsForAuthoring();
      set({ topics });
      return topics;
    } finally {
      set({ topicsLoading: false });
    }
  },

  fetchQuiz: async (lessonId) => {
    set({ quizLoading: true });
    try {
      const data = await fetchQuizEditorData(lessonId);
      const quiz = {
        id: data.id,
        title: data.title ?? "",
        topicId: data.topics_id ?? "",
        timeLimit: data.quiz?.time_limit ? String(data.quiz.time_limit) : "",
        passingScore: data.quiz?.passing_score ? String(data.quiz.passing_score) : "",
        questions: data.quiz?.questions ?? [],
      };
      set({ quiz });
      return quiz;
    } finally {
      set({ quizLoading: false });
    }
  },

  createQuiz: async ({ authorId, title, topicId, timeLimit, passingScore, questions }) => {
    set({ saving: true });
    try {
      const lesson = await createLessonBase({ topicId, authorId, title: title.trim(), type: "quiz" });
      await upsertQuizContent({ lessonId: lesson.id, timeLimit, passingScore, questions });
      return lesson;
    } finally {
      set({ saving: false });
    }
  },

  updateQuiz: async ({ lessonId, title, topicId, timeLimit, passingScore, questions }) => {
    set({ saving: true });
    try {
      const lesson = await updateLessonBase({ lessonId, topicId, title: title.trim() });
      await upsertQuizContent({ lessonId: lesson.id, timeLimit, passingScore, questions });
      return lesson;
    } finally {
      set({ saving: false });
    }
  },

  deleteQuiz: async (lessonId) => {
    set({ deleting: true });
    try {
      await removeLessonById(lessonId);
    } finally {
      set({ deleting: false });
    }
  },

  resetQuiz: () => set({ quiz: emptyQuiz }),

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