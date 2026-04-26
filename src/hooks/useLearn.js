import { useEffect, useCallback } from 'react'
import { useLearnStore } from '../store/learnStore'
import { useAuthStore } from '../store/authStore'
import { useUIStore } from '../store/uiStore'
import { useNavigate } from 'react-router'

export function useLearn() {
  const store = useLearnStore()
  const profile = useAuthStore((s) => s.profile)
  const addToast = useUIStore((s) => s.addToast)
  const navigate = useNavigate()
  const isTeacher = profile?.role === 'teacher' || profile?.role === 'admin'

  useEffect(() => {
    store.fetchAll(profile?.id ?? null)
  }, [profile?.id])

  // ─── Topic viewer progress ────────────────────────────────────────────────

  const handleUpdateTopicProgress = useCallback(
    async (topicId, updates) => {
      if (!profile?.id) return
      try {
        await store.updateCurrentTopicProgress(profile.id, topicId, updates)
      } catch (err) {
        console.error('Failed to update topic progress:', err)
      }
    },
    [profile?.id]
  )

  const handleCompleteTopicFromViewer = useCallback(
    async (topicId) => {
      if (!profile?.id) return
      try {
        await store.markTopicComplete(profile.id, topicId)
        addToast('Topic completed!', 'success')
      } catch (err) {
        addToast(err.message || 'Could not mark complete', 'error')
      }
    },
    [profile?.id]
  )

  // ─── Learn page ───────────────────────────────────────────────────────────
  const handleStartTopic = useCallback(async (topicId) => {
    if (profile?.id) {
      try { await store.markTopicStarted(profile.id, topicId) } catch (err) {addToast(err.message || 'Could not start topic', 'error')}
    }
    const basePath = isTeacher ? '/teacher/learn' : '/student/learn'
    navigate(`${basePath}/${topicId}`)
  }, [profile?.id, isTeacher, navigate])
  /**
   * Returns enriched topics for a category.
   * Teachers: always unlocked.
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
    handleUpdateTopicProgress,
    handleCompleteTopicFromViewer,
    getEnrichedTopics,
  }
}