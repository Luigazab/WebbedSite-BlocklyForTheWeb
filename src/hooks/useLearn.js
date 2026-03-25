import { useEffect, useCallback } from 'react'
import { useLearnStore } from '../store/learnStore'
import { useAuthStore } from '../store/authStore'
import { useUIStore } from '../store/uiStore'

export function useLearn() {
  const store = useLearnStore()
  const profile = useAuthStore((s) => s.profile)
  const addToast = useUIStore((s) => s.addToast)

  const isTeacher = profile?.role === 'teacher' || profile?.role === 'admin'

  useEffect(() => {
    store.fetchAll(profile?.id ?? null)
  }, [profile?.id])

  const handleStartTopic = useCallback(
    async (topicId) => {
      if (!profile?.id) return
      try {
        await store.markTopicStarted(profile.id, topicId)
      } catch (err) {
        addToast(err.message || 'Could not start topic', 'error')
      }
    },
    [profile?.id]
  )

  const handleCompleteTopic = useCallback(
    async (topicId) => {
      if (!profile?.id) return
      try {
        await store.markTopicComplete(profile.id, topicId)
        addToast('Topic completed! 🎉', 'success')
      } catch (err) {
        addToast(err.message || 'Could not mark complete', 'error')
      }
    },
    [profile?.id]
  )

  /**
   * Returns enriched topics for a category.
   * Teachers: all unlocked.
   * Students: locked if prerequisite not completed.
   */
  const getEnrichedTopics = useCallback(
    (categoryId) => {
      return store.getTopicsForCategory(categoryId).map((topic) => ({
        ...topic,
        isCompleted: store.isTopicCompleted(topic.id),
        isUnlocked: store.isTopicUnlocked(topic, isTeacher),
        progress: store.getProgressFor(topic.id),
      }))
    },
    [store.topics, store.progress, isTeacher]
  )

  return {
    ...store,
    profile,
    isTeacher,
    handleStartTopic,
    handleCompleteTopic,
    getEnrichedTopics,
  }
}