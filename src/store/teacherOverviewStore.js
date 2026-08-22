import { create } from 'zustand'
import { getClassroomOverviewStats, getStudentProgressList, getLessonCompletionRates } from '@/services/teacherOverviewService'

export const useTeacherOverviewStore = create((set) => ({
  stats:              null,
  studentProgress:    [],
  lessonCompletion:   {},
  loading:            false,
  error:              null,

  fetchOverview: async (classroomId) => {
    set({ loading: true, error: null })
    try {
      const [stats, studentProgress, lessonCompletion] = await Promise.all([
        getClassroomOverviewStats(classroomId),
        getStudentProgressList(classroomId),
        getLessonCompletionRates(classroomId),
      ])
      set({ stats, studentProgress, lessonCompletion })
    } catch (err) {
      set({ error: err.message })
      throw err
    } finally {
      set({ loading: false })
    }
  },
}))