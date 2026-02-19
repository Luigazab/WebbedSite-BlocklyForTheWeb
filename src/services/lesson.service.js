import { supabase } from '../supabaseClient'

export const lessonService = {
  // ─── Teacher ───────────────────────────────────────────

  async createLesson(payload) {
    const { data, error } = await supabase
      .from('lessons')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateLesson(lessonId, updates) {
    const { data, error } = await supabase
      .from('lessons')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', lessonId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async deleteLesson(lessonId) {
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', lessonId)
    if (error) throw error
  },

  async getLessonsByTeacher(teacherId) {
    const { data, error } = await supabase
      .from('lessons')
      .select('*, classroom:classrooms(id, name)')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  // ─── Student ───────────────────────────────────────────

  async getLessonsByClassroom(classroomId) {
    const { data, error } = await supabase
      .from('lessons')
      .select('*, teacher:profiles!lessons_teacher_id_fkey(username, avatar_url)')
      .eq('classroom_id', classroomId)
      .eq('is_published', true)
      .order('order_index', { ascending: true })
    if (error) throw error
    return data
  },

  async getLessonById(lessonId) {
    const { data, error } = await supabase
      .from('lessons')
      .select(`
        *,
        teacher:profiles!lessons_teacher_id_fkey(username, avatar_url),
        quizzes(
          id,
          title,
          quiz_questions(id, question_text, options, order_index)
        )
      `)
      .eq('id', lessonId)
      .single()
    if (error) throw error
    return data
  },

  async getLessonProgress(studentId, classroomId) {
    const { data, error } = await supabase
      .from('lesson_progress')
      .select('lesson_id, is_completed, completed_at')
      .eq('student_id', studentId)
    if (error) throw error
    return data // array of { lesson_id, is_completed }
  },

  async markLessonComplete(studentId, lessonId) {
    const { error } = await supabase
      .from('lesson_progress')
      .upsert({
        student_id: studentId,
        lesson_id: lessonId,
        is_completed: true,
        completed_at: new Date().toISOString(),
      }, { onConflict: 'student_id,lesson_id' })
    if (error) throw error
  },
}