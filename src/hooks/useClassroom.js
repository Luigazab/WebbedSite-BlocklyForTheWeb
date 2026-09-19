import { useClassroomStore } from '../store/classroomStore'
import { useAuthStore } from '../store/authStore'
import { toast } from 'sonner'

export function useClassroom() {
  const store = useClassroomStore()
  const profile = useAuthStore((state) => state.profile)

  const fetchTeacherClassrooms = async () => {
    if (!profile?.id) return
    try {
      await store.fetchTeacherClassrooms(profile.id)
    } catch (err) {
      toast.error('Failed to load classrooms')
    }
  }

  const handleCreateClassroom = async ({ name, description }) => {
    try {
      const classroom = await store.createClassroom({ teacherId: profile.id, name, description })
      toast.success(`"${classroom.name}" created successfully!`)
      return classroom
    } catch (err) {
      toast.error(err.message || 'Failed to create classroom.')
      throw err
    }
  }
  

  const handleUpdateClassroom = async (formData) => {
    try {
      await store.editClassroom(formData.id, {name: formData.name, description: formData.description})
      toast.success('Classroom updated succesfully!.')
    } catch (err) {
      toast.error(err.message || 'Failed to update classroom.')
      throw err
    }
  }

  const handleArchiveClassroom = async (classroomId, name) => {
    try {
      await store.archiveClassroom(classroomId)
      toast.success(`"${name}" has been archived.`)
    } catch (err) {
      toast.error(err.message || 'Failed to archive classroom.')
      throw err
    }
  }

  const handleDeleteClassroom = async (classroomId, name) => {
    try {
      await store.deleteClassroom(classroomId)
      toast.success(`"${name}" has been deleted`)
    } catch (err) {
      toast.error('Failed to delete classroom')
      throw err
    }
  }

  const handleRegenerateCode = async (classroomId) => {
    try {
      const code = await store.regenerateCode(classroomId)
      toast.success('Class join code regenerated.')
      return code
    } catch (err) {
      toast.error(err.message || 'Failed to regenerate code.')
      throw err
    }
  }

  const handleRemoveStudent = async (studentId, classroomId, username) => {
    try {
      await store.removeStudent(studentId, classroomId)
      toast.success(`${username} removed from classroom.`)
    } catch (err) {
      toast.error('Failed to remove student.')
      throw err
    }
  }

  const fetchStudentClassroom = async () => {
    if (!profile?.id) return
    try {
      await store.fetchStudentClassroom(profile.id)
    } catch (err) {
      toast.error('Failed to load your classroom')
    }
  }

  const handleJoinClassroom = async (joinCode) => {
    try {
      const classroom = await store.joinClassroom(profile.id, joinCode)
      toast.success(`Joined "${classroom.name}"!`)
      return classroom
    } catch (err) {
      toast.error(err.message || 'Failed to join classroom.')
      throw err
    }
  }

  const handleLeaveClassroom = async (classroomId, name) => {
    try {
      await store.leaveClassroom(profile.id, classroomId)
      toast.success(`You left "${name}".`)
    } catch (err) {
      toast.error(err.message || 'Failed to leave classroom.')
      throw err
    }
  }

  const fetchClassroomDetail = async (classroomId) => {
    try {
      await store.fetchClassroomDetail(classroomId, profile?.id)
    } catch (err) {
      toast.error('Failed to load classroom')
    }
  }
 
  const fetchClassroomPosts = async (classroomId) => {
    try {
      await store.fetchClassroomPosts(classroomId)
    } catch (err) {
      toast.error('Failed to load activity feed')
    }
  }
 
  const fetchMoreClassroomPosts = async (classroomId) => {
    try {
      await store.fetchMoreClassroomPosts(classroomId)
    } catch (err) {
      toast.error('Failed to load more posts')
    }
  }
 
  const handleCreatePost = async ({ classroomId, type, content, projectId }) => {
    try {
      return await store.createPost({ classroomId, authorId: profile.id, type, content, projectId })
    } catch (err) {
      toast.error('Failed to create post')
      throw err
    }
  }
 
  const handleLikePost = async (postId) => {
    try {
      await store.likePost(postId, profile.id)
    } catch (err) {
      toast.error('Failed to update like')
    }
  }
 
  const handleCommentOnPost = async (postId, content) => {
    try {
      return await store.commentOnPost(postId, profile.id, content)
    } catch (err) {
      toast.error('Failed to post comment')
      throw err
    }
  }
 
  // ── Milestones ──────────────────────────────────────────────────────────
  const fetchMilestones = async (classroomId) => {
    try {
      return await store.fetchMilestones(classroomId)
    } catch (err) {
      toast.error('Failed to load milestones')
    }
  }
 
  const handleCreateMilestone = async ({ classroomId, title, targetScore }) => {
    try {
      const milestone = await store.createMilestone({ classroomId, title, targetScore })
      toast.success(`Milestone "${title}" created`)
      return milestone
    } catch (err) {
      toast.error('Failed to create milestone')
      throw err
    }
  }
 
  const handleRefreshMilestoneProgress = async (classroomId) => {
    try {
      return await store.refreshMilestoneProgress(classroomId)
    } catch (err) {
      console.error(err.message || 'Milestone refresh failed:')
    }
  }

  return {
    teacherClassrooms: store.teacherClassrooms,
    studentClassroom:  store.studentClassroom,
    currentClassroom:  store.currentClassroom,
    classroomPosts:    store.classroomPosts,
    hasMorePosts:      store.hasMorePosts,
    loading:           store.loading,
    detailLoading:     store.detailLoading,
    postsLoading:      store.postsLoading,
    actionLoading:     store.actionLoading,
    error:             store.error,
 
    fetchTeacherClassrooms,
    handleCreateClassroom,
    handleUpdateClassroom,
    handleArchiveClassroom,
    handleDeleteClassroom,
    handleRegenerateCode,
    handleRemoveStudent,
    fetchStudentClassroom,
    handleJoinClassroom,
    handleLeaveClassroom,
    fetchClassroomDetail,
    clearCurrentClassroom: store.clearCurrentClassroom,
    fetchClassroomPosts,
    fetchMoreClassroomPosts,
    handleCreatePost,
    handleLikePost,
    handleCommentOnPost,
    fetchMilestones,
    handleCreateMilestone,
    handleRefreshMilestoneProgress,
  }
}