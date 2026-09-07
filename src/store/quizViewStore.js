import { create } from "zustand";
import { fetchQuizForStudent } from "@/services/quizService";
import { getAllQuizAttempts, recordQuizAttempt } from "@/services/progressService";

export const useQuizViewStore = create((set) => ({
  lessonQuiz: null,
  loading: false,

  attempts: [],
  attemptsLoading: false,

  submitting: false,

  fetchQuiz: async (lessonId) => {
    set({ loading: true });
    try {
      const lessonQuiz = await fetchQuizForStudent(lessonId);
      set({ lessonQuiz });
      return lessonQuiz;
    } finally {
      set({ loading: false });
    }
  },

  fetchAttempts: async ({ userId, quizId }) => {
    set({ attemptsLoading: true });
    try {
      const attempts = await getAllQuizAttempts(userId, quizId);
      set({ attempts });
      return attempts;
    } finally {
      set({ attemptsLoading: false });
    }
  },

  submitAttempt: async ({ userId, result, lessonMeta }) => {
    set({ submitting: true });
    try {
      const attempt = await recordQuizAttempt({
        userId,
        quizId: lessonMeta.quiz.id,
        score: result.score,
        startedAt: result.startedAt,
        answers: result.answers,
        lessonId: lessonMeta.id,
        classroomId: lessonMeta.classroomId,
        courseId: lessonMeta.courseId,
        topicId: lessonMeta.topicId,
        baseXp: lessonMeta.baseXp,
        passingScore: lessonMeta.quiz.passing_score,
      });
      const attempts = await getAllQuizAttempts(userId, lessonMeta.quiz.id);
      set({ attempts });
      return attempt;
    } finally {
      set({ submitting: false });
    }
  },

  resetQuiz: () => set({ lessonQuiz: null, attempts: [] }),
}));