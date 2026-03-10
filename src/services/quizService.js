import { supabase } from '../supabaseClient'

// ─── Quizzes ──────────────────────────────────────────────────────────────────

export const fetchTeacherQuizzes = async (teacherId) => {
  const { data, error } = await supabase
    .from('quizzes')
    .select(`
      *,
      quiz_questions(id),
      badges(id, title, description, icon_url)
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

// ─── Badge (one per quiz) ─────────────────────────────────────────────────────
//
// Each quiz owns exactly one badge row (badges.quiz_id → quizzes.id).
// "Preset images" from the admin pool only supply the icon_url — the badge
// record itself is always freshly created/owned by this quiz.

export const upsertQuizBadge = async (quizId, { existingBadgeId, title, description, icon_url }) => {
  if (existingBadgeId) {
    const { data, error } = await supabase
      .from('badges')
      .update({ title, description, icon_url, updated_at: new Date().toISOString() })
      .eq('id', existingBadgeId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  const { data, error } = await supabase
    .from('badges')
    .insert({ quiz_id: quizId, title, description, icon_url })
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteQuizBadge = async (badgeId) => {
  const { error } = await supabase.from('badges').delete().eq('id', badgeId)
  if (error) throw error
}

// ─── Admin preset image pool ──────────────────────────────────────────────────
// These are badge rows where quiz_id IS NULL and tutorial_id IS NULL.
// Teachers borrow the icon_url only — they do NOT reuse the row itself.

export const fetchAdminPresetBadgeImages = async () => {
  const { data, error } = await supabase
    .from('badges')
    .select('id, title, icon_url')
    .is('quiz_id', null)
    .is('tutorial_id', null)
    .not('icon_url', 'is', null)
    .order('created_at')

  if (error) throw error
  return data
}

export const uploadBadgeImage = async (file) => {
  const path = `badges/${Date.now()}_${file.name.replace(/\s+/g, '_')}`

  const { error: uploadError } = await supabase.storage
    .from('badges')
    .upload(path, file, { upsert: false })

  if (uploadError) throw uploadError

  const { data: urlData } = supabase.storage.from('badges').getPublicUrl(path)
  return urlData.publicUrl
}

// ─── Quiz search (for AttachQuizModal) ───────────────────────────────────────

export const searchTeacherQuizzes = async (teacherId, query = '') => {
  let q = supabase
    .from('quizzes')
    .select('id, title, description, passing_score, quiz_questions(id)')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false })

  if (query) q = q.ilike('title', `%${query}%`)

  const { data, error } = await q
  if (error) throw error
  return data
}