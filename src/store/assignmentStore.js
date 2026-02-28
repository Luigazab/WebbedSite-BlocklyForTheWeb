import { create } from 'zustand'
import { assignmentService } from '../services/assignment.service'

export const useAssignmentStore = create((set) => ({
  assignments: [],
  loading: false,
  error: null,

  fetchStudentAssignments: async (studentId) => {
    set({ loading: true, error: null })
    try {
      const assignments = await assignmentService.getStudentAssignments(studentId)
      set({ assignments, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  fetchClassroomAssignments: async (classroomId, studentId) => {
    set({ loading: true, error: null })
    try {
      const assignments = await assignmentService.getClassroomAssignments(classroomId, studentId)
      set({ assignments, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  submitAssignment: async (assignmentId, studentId, updates) => {
    try {
      await assignmentService.submitAssignment(assignmentId, studentId, updates)
      // Refresh assignments
      set((state) => ({
        assignments: state.assignments.map((a) =>
          a.id === assignmentId
            ? { ...a, submission: { ...a.submission, ...updates } }
            : a
        ),
      }))
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },
}))