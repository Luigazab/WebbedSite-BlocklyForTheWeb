import { supabase } from '../supabaseClient'

export const lessonService = {
  // ─── CRUD Operations ────────────────────────────────────
  
  async createLesson(payload) {
    const { data, error } = await supabase
      .from('lessons')
      .insert({
        teacher_id: payload.teacher_id,
        title: payload.title,
        content_markdown: payload.content_markdown,
        thumbnail_url: payload.thumbnail_url,
        estimated_duration: payload.estimated_duration,
        is_published: payload.is_published || false,
      })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateLesson(lessonId, updates) {
    const { data, error } = await supabase
      .from('lessons')
      .update(updates)
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

  async getLessonById(lessonId) {
    const { data, error } = await supabase
      .from('lessons')
      .select(`
        *,
        teacher:profiles!lessons_teacher_id_fkey(id, username, avatar_url),
        attachments:lesson_attachments(*),
        quizzes:lesson_quizzes(
          quiz:quizzes(
            *,
            questions:quiz_questions(*)
          )
        )
      `)
      .eq('id', lessonId)
      .single()
    if (error) throw error
    return data
  },

  async getLessonsByTeacher(teacherId) {
    const { data, error } = await supabase
      .from('lessons')
      .select('*, attachments:lesson_attachments(id)')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  // ─── Attachments ────────────────────────────────────────
  
  async addAttachment(lessonId, attachment) {
    const { data, error } = await supabase
      .from('lesson_attachments')
      .insert({
        lesson_id: lessonId,
        ...attachment,
      })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async deleteAttachment(attachmentId) {
    const { error } = await supabase
      .from('lesson_attachments')
      .delete()
      .eq('id', attachmentId)
    if (error) throw error
  },

  async uploadAttachmentFile(lessonId, file) {
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}.${ext}`
    const path = `lessons/${lessonId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('lesson-files')
      .upload(path, file)
    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('lesson-files')
      .getPublicUrl(path)

    return { file_url: data.publicUrl, file_name: file.name }
  },

  // ─── Quiz Linking ───────────────────────────────────────
  
  async attachQuiz(lessonId, quizId) {
    const { data, error } = await supabase
      .from('lesson_quizzes')
      .insert({ lesson_id: lessonId, quiz_id: quizId })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async detachQuiz(lessonId, quizId) {
    const { error } = await supabase
      .from('lesson_quizzes')
      .delete()
      .eq('lesson_id', lessonId)
      .eq('quiz_id', quizId)
    if (error) throw error
  },

  // ─── Classroom Assignment ───────────────────────────────
  
  async assignToClassroom(payload) {
    const { data, error } = await supabase
      .from('lesson_assignments')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getClassroomAssignments(classroomId) {
    const { data, error } = await supabase
      .from('lesson_assignments')
      .select(`
        *,
        lesson:lessons(*),
        classroom:classrooms(id, name)
      `)
      .eq('classroom_id', classroomId)
      .order('assigned_at', { ascending: false })
    if (error) throw error
    return data
  },

  // ─── Progress Tracking ──────────────────────────────────
  
  async updateProgress(studentId, lessonId, updates) {
    const { data, error } = await supabase
      .from('lesson_progress')
      .upsert({
        student_id: studentId,
        lesson_id: lessonId,
        ...updates,
        last_accessed: new Date().toISOString(),
      })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getStudentProgress(studentId, lessonId) {
    const { data, error } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('student_id', studentId)
      .eq('lesson_id', lessonId)
      .single()
    if (error) {
      if (error.code === 'PGRST116') return null // No progress yet
      throw error
    }
    return data
  },
}