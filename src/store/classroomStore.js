import { create } from 'zustand'
import { toast } from 'sonner'
import {
  createClassroom,
  getTeacherGuilds,
  archiveClassroom,
  deleteClassroom,
  regenerateJoinCode,
  getGuildDetail,
  getStudentGuild,
  joinClassroom,
  leaveClassroom,
  removeStudent,
  getGuildPosts,
  createGuildPost,
  likeGuildPost,
  commentOnGuildPost,
  getGuildMilestones,
  createMilestone,
  refreshMilestoneProgress,
} from '../services/classroomService'

// ─── State shape ──────────────────────────────────────────────────────────────
//
// Teacher state:
//   teacherGuilds[]        – list of classrooms the teacher owns
//
// Student state:
//   studentGuild           – the single classroom the student belongs to (or null)
//
// Shared detail state:
//   currentGuild           – full guild object for the currently open detail page
//   guildPosts[]           – paginated posts for currentGuild
//   postsOffset            – current pagination offset
//   hasMorePosts           – whether more posts exist beyond current page
//
// Loading / error flags:
//   loading                – generic list-level loading
//   detailLoading          – loading for currentGuild
//   postsLoading           – loading for feed
//   actionLoading          – loading for mutations (join, leave, post, etc.)
//   error                  – last error string (or null)

const PAGE_SIZE = 20

export const useClassroomStore = create((set, get) => ({
  teacherGuilds:  [],

  studentGuild:   null,

  currentGuild:   null,
  guildPosts:     [],
  postsOffset:    0,
  hasMorePosts:   true,

  loading:        false,
  detailLoading:  false,
  postsLoading:   false,
  actionLoading:  false,
  error:          null,

  fetchTeacherGuilds: async (teacherId) => {
    set({ loading: true, error: null })
    try {
      const guilds = await getTeacherGuilds(teacherId)
      set({ teacherGuilds: guilds })
    } catch (err) {
      set({ error: err.message })
      toast.error('Failed to load classrooms')
    } finally {
      set({ loading: false })
    }
  },

  handleCreateClassroom: async ({ teacherId, name, description }) => {
    set({ actionLoading: true })
    try {
      const guild = await createClassroom({ teacherId, name, description })
      set((s) => ({ teacherGuilds: [guild, ...s.teacherGuilds] }))
      toast.success(`"${guild.name}" created!`)
      return guild
    } catch (err) {
      toast.error(err.message || 'Failed to create classroom')
      throw err
    } finally {
      set({ actionLoading: false })
    }
  },

  handleArchiveClassroom: async (classroomId, name) => {
    set({ actionLoading: true })
    try {
      await archiveClassroom(classroomId)
      set((s) => ({
        teacherGuilds: s.teacherGuilds.filter((g) => g.id !== classroomId),
      }))
      toast.success(`"${name}" archived`)
    } catch (err) {
      toast.error('Failed to archive classroom')
    } finally {
      set({ actionLoading: false })
    }
  },

  handleDeleteClassroom: async (classroomId, name) => {
    set({ actionLoading: true })
    try {
      await deleteClassroom(classroomId)
      set((s) => ({
        teacherGuilds: s.teacherGuilds.filter((g) => g.id !== classroomId),
      }))
      toast.success(`"${name}" deleted`)
    } catch (err) {
      toast.error('Failed to delete classroom')
    } finally {
      set({ actionLoading: false })
    }
  },

  handleRegenerateCode: async (classroomId) => {
    set({ actionLoading: true })
    try {
      const newCode = await regenerateJoinCode(classroomId)
      set((s) => ({
        teacherGuilds: s.teacherGuilds.map((g) =>
          g.id === classroomId ? { ...g, join_code: newCode } : g
        ),
        currentGuild: s.currentGuild?.id === classroomId
          ? { ...s.currentGuild, join_code: newCode }
          : s.currentGuild,
      }))
      toast.success('Join code regenerated')
      return newCode
    } catch (err) {
      toast.error('Failed to regenerate code')
      throw err
    } finally {
      set({ actionLoading: false })
    }
  },

  handleRemoveStudent: async (studentId, classroomId, username) => {
    set({ actionLoading: true })
    try {
      await removeStudent(studentId, classroomId)
      set((s) => ({
        currentGuild: s.currentGuild
          ? {
              ...s.currentGuild,
              members: s.currentGuild.members.filter((m) => m.student_id !== studentId),
              member_count: s.currentGuild.member_count - 1,
            }
          : null,
      }))
      toast.success(`${username} removed from classroom`)
    } catch (err) {
      toast.error('Failed to remove student')
    } finally {
      set({ actionLoading: false })
    }
  },

  fetchStudentGuild: async (studentId) => {
    set({ loading: true, error: null })
    try {
      const guild = await getStudentGuild(studentId)
      set({ studentGuild: guild })
    } catch (err) {
      set({ error: err.message })
      toast.error('Failed to load your classroom')
    } finally {
      set({ loading: false })
    }
  },

  handleJoinClassroom: async (studentId, joinCode) => {
    set({ actionLoading: true })
    try {
      const classroomId = await joinClassroom(studentId, joinCode)
      const guild = await getGuildDetail(classroomId, studentId)
      set({ studentGuild: guild })
      toast.success(`Joined "${guild.name}"!`)
      return guild
    } catch (err) {
      toast.error(err.message || 'Failed to join classroom')
      throw err
    } finally {
      set({ actionLoading: false })
    }
  },

  handleLeaveClassroom: async (studentId, classroomId, name) => {
    set({ actionLoading: true })
    try {
      await leaveClassroom(studentId, classroomId)
      set({ studentGuild: null })
      toast.success(`Left "${name}"`)
    } catch (err) {
      toast.error('Failed to leave classroom')
    } finally {
      set({ actionLoading: false })
    }
  },

  fetchGuildDetail: async (classroomId, currentUserId = null) => {
    set({ detailLoading: true, error: null })
    try {
      const guild = await getGuildDetail(classroomId, currentUserId)
      set({ currentGuild: guild })
    } catch (err) {
      set({ error: err.message })
      toast.error('Failed to load classroom')
    } finally {
      set({ detailLoading: false })
    }
  },

  clearCurrentGuild: () => set({ currentGuild: null, guildPosts: [], postsOffset: 0, hasMorePosts: true }),

  fetchGuildPosts: async (classroomId) => {
    set({ postsLoading: true, guildPosts: [], postsOffset: 0, hasMorePosts: true })
    try {
      const posts = await getGuildPosts(classroomId, { limit: PAGE_SIZE, offset: 0 })
      set({
        guildPosts:   posts,
        postsOffset:  posts.length,
        hasMorePosts: posts.length === PAGE_SIZE,
      })
    } catch (err) {
      toast.error('Failed to load activity feed')
    } finally {
      set({ postsLoading: false })
    }
  },

  fetchMorePosts: async (classroomId) => {
    const { postsOffset, hasMorePosts, postsLoading } = get()
    if (!hasMorePosts || postsLoading) return

    set({ postsLoading: true })
    try {
      const posts = await getGuildPosts(classroomId, { limit: PAGE_SIZE, offset: postsOffset })
      set((s) => ({
        guildPosts:   [...s.guildPosts, ...posts],
        postsOffset:  s.postsOffset + posts.length,
        hasMorePosts: posts.length === PAGE_SIZE,
      }))
    } catch (err) {
      toast.error('Failed to load more posts')
    } finally {
      set({ postsLoading: false })
    }
  },

  handleCreatePost: async ({ classroomId, authorId, type, content, projectId }) => {
    try {
      const post = await createGuildPost({ classroomId, authorId, type, content, projectId })
      set((s) => ({ guildPosts: [post, ...s.guildPosts] }))
      return post
    } catch (err) {
      toast.error('Failed to create post')
      throw err
    }
  },

  handleLikePost: async (postId, userId) => {
    try {
      const { liked } = await likeGuildPost(postId, userId)
      set((s) => ({
        guildPosts: s.guildPosts.map((p) => {
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
    } catch (err) {
      toast.error('Failed to update like')
    }
  },

  handleCommentOnPost: async (postId, authorId, content) => {
    try {
      const comment = await commentOnGuildPost(postId, authorId, content)
      set((s) => ({
        guildPosts: s.guildPosts.map((p) =>
          p.id === postId
            ? { ...p, comments: [...(p.comments ?? []), comment] }
            : p
        ),
      }))
      return comment
    } catch (err) {
      toast.error('Failed to post comment')
      throw err
    }
  },

  fetchGuildMilestones: async (classroomId) => {
    try {
      const milestones = await getGuildMilestones(classroomId)
      set((s) => ({
        currentGuild: s.currentGuild
          ? { ...s.currentGuild, milestones }
          : null,
      }))
      return milestones
    } catch (err) {
      toast.error('Failed to load milestones')
    }
  },

  handleCreateMilestone: async ({ classroomId, title, targetScore }) => {
    set({ actionLoading: true })
    try {
      const milestone = await createMilestone({ classroomId, title, targetScore })
      set((s) => ({
        currentGuild: s.currentGuild
          ? {
              ...s.currentGuild,
              milestones: [...(s.currentGuild.milestones ?? []), milestone]
                .sort((a, b) => a.target_score - b.target_score),
            }
          : null,
      }))
      toast.success(`Milestone "${title}" created`)
      return milestone
    } catch (err) {
      toast.error('Failed to create milestone')
      throw err
    } finally {
      set({ actionLoading: false })
    }
  },

  handleRefreshMilestoneProgress: async (classroomId) => {
    try {
      const totalXp = await refreshMilestoneProgress(classroomId)
      const milestones = await getGuildMilestones(classroomId)
      set((s) => ({
        currentGuild: s.currentGuild
          ? { ...s.currentGuild, milestones }
          : null,
      }))
      return totalXp
    } catch (err) {
      console.error('Milestone refresh failed:', err)
    }
  },
}))