import { supabase } from '../supabaseClient'
export const assignmentService = {
  // Get assignments for a student (with submission status)
  async getStudentAssignments(studentId) {
    const { data, error } = await supabase
      .from('assignments')
      .select(`
        *,
        classroom:classrooms(id, name),
        lesson:lessons(id, title),
        submission:assignment_submissions!left(
          id,
          status,
          progress,
          submitted_at,
          grade
        )
      `)
      .eq('submission.student_id', studentId)
      .order('due_date', { ascending: true })

    if (error) throw error

    // Filter to only show assignments from classrooms the student is enrolled in
    const { data: enrollments } = await supabase
      .from('classroom_enrollments')
      .select('classroom_id')
      .eq('student_id', studentId)
      .eq('status', 'active')

    const enrolledClassroomIds = enrollments?.map((e) => e.classroom_id) || []
    
    return data?.filter((a) => enrolledClassroomIds.includes(a.classroom_id)) || []
  },

  // Get assignments for a specific classroom
  async getClassroomAssignments(classroomId, studentId) {
    const { data, error } = await supabase
      .from('assignments')
      .select(`
        *,
        lesson:lessons(id, title),
        submission:assignment_submissions!left(
          id,
          status,
          progress,
          submitted_at,
          grade
        )
      `)
      .eq('classroom_id', classroomId)
      .eq('submission.student_id', studentId)
      .order('due_date', { ascending: true })

    if (error) throw error
    return data || []
  },

  // Submit or update assignment
  async submitAssignment(assignmentId, studentId, updates) {
    const { data, error } = await supabase
      .from('assignment_submissions')
      .upsert({
        assignment_id: assignmentId,
        student_id: studentId,
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Teacher: Create assignment
  async createAssignment(payload) {
    const { data, error } = await supabase
      .from('assignments')
      .insert(payload)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Teacher: Update assignment
  async updateAssignment(assignmentId, updates) {
    const { data, error } = await supabase
      .from('assignments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', assignmentId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Teacher: Delete assignment
  async deleteAssignment(assignmentId) {
    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('id', assignmentId)

    if (error) throw error
  },
}