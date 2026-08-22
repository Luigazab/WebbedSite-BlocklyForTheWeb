import { create } from 'zustand'
import { getMasterCourses, assignCourseToClassroom as assignCourseToClassroomService, getClassroomCourse, getClassroomTopics, getLessonDetail as getLessonDetailService, updateTopic as updateTopicService, updateLesson as updateLessonService, teacherUnlockTopic as teacherUnlockTopicService, createTopic as createTopicService} from '@/services/curriculumService'

export const useCurriculumStore = create((set, get) => ({
  masterCourses:   [],
  classroomCourse: null,
  topics:          [],
  currentLesson:   null,

  loading:      false,
  assigning:    false,
  lessonLoading: false,
  error:        null,

  fetchMasterCourses: async () => {
    set({ loading: true, error: null })
    try {
      const courses = await getMasterCourses()
      set({ masterCourses: courses })
    } catch (err) {
      set({ error: err.message })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  assignCourseToClassroom: async (classroomId, courseId) => {
    set({ assigning: true })
    try {
      await assignCourseToClassroomService(classroomId, courseId)
      await get().fetchClassroomCurriculum(classroomId)
    } finally {
      set({ assigning: false })
    }
  },

  fetchClassroomCurriculum: async (classroomId) => {
    set({ loading: true, error: null })
    try {
      const [course, topics] = await Promise.all([
        getClassroomCourse(classroomId),
        getClassroomTopics(classroomId),
      ])
      set({ classroomCourse: course, topics })
    } catch (err) {
      set({ error: err.message })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  fetchLessonDetail: async (lessonId) => {
    set({ lessonLoading: true })
    try {
      const lesson = await getLessonDetailService(lessonId)
      set({ currentLesson: lesson })
      return lesson
    } finally {
      set({ lessonLoading: false })
    }
  },

  clearCurrentLesson: () => set({ currentLesson: null }),

  editTopic: async (topicId, updates) => {
    const updated = await updateTopicService(topicId, updates)
    set((s) => ({
      topics: s.topics.map((t) => (t.id === topicId ? { ...t, ...updated } : t)),
    }))
    return updated
  },

  editLesson: async (topicId, lessonId, updates) => {
    const updated = await updateLessonService(lessonId, updates)
    set((s) => ({
      topics: s.topics.map((t) =>
        t.id !== topicId
          ? t
          : { ...t, lessons: t.lessons.map((l) => (l.id === lessonId ? { ...l, ...updated } : l)) }
      ),
    }))
    return updated
  },

  createTopic: async (classroomId, courseId, { title, description }) => {
    const topic = await createTopicService(classroomId, courseId, { title, description })
    set((s) => ({
      topics: [...s.topics, { ...topic, isUnlocked: topic.is_unlocked, lessons: [] }].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0)
      ),
    }))
    return topic
  },

  unlockTopic: async (topicId) => {
    await teacherUnlockTopicService(topicId)
    set((s) => ({
      topics: s.topics.map((t) =>
        t.id === topicId ? { ...t, isUnlocked: true } : t
      ),
    }))
  },

  refreshCurriculum: async (classroomId) => {
    const topics = await getClassroomTopics(classroomId)
    set({ topics })
  },
}))