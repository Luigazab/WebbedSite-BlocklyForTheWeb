import { useQuizStore } from '../store/quizStore'
import { useAuthStore } from '../store/authStore'
import { useUIStore } from '../store/uiStore'
import { useAuth } from './useAuth'
import { toast } from 'sonner'

export function useQuiz() {
  const store = useQuizStore()
  const profile = useAuthStore((s) => s.profile)
  const addToast = useUIStore((s) => s.addToast)

  const { user } = useAuth();
  const isEditMode = Boolean(lessonId);

  useEffect(() => {
    store.fetchTopics().catch((error) =>
      toast.error(error.message || "Failed to load topics.")
    );
  }, [store.fetchTopics]);

  useEffect(() => {
    if (!isEditMode) {
      store.resetQuiz();
      return;
    }

    store.fetchQuiz(lessonId).catch((error) =>
      toast.error(error.message || "Failed to load quiz.")
    );
  }, [isEditMode, lessonId, store.fetchQuiz, store.resetQuiz]);

  

  const handleCreateQuiz = async (quizData) => {
    try {
      const quiz = await store.createQuiz({
        ...quizData,
        teacher_id: profile.id,
      })
      addToast('Quiz created successfully!', 'success')
      return quiz
    } catch (err) {
      addToast(err.message || 'Failed to create quiz', 'error')
      throw err
    }
  }

  const handleUpdateQuiz = async (quizId, updates) => {
    try {
      await store.updateQuiz(quizId, updates)
      addToast('Quiz updated successfully!', 'success')
    } catch (err) {
      addToast(err.message || 'Failed to update quiz', 'error')
      throw err
    }
  }

  const handleDeleteQuiz = async (quizId) => {
    try {
      await store.deleteQuiz(quizId)
      addToast('Quiz deleted', 'info')
    } catch (err) {
      addToast(err.message || 'Failed to delete quiz', 'error')
    }
  }

  const handleAddQuestion = async (quizId, question) => {
    try {
      await store.addQuestion(quizId, question)
      addToast('Question added', 'success')
    } catch (err) {
      addToast(err.message || 'Failed to add question', 'error')
      throw err
    }
  }

  const handleUpdateQuestion = async (questionId, updates) => {
    try {
      await store.updateQuestion(questionId, updates)
      addToast('Question updated', 'success')
    } catch (err) {
      addToast(err.message || 'Failed to update question', 'error')
      throw err
    }
  }

  const handleDeleteQuestion = async (questionId) => {
    try {
      await store.deleteQuestion(questionId)
      addToast('Question deleted', 'info')
    } catch (err) {
      addToast(err.message || 'Failed to delete question', 'error')
    }
  }

  const handleSubmitQuiz = async (quizId, answers, questions) => {
    try {
      const attempt = await store.submitAttempt(quizId, profile.id, answers, questions)
      const passed = attempt.score >= (questions[0]?.passing_score || 70)
      addToast(
        passed ? `Great! You scored ${attempt.score}%` : `You scored ${attempt.score}%. Try again!`,
        passed ? 'success' : 'info'
      )
      return attempt
    } catch (err) {
      addToast(err.message || 'Failed to submit quiz', 'error')
      throw err
    }
  }

  return {
    ...store,
    profile,
    handleCreateQuiz,
    handleUpdateQuiz,
    handleDeleteQuiz,
    handleAddQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
    handleSubmitQuiz,
  }
}