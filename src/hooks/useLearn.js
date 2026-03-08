import { useLearnStore } from '../store/learnStore'
import { useAuthStore } from '../store/authStore'

export function useLearn() {
  const store = useLearnStore()
  const profile = useAuthStore((s) => s.profile)

  const handleUpdateProgress = async (topicId, progressPercentage) => {
    try {
      await store.updateTopicProgress(profile.id, topicId, progressPercentage)
    } catch (err) {
      console.error('Failed to update progress:', err)
    }
  }

  return {
    ...store,
    profile,
    handleUpdateProgress,
  }
}