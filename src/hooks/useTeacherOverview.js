import { useTeacherOverviewStore } from '@/store/teacherOverviewStore'
import { toast } from 'sonner'

export function useTeacherOverview() {
  const store = useTeacherOverviewStore()

  const fetchOverview = async (classroomId) => {
    if (!classroomId) return
    try {
      await store.fetchOverview(classroomId)
    } catch (err) {
      toast.error('Failed to load classroom overview')
    }
  }

  return {
    stats:            store.stats,
    studentProgress:  store.studentProgress,
    lessonCompletion: store.lessonCompletion,
    loading:          store.loading,

    fetchOverview,
  }
}