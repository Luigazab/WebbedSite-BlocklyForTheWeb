import { useEffect } from 'react'
import { useLikesStore } from '../store/likesStore'
import { useAuthStore } from '../store/authStore'

export function useLikes(projectIds = []) {
  const profile = useAuthStore((s) => s.profile)
  const { likedProjects, loading, loadUserLikes, toggleLike, isLiked } = useLikesStore()

  useEffect(() => {
    if (profile?.id && projectIds.length > 0) {
      loadUserLikes(projectIds, profile.id)
    }
  }, [profile?.id, projectIds.length])

  const handleToggleLike = async (projectId) => {
    if (!profile?.id) {
      throw new Error('Must be logged in to like')
    }
    return await toggleLike(projectId, profile.id)
  }

  return {
    isLiked,
    toggleLike: handleToggleLike,
    loading
  }
}