import { useCurriculumStore } from '@/store/curriculumStore'
import { toast } from 'sonner'

export function useCurriculum() {
  const store = useCurriculumStore()

  const fetchMasterCourses = async () => {
    try {
      await store.fetchMasterCourses()
    } catch (err) {
      toast.error('Failed to load curriculum library')
    }
  }

  const handleAssignCourse = async (classroomId, courseId, courseName) => {
    try {
      await store.assignCourseToClassroom(classroomId, courseId)
      toast.success(`"${courseName}" is now set up for this classroom.`)
    } catch (err) {
      toast.error('Failed to assign curriculum.', err.message)
      throw err
    }
  }

  const fetchClassroomCurriculum = async (classroomId) => {
    try {
      await store.fetchClassroomCurriculum(classroomId)
    } catch (err) {
      toast.error('Failed to load classroom curriculum')
    }
  }

  const fetchLessonDetail = async (lessonId) => {
    try {
      return await store.fetchLessonDetail(lessonId)
    } catch (err) {
      toast.error('Failed to load lesson')
      throw err
    }
  }

  const handleEditTopic = async (topicId, updates) => {
    try {
      await store.editTopic(topicId, updates)
      toast.success('Week updated.')
    } catch (err) {
      toast.error('Failed to update week.', err.message)
      throw err
    }
  }

  const handleEditLesson = async (topicId, lessonId, updates) => {
    try {
      await store.editLesson(topicId, lessonId, updates)
      toast.success('Lesson updated.')
    } catch (err) {
      toast.error('Failed to update lesson.', err.message)
      throw err
    }
  }

  const handleCreateTopic = async (classroomId, courseId, { title, description }) => {
    try {
      const topic = await store.createTopic(classroomId, courseId, { title, description })
      toast.success(`"${title}" added.`)
      return topic
    } catch (err) {
      toast.error('Failed to add week.', err.message)
      throw err
    }
  }

  const handleUnlockTopic = async (topicId, topicTitle) => {
    try {
      await store.unlockTopic(topicId)
      toast.success(`"${topicTitle}" opened for the class.`)
    } catch (err) {
      toast.error('Failed to unlock week.', err.message)
      throw err
    }
  }

  const refreshCurriculum = async (classroomId) => {
    try {
      await store.refreshCurriculum(classroomId)
    } catch (err) {
    }
  }

  return {
    masterCourses:   store.masterCourses,
    classroomCourse: store.classroomCourse,
    topics:          store.topics,
    currentLesson:   store.currentLesson,
    loading:         store.loading,
    assigning:       store.assigning,
    lessonLoading:   store.lessonLoading,
    error:           store.error,

    fetchMasterCourses,
    handleAssignCourse,
    fetchClassroomCurriculum,
    fetchLessonDetail,
    clearCurrentLesson: store.clearCurrentLesson,
    handleEditTopic,
    handleEditLesson,
    handleCreateTopic,
    handleUnlockTopic,
    refreshCurriculum,
  }
}