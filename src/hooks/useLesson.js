import { useLessonStore } from '../store/lessonStore'
import { lessonService } from '../services/lesson.service'
import { useAuthStore } from '../store/authStore'
import { useUIStore } from '../store/uiStore'

export function useLesson() {
  const store = useLessonStore()
  const profile = useAuthStore((s) => s.profile)
  const addToast = useUIStore((s) => s.addToast)

  const handleCreateLesson = async (lessonData, attachments, linkedQuizzes) => {
    try {
      // Create lesson
      const lesson = await store.createLesson(lessonData)

      // Upload attachments
      for (const attachment of attachments) {
        if (attachment._tempFile) {
          const { file_url, file_name } = await lessonService.uploadAttachmentFile(
            lesson.id,
            attachment._tempFile
          )
          await lessonService.addAttachment(lesson.id, {
            file_name,
            file_url,
            file_type: attachment.file_type,
            file_size: attachment.file_size,
          })
        } else if (attachment.file_type === 'link') {
          await lessonService.addAttachment(lesson.id, attachment)
        }
      }

      // Link quizzes
      for (const quiz of linkedQuizzes) {
        await lessonService.attachQuiz(lesson.id, quiz.id)
      }

      addToast('Lesson created successfully!', 'success')
      return lesson
    } catch (err) {
      addToast(err.message || 'Failed to create lesson', 'error')
      throw err
    }
  }

  const handleUpdateLesson = async (lessonId, lessonData, attachments, linkedQuizzes) => {
    try {
      // Update lesson
      await store.updateLesson(lessonId, lessonData)

      // Handle attachments (add new ones)
      for (const attachment of attachments) {
        if (attachment._tempFile) {
          const { file_url, file_name } = await lessonService.uploadAttachmentFile(
            lessonId,
            attachment._tempFile
          )
          await lessonService.addAttachment(lessonId, {
            file_name,
            file_url,
            file_type: attachment.file_type,
            file_size: attachment.file_size,
          })
        }
      }

      addToast('Lesson updated successfully!', 'success')
    } catch (err) {
      addToast(err.message || 'Failed to update lesson', 'error')
      throw err
    }
  }

  const handleDeleteLesson = async (lessonId) => {
    try {
      await store.deleteLesson(lessonId)
      addToast('Lesson deleted', 'info')
    } catch (err) {
      addToast(err.message || 'Failed to delete lesson', 'error')
    }
  }

  const handleTogglePublish = async (lessonId, isPublished) => {
    try {
      await store.togglePublish(lessonId, isPublished)
      addToast(`Lesson ${isPublished ? 'unpublished' : 'published'}`, 'success')
    } catch (err) {
      addToast(err.message || 'Failed to update lesson', 'error')
    }
  }

  const handleUpdateProgress = async (lessonId, updates) => {
    try {
      await store.updateProgress(profile.id, lessonId, updates)
    } catch (err) {
      console.error('Failed to update progress:', err)
    }
  }

  return {
    ...store,
    profile,
    handleCreateLesson,
    handleUpdateLesson,
    handleDeleteLesson,
    handleTogglePublish,
    handleUpdateProgress,
  }
}