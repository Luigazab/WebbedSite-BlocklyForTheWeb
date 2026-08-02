import { archiveClassroom as archiveClassroomService, commentOnClassroomPost, createClassroomPost, createClassroom as createClassroomService, createMilestone as createMilestoneService, deleteClassroom as deleteClassroomService, getClassroomDetail, getClassroomMilestones, getClassroomPosts, getStudentClassroom, getTeacherClassrooms, joinClassroom as joinClassroomService, leaveClassroom as leaveClassroomService, likeClassroomPost, refreshMilestoneProgress as refreshMilestoneProgressService, regenerateJoinCode, removeStudent as removeStudentService, updateClassroom } from '@/services/classroomService'
import { create } from 'zustand'

const PAGE_SIZE = 20

export const useClassroomStore = create((set, get) => ({
  teacherClassrooms: [],
  studentClassroom: null,

  currentClassroom: null,
  classroomPosts: [],
  postsOffset: 0,
  hasMorePosts: true,

  loading: false,
  detailLoading: false,
  postsLoading: false,
  actionLoading: false,
  error: null,

  fetchTeacherClassrooms: async (teacherId) => {
    set({ loading: true, error: null })
    try{
      const classrooms = await getTeacherClassrooms(teacherId)
      set({ teacherClassrooms: classrooms })
    } catch (err) {
      set({ error: err.message })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  createClassroom: async ({ teacherId, name, description }) => {
    set({ actionLoading: true })
    try {
      const classroom = await createClassroomService({ teacherId, name, description })
      set((s) => ({ teacherClassrooms: [classroom, ...s.teacherClassrooms ]}))
      return classroom
    } finally {
      set({ actionLoading: false })
    }
  },

  editClassroom: async (classroomId, updates) => {
    set({ actionLoading: true })
    try {
      const updated = await updateClassroom(classroomId, updates)
      set((s) => ({
        teacherClassrooms: s.teacherClassrooms.map((c) =>
          c.id === classroomId ? updated : c
        )
      }))
    } finally {
      set({ actionLoading: false })
    }
  },


  archiveClassroom: async (classroomId) => {
    set({ actionLoading: true })
    try {
      await archiveClassroomService(classroomId)
      set((s) => ({
        teacherClassrooms: s.teacherClassrooms.filter((c) => c.id !== classroomId),
      }))
    } finally {
      set({ actionLoading: false })
    }
  },

  deleteClassroom: async (classroomId) => {
    set({ actionLoading: true })
    try {
      await deleteClassroomService(classroomId)
      set((s) => ({
        teacherClassrooms: s.teacherClassrooms.filter((c) => c.id !== classroomId),
      }))
    } finally {
      set({ actionLoading: false })
    }
  },

  regenerateCode: async (classroomId) => {
    set({ actionLoading: true })
    try {
      const newCode = await regenerateJoinCode(classroomId)
      set((s) => ({
        teacherClassrooms: s.teacherClassrooms.map((c) =>
          c.id === classroomId ? { ...c, join_code: newCode } : c
        ),
        currentClassroom: s.currentClassroom?.id === classroomId
          ? { ...s.currentClassroom, join_code: newCode }
          : s.currentClassroom,
      }))
      return newCode
    } finally {
      set({ actionLoading: false })
    }
  },

  removeStudent: async (studentId, classroomId) => {
    set({ actionLoading: true })
    try {
      await removeStudentService(studentId, classroomId)
      set((s) => ({
        currentClassroom: s.currentClassroom
          ? {
              ...s.currentClassroom,
              members: s.currentClassroom.members.filter((m) => m.student_id !== studentId),
              member_count: s.currentClassroom.member_count - 1,
            }
          : null,
      }))
    } finally {
      set({ actionLoading: false })
    }
  },

  fetchStudentClassroom: async (studentId) => {
    set({ loading: true, error: null })
    try {
      const classroom = await getStudentClassroom(studentId)
      set({ studentClassroom: classroom })
    } catch (err) {
      set({ error: err.message })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  joinClassroom: async (studentId, joinCode) => {
    set({ actionLoading: true })
    try {
      const classroomId = await joinClassroomService(studentId, joinCode)
      const classroom = await getClassroomDetail(classroomId, studentId)
      set({ studentClassroom: classroom })
      return classroom
    } finally {
      set({ actionLoading: false })
    }
  },

  leaveClassroom: async (studentId, classroomId) => {
    set({ actionLoading: true })
    try {
      await leaveClassroomService(studentId, classroomId)
      set({ studentClassroom: null })
    } finally {
      set({ actionLoading: false })
    }
  },

  fetchClassroomDetail: async (classroomId, currentUserId = null) => {
    set ({ actionLoading: true, error: null })
    try {
      const classroom = await getClassroomDetail(classroomId, currentUserId)
      set({ currentClassroom: classroom })
    } catch (err) {
      set({ error: err.message })
      throw err
    } finally {
      set({ detailLoading: false })
    }
  },

  clearCurrentClassroom: () => set({ currentClassroom: null, classroomPosts: [], postsOffset: 0, hasMorePosts: true }),
  fetchClassroomPosts: async (classroomId) => {
    set({ postsLoading: true, classroomPosts: [], postsOffset: 0, hasMorePosts: true })
    try {
      const posts = await getClassroomPosts(classroomId, { limit: PAGE_SIZE, offset: 0 })
      set({
        classroomPosts: posts,
        postsOffset: posts.length,
        hasMorePosts: posts.length === PAGE_SIZE,
      })
    } finally {
      set({ postsLoading: false })
    }
  },

  fetchMoreClassroomPosts: async (classroomId) => {
    const { postsOffset, hasMorePosts, postsLoading } = get()
    if (!hasMorePosts || postsLoading) return

    set({ postsLoading: true })
    try {
      const posts = await getClassroomPosts( classroomId, { limit: PAGE_SIZE, offset: postsOffset })
      set((s) => ({
        classroomPosts: [...s.classroomPosts, ...posts],
        postsOffset: s.postsOffset + posts.length,
        hasMorePosts: posts.length === PAGE_SIZE,
      }))
    } finally {
      set({ postsLoading: false })
    }
  },

  createPost: async ({ classroomId, authorId, type, content, projectId }) => {
    const post = await createClassroomPost({ classroomId, authorId, type, content, projectId })
    set((s) => ({ classroomPosts: [post, ...s.classroomPosts] }))
    return post
  },

  likePost: async (postId, userId) => {
    const { liked } = await likeClassroomPost(postId, userId)
    set((s) => ({
      classroomPosts: s.classroomPosts.map((p) => {
        if (p.id !== postId) return p
        const likes = p.classroom_post_likes ?? []
        return {
          ...p,
          classroom_post_likes: liked
            ? [...likes, { user_id: userId }]
            : likes.filter((l) => l.user_id !== userId),
        }
      }),
    }))
  },

  commentOnPost: async (postId, authorId, content) => {
    const comment = await commentOnClassroomPost(postId, authorId, content)
    set((s) => ({
      classroomPosts: s.classroomPosts.map((p) =>
        p.id === postId ? { ...p, comments: [...(p.comments ?? []), comment] } : p
      ),
    }))
    return comment
  },

  fetchMilestones: async (classroomId) => {
    const milestones = await getClassroomMilestones(classroomId)
    set((s) => ({
      currentClassroom: s.currentClassroom ? { ...s.currentClassroom, milestones } : null,
    }))
    return milestones
  },

  createMilestone: async ({ classroomId, title, targetScore }) => {
    set({ actionLoading: true })
    try {
      const milestone = await createMilestoneService({ classroomId, title, targetScore })
      set((s) => ({
        currentClassroom: s.currentClassroom
          ? {
              ...s.currentClassroom,
              milestones: [...(s.currentClassroom.milestones ?? []), milestone]
                .sort((a, b) => a.target_score - b.target_score),
            }
          : null,
      }))
      return milestone
    } finally {
      set({ actionLoading: false })
    }
  },

  refreshMilestoneProgress: async (classroomId) => {
    const totalXp = await refreshMilestoneProgressService(classroomId)
    const milestones = await getClassroomMilestones(classroomId)
    set((s) => ({
      currentClassroom: s.currentClassroom ? { ...s.currentClassroom, milestones } : null,
    }))
    return totalXp
  },
}))