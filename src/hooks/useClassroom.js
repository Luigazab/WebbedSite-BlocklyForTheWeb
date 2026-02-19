import { useClassroomStore } from '../store/classroomStore'
import { useAuthStore } from '../store/authStore'
import { useUIStore } from '../store/uiStore'

export function useClassroom() {
  const store = useClassroomStore()
  const profile = useAuthStore((state) => state.profile)
  const addToast = useUIStore((state) => state.addToast)

  const handleCreateClassroom = async (formData) => {
    try {
      const classroom = await store.createClassroom({
        ...formData,
        teacher_id: profile.id,
      })
      addToast(`"${classroom.name}" created successfully!`, 'success')
      return classroom
    } catch (err) {
      addToast(err.message || 'Failed to create classroom.', 'error')
      throw err
    }
  }

  const handleUpdateClassroom = async (classroomId, updates) => {
    try {
      await store.updateClassroom(classroomId, updates)
      addToast('Classroom updated.', 'success')
    } catch (err) {
      addToast(err.message || 'Failed to update classroom.', 'error')
      throw err
    }
  }

  const handleArchiveClassroom = async (classroomId, name) => {
    try {
      await store.archiveClassroom(classroomId)
      addToast(`"${name}" has been archived.`, 'info')
    } catch (err) {
      addToast(err.message || 'Failed to archive classroom.', 'error')
      throw err
    }
  }

  const handleRegenerateCode = async (classroomId) => {
    try {
      const updated = await store.regenerateCode(classroomId)
      addToast('Class code regenerated.', 'success')
      return updated
    } catch (err) {
      addToast(err.message || 'Failed to regenerate code.', 'error')
      throw err
    }
  }

  const handleRemoveStudent = async (enrollmentId, studentName) => {
    try {
      await store.removeStudent(enrollmentId)
      addToast(`${studentName} removed from classroom.`, 'info')
    } catch (err) {
      addToast(err.message || 'Failed to remove student.', 'error')
      throw err
    }
  }

  const handleJoinClassroom = async (classCode) => {
    try {
      const classroom = await store.joinClassroom(profile.id, classCode)
      addToast(`Joined "${classroom.name}"!`, 'success')
      return classroom
    } catch (err) {
      addToast(err.message || 'Failed to join classroom.', 'error')
      throw err
    }
  }

  const handleLeaveClassroom = async (classroomId, name) => {
    try {
      await store.leaveClassroom(profile.id, classroomId)
      addToast(`You left "${name}".`, 'info')
    } catch (err) {
      addToast(err.message || 'Failed to leave classroom.', 'error')
      throw err
    }
  }

  return {
    ...store,
    handleCreateClassroom,
    handleUpdateClassroom,
    handleArchiveClassroom,
    handleRegenerateCode,
    handleRemoveStudent,
    handleJoinClassroom,
    handleLeaveClassroom,
  }
}