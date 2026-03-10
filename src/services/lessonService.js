import { supabase } from '../supabaseClient'

// ─── Lessons ────────────────────────────────────────────────────────────────

export const fetchTeacherLessons = async (teacherId) => {
  const { data, error } = await supabase
    .from('lessons')
    .select(`
      *,
      lesson_attachments(id),
      lesson_quizzes(id, quiz:quizzes(id, title))
    `)
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const fetchLessonById = async (id) => {
  const { data, error } = await supabase
    .from('lessons')
    .select(`
      *,
      lesson_attachments(*),
      lesson_quizzes(*, quiz:quizzes(*))
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export const createLesson = async (lessonData) => {
  const { data, error } = await supabase
    .from('lessons')
    .insert(lessonData)
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateLesson = async (id, lessonData) => {
  const { data, error } = await supabase
    .from('lessons')
    .update({ ...lessonData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteLesson = async (id) => {
  const { error } = await supabase.from('lessons').delete().eq('id', id)
  if (error) throw error
}

export const publishLesson = async (id, isPublished) => {
  const { data, error } = await supabase
    .from('lessons')
    .update({ is_published: isPublished, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ─── Attachments ────────────────────────────────────────────────────────────

export const addLessonAttachment = async (attachment) => {
  const { data, error } = await supabase
    .from('lesson_attachments')
    .insert(attachment)
    .select()
    .single()

  if (error) throw error
  return data
}

export const removeLessonAttachment = async (id) => {
  const { error } = await supabase.from('lesson_attachments').delete().eq('id', id)
  if (error) throw error
}

export const uploadLessonFile = async (file, lessonId) => {
  const ext = file.name.split('.').pop()
  const path = `lessons/${lessonId}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`

  const { error: uploadError } = await supabase.storage
    .from('lesson-attachments')
    .upload(path, file, { upsert: false })

  if (uploadError) throw uploadError

  const { data: urlData } = supabase.storage
    .from('lesson-attachments')
    .getPublicUrl(path)

  return { path, url: urlData.publicUrl }
}

export const deleteStorageFile = async (path) => {
  const { error } = await supabase.storage.from('lesson-attachments').remove([path])
  if (error) throw error
}

// ─── Lesson ↔ Quiz linking ───────────────────────────────────────────────────

export const linkQuizToLesson = async (lessonId, quizId) => {
  const { data, error } = await supabase
    .from('lesson_quizzes')
    .insert({ lesson_id: lessonId, quiz_id: quizId })
    .select()
    .single()

  if (error) throw error
  return data
}

export const unlinkQuizFromLesson = async (id) => {
  const { error } = await supabase.from('lesson_quizzes').delete().eq('id', id)
  if (error) throw error
}

// ─── Hand-out ────────────────────────────────────────────────────────────────

export const handOutLesson = async (assignment) => {
  const { data, error } = await supabase
    .from('lesson_assignments')
    .insert(assignment)
    .select()
    .single()

  if (error) throw error
  return data
}

export const fetchTeacherClassrooms = async (teacherId) => {
  const { data, error } = await supabase
    .from('classrooms')
    .select('id, name, class_code')
    .eq('teacher_id', teacherId)
    .eq('is_active', true)
    .order('name')

  if (error) throw error
  return data
}

export const fetchLearnCategories = async () => {
  const { data, error } = await supabase
    .from('learn_categories')
    .select('*')
    .order('order_index')

  if (error) throw error
  return data
}