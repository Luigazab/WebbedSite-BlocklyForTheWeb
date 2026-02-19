import { useLessonStore } from '../store/lessonStore'
import { useAuthStore } from '../store/authStore'
import { useUIStore } from '../store/uiStore'
import { quizService } from '../services/quiz.service'

export function useLesson() {
  const store = useLessonStore()
  const profile = useAuthStore((state) => state.profile)
  const addToast = useUIStore((state) => state.addToast)

  // ─── Teacher ─────────────────────────────────────────

  const handleCreateLesson = async (lessonData, quizData) => {
    try {
      // 1. Create lesson
      const lesson = await store.createLesson({
        ...lessonData,
        teacher_id: profile.id,
      })

      // 2. Optionally create quiz
      if (lessonData.has_quiz && quizData?.questions?.length > 0) {
        await quizService.createQuizWithQuestions(
          lesson.id,
          quizData.title,
          quizData.questions
        )
      }

      addToast(`"${lesson.title}" created successfully!`, 'success')
      return lesson
    } catch (err) {
      addToast(err.message || 'Failed to create lesson.', 'error')
      throw err
    }
  }

  const handleUpdateLesson = async (lessonId, lessonData, quizData, existingQuizId) => {
    try {
      const lesson = await store.updateLesson(lessonId, lessonData)

      if (lessonData.has_quiz && quizData?.questions?.length > 0) {
        if (existingQuizId) {
          await quizService.updateQuizWithQuestions(
            existingQuizId,
            quizData.title,
            quizData.questions
          )
        } else {
          await quizService.createQuizWithQuestions(
            lessonId,
            quizData.title,
            quizData.questions
          )
        }
      } else if (!lessonData.has_quiz && existingQuizId) {
        await quizService.deleteQuiz(existingQuizId)
      }

      addToast('Lesson updated.', 'success')
      return lesson
    } catch (err) {
      addToast(err.message || 'Failed to update lesson.', 'error')
      throw err
    }
  }

  const handleDeleteLesson = async (lessonId, title) => {
    try {
      await store.deleteLesson(lessonId)
      addToast(`"${title}" deleted.`, 'info')
    } catch (err) {
      addToast(err.message || 'Failed to delete lesson.', 'error')
      throw err
    }
  }

  const handleTogglePublish = async (lesson) => {
    try {
      await store.updateLesson(lesson.id, { is_published: !lesson.is_published })
      addToast(
        lesson.is_published ? 'Lesson unpublished.' : 'Lesson published!',
        'success'
      )
    } catch (err) {
      addToast(err.message || 'Failed to update lesson.', 'error')
    }
  }

  // ─── Student ─────────────────────────────────────────

  const handleMarkComplete = async (lessonId) => {
    try {
      await store.markComplete(profile.id, lessonId)
    } catch (err) {
      addToast(err.message || 'Failed to mark lesson complete.', 'error')
    }
  }

  const handleSubmitQuiz = async (quizId, answers, questions) => {
    try {
      const result = await store.submitQuiz(quizId, profile.id, answers, questions)
      const passed = result.score / result.total_items >= 0.7
      addToast(
        `Quiz submitted! You scored ${result.score}/${result.total_items}. ${passed ? '🎉 Passed!' : 'Keep practicing!'}`,
        passed ? 'success' : 'info'
      )
      return result
    } catch (err) {
      addToast(err.message || 'Failed to submit quiz.', 'error')
      throw err
    }
  }

  return {
    ...store,
    profile,
    handleCreateLesson,
    handleUpdateLesson,
    handleDeleteLesson,
    handleTogglePublish,
    handleMarkComplete,
    handleSubmitQuiz,
  }
}