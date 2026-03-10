import { supabase } from '../supabaseClient'

// ─── Quizzes ─────────────────────────────────────────────────────────────────

export const fetchTeacherQuizzes = async (teacherId) => {
  const { data, error } = await supabase
    .from('quizzes')
    .select(`
      *,
      quiz_questions(id),
      badges(id, title, icon_url)
    `)
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const fetchQuizById = async (id) => {
  const { data, error } = await supabase
    .from('quizzes')
    .select(`
      *,
      quiz_questions(*),
      badges(*)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export const createQuiz = async (quizData) => {
  const { data, error } = await supabase
    .from('quizzes')
    .insert(quizData)
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateQuiz = async (id, quizData) => {
  const { data, error } = await supabase
    .from('quizzes')
    .update(quizData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteQuiz = async (id) => {
  const { error } = await supabase.from('quizzes').delete().eq('id', id)
  if (error) throw error
}

// ─── Questions ────────────────────────────────────────────────────────────────

export const upsertQuizQuestions = async (quizId, questions) => {
  // Delete existing, then re-insert in order
  const { error: deleteError } = await supabase
    .from('quiz_questions')
    .delete()
    .eq('quiz_id', quizId)

  if (deleteError) throw deleteError

  if (questions.length === 0) return []

  const rows = questions.map((q, i) => ({
    quiz_id: quizId,
    question_text: q.question_text,
    options: q.options,
    correct_answer: q.correct_answer,
    order_index: i,
  }))

  const { data, error } = await supabase
    .from('quiz_questions')
    .insert(rows)
    .select()

  if (error) throw error
  return data
}

// ─── Badges ───────────────────────────────────────────────────────────────────

export const fetchAdminPresetBadges = async () => {
  // Badges not yet tied to a tutorial (preset icons set by admin)
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .is('tutorial_id', null)
    .order('created_at')

  if (error) throw error
  return data
}

export const createBadge = async (badgeData) => {
  const { data, error } = await supabase
    .from('badges')
    .insert(badgeData)
    .select()
    .single()

  if (error) throw error
  return data
}

export const uploadBadgeImage = async (file) => {
  const ext = file.name.split('.').pop()
  const path = `badges/${Date.now()}_${file.name.replace(/\s+/g, '_')}`

  const { error: uploadError } = await supabase.storage
    .from('badges')
    .upload(path, file, { upsert: false })

  if (uploadError) throw uploadError

  const { data: urlData } = supabase.storage.from('badges').getPublicUrl(path)
  return urlData.publicUrl
}

// For the AttachQuizModal on lessons – search through teacher's quizzes
export const searchTeacherQuizzes = async (teacherId, query = '') => {
  let q = supabase
    .from('quizzes')
    .select('id, title, description, passing_score, quiz_questions(id)')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false })

  if (query) {
    q = q.ilike('title', `%${query}%`)
  }

  const { data, error } = await q
  if (error) throw error
  return data
}