import { create } from 'zustand'
import { classroomService } from '../services/classroom.service'

export const useClassroomStore = create((set, get) => ({
  classrooms: [],
  currentClassroom: null,
  loading: false,
  error: null,

  // ─── Teacher ─────────────────────────────────────────

  fetchTeacherClassrooms: async (teacherId) => {
    set({ loading: true, error: null })
    try {
      const classrooms = await classroomService.getClassroomsByTeacher(teacherId)
      set({ classrooms, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  fetchClassroomDetail: async (classroomId) => {
    set({ loading: true, error: null })
    try {
      const classroom = await classroomService.getClassroomWithStudents(classroomId)
      set({ currentClassroom: classroom, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  createClassroom: async (payload) => {
    const classroom = await classroomService.createClassroom(payload)
    set((state) => ({ classrooms: [classroom, ...state.classrooms] }))
    return classroom
  },

  updateClassroom: async (classroomId, updates) => {
    const updated = await classroomService.updateClassroom(classroomId, updates)
    set((state) => ({
      classrooms: state.classrooms.map((c) => (c.id === classroomId ? updated : c)),
      currentClassroom: state.currentClassroom?.id === classroomId ? updated : state.currentClassroom,
    }))
    return updated
  },

  archiveClassroom: async (classroomId) => {
    await classroomService.archiveClassroom(classroomId)
    set((state) => ({
      classrooms: state.classrooms.filter((c) => c.id !== classroomId),
    }))
  },

  regenerateCode: async (classroomId) => {
    const updated = await classroomService.regenerateCode(classroomId)
    set((state) => ({
      classrooms: state.classrooms.map((c) => (c.id === classroomId ? { ...c, class_code: updated.class_code } : c)),
      currentClassroom: state.currentClassroom?.id === classroomId
        ? { ...state.currentClassroom, class_code: updated.class_code }
        : state.currentClassroom,
    }))
    return updated
  },

  removeStudent: async (enrollmentId) => {
    await classroomService.removeStudent(enrollmentId)
    set((state) => ({
      currentClassroom: state.currentClassroom
        ? {
            ...state.currentClassroom,
            classroom_enrollments: state.currentClassroom.classroom_enrollments.filter(
              (e) => e.id !== enrollmentId
            ),
          }
        : null,
    }))
  },

  // ─── Student ─────────────────────────────────────────

  fetchStudentClassrooms: async (studentId) => {
    set({ loading: true, error: null })
    try {
      const classrooms = await classroomService.getClassroomsForStudent(studentId)
      set({ classrooms, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  joinClassroom: async (studentId, classCode) => {
    const classroom = await classroomService.joinClassroom(studentId, classCode)
    // Refetch to get full classroom data with teacher info
    await get().fetchStudentClassrooms(studentId)
    return classroom
  },

  leaveClassroom: async (studentId, classroomId) => {
    await classroomService.leaveClassroom(studentId, classroomId)
    set((state) => ({
      classrooms: state.classrooms.filter((c) => c.id !== classroomId),
    }))
  },
}))