import { useFeedbackStore } from '../store/feedbackStore'
import { feedbackService } from '../services/feedback.service'
import { useAuthStore } from '../store/authStore'
import { useUIStore } from '../store/uiStore'

export function useFeedback() {
  const store     = useFeedbackStore()
  const profile   = useAuthStore((s) => s.profile)
  const addToast  = useUIStore((s) => s.addToast)

  const handleSubmit = async (formData) => {
    try {
      const item = await feedbackService.submitFeedback({
        ...formData,
        sender_id: profile.id,
      })
      store.addFeedback(item)
      addToast('Feedback submitted. Thank you!', 'success')
      return item
    } catch (err) {
      addToast(err.message || 'Failed to submit feedback.', 'error')
      throw err
    }
  }

  const handleUpdateStatus = async (feedbackId, status) => {
    try {
      await feedbackService.updateFeedbackStatus(feedbackId, status)
      store.updateStatus(feedbackId, status)
      addToast(`Marked as ${status.replace('_', ' ')}.`, 'success')
    } catch (err) {
      addToast(err.message || 'Failed to update status.', 'error')
    }
  }

  const handleDelete = async (feedbackId) => {
    try {
      await feedbackService.deleteFeedback(feedbackId)
      store.removeFeedback(feedbackId)
      addToast('Feedback deleted.', 'info')
    } catch (err) {
      addToast(err.message || 'Failed to delete.', 'error')
    }
  }

  return {
    ...store,
    profile,
    handleSubmit,
    handleUpdateStatus,
    handleDelete,
  }
}