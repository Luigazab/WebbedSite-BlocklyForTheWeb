import { supabase } from '../supabaseClient'

export const classroomService = {
  // ─── Teacher ───────────────────────────────────────────

  async createClassroom(payload) {
    // payload: { teacher_id, name, description }
    const class_code = await classroomService._generateUniqueCode()
    const { data, error } = await supabase
      .from('classrooms')
      .insert({ ...payload, class_code })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getClassroomsByTeacher(teacherId) {
    const { data, error } = await supabase
      .from('classrooms')
      .select(`
        *,
        classroom_enrollments(count)
      `)
      .eq('teacher_id', teacherId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getClassroomWithStudents(classroomId) {
    const { data, error } = await supabase
      .from('classrooms')
      .select(`
        *,
        classroom_enrollments(
          id,
          enrolled_at,
          status,
          student:profiles(id, username, email, avatar_url, last_login)
        )
      `)
      .eq('id', classroomId)
      .single()
    if (error) throw error
    return data
  },

  async updateClassroom(classroomId, updates) {
    const { data, error } = await supabase
      .from('classrooms')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', classroomId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async archiveClassroom(classroomId) {
    const { data, error } = await supabase
      .from('classrooms')
      .update({ is_active: false })
      .eq('id', classroomId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async removeStudent(enrollmentId) {
    const { error } = await supabase
      .from('classroom_enrollments')
      .update({ status: 'removed' })
      .eq('id', enrollmentId)
    if (error) throw error
  },

  async regenerateCode(classroomId) {
    const class_code = await classroomService._generateUniqueCode()
    const { data, error } = await supabase
      .from('classrooms')
      .update({ class_code })
      .eq('id', classroomId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  // ─── Student ───────────────────────────────────────────

  async joinClassroom(studentId, classCode) {
    // 1. Find classroom by code
    const { data: classroom, error: findError } = await supabase
      .from('classrooms')
      .select('id, name, is_active')
      .eq('class_code', classCode.toUpperCase().trim())
      .single()

    if (findError || !classroom) throw new Error('Classroom not found. Check your code and try again.')
    if (!classroom.is_active) throw new Error('This classroom is no longer active.')

    // 2. Check if already enrolled
    const { data: existing } = await supabase
      .from('classroom_enrollments')
      .select('id, status')
      .eq('classroom_id', classroom.id)
      .eq('student_id', studentId)
      .single()

    if (existing) {
      if (existing.status === 'active') throw new Error('You are already enrolled in this classroom.')
      // Re-activate if previously removed
      const { error: reactivateError } = await supabase
        .from('classroom_enrollments')
        .update({ status: 'active' })
        .eq('id', existing.id)
      if (reactivateError) throw reactivateError
      return classroom
    }

    // 3. Enroll
    const { error: enrollError } = await supabase
      .from('classroom_enrollments')
      .insert({ classroom_id: classroom.id, student_id: studentId })
    if (enrollError) throw enrollError

    return classroom
  },

  async getClassroomsForStudent(studentId) {
    const { data, error } = await supabase
      .from('classroom_enrollments')
      .select(`
        id,
        enrolled_at,
        status,
        classroom:classrooms(
          id,
          name,
          description,
          class_code,
          created_at,
          teacher:profiles!classrooms_teacher_id_fkey(username, avatar_url)
        )
      `)
      .eq('student_id', studentId)
      .eq('status', 'active')
      .order('enrolled_at', { ascending: false })
    if (error) throw error
    return data.map((e) => ({ enrollmentId: e.id, enrolledAt: e.enrolled_at, ...e.classroom }))
  },

  async leaveClassroom(studentId, classroomId) {
    const { error } = await supabase
      .from('classroom_enrollments')
      .update({ status: 'removed' })
      .eq('student_id', studentId)
      .eq('classroom_id', classroomId)
    if (error) throw error
  },

  // ─── Helpers ───────────────────────────────────────────

  async _generateUniqueCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code, exists

    do {
      code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
      const { data } = await supabase
        .from('classrooms')
        .select('id')
        .eq('class_code', code)
        .maybeSingle()
      exists = !!data
    } while (exists)

    return code
  },
}