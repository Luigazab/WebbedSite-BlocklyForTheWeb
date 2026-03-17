import { supabase } from '../supabaseClient'

export const quizService = {
  async createQuiz(payload) {
    const { data, error } = await supabase
      .from('quizzes')
      .insert({
        teacher_id:    payload.teacher_id,
        title:         payload.title,
        description:   payload.description,
        time_limit:    payload.time_limit,
        passing_score: payload.passing_score || null,
      })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateQuiz(quizId, updates) {
    const { data, error } = await supabase
      .from('quizzes')
      .update(updates)
      .eq('id', quizId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async deleteQuiz(quizId) {
    const { error } = await supabase.from('quizzes').delete().eq('id', quizId)
    if (error) throw error
  },

  async getQuizzesByTeacher(teacherId) {
    const { data, error } = await supabase
      .from('quizzes')
      .select(`
        *,
        questions:quiz_questions(id),
        lessons:lesson_quizzes(lesson:lessons(id, title))
      `)
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getQuizById(quizId) {
    const { data, error } = await supabase
      .from('quizzes')
      .select(`
        *,
        questions:quiz_questions(*),
        teacher:profiles!quizzes_teacher_id_fkey(id, username, avatar_url)
      `)
      .eq('id', quizId)
      .single()
    if (error) throw error
    return data
  },

  async addQuestion(quizId, question) {
    const { data, error } = await supabase
      .from('quiz_questions')
      .insert({ quiz_id: quizId, ...question })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateQuestion(questionId, updates) {
    const { data, error } = await supabase
      .from('quiz_questions')
      .update(updates)
      .eq('id', questionId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async deleteQuestion(questionId) {
    const { error } = await supabase.from('quiz_questions').delete().eq('id', questionId)
    if (error) throw error
  },

  async submitAttempt(quizId, studentId, answers, questions) {
    let correct = 0
    const resolvedAnswers = {}  // { [questionId]: selectedText }

    questions.forEach((q) => {
      const opts = Array.isArray(q.options)
        ? q.options
        : Object.values(q.options ?? {})

      const raw = answers[q.id]

      let selectedText = null
      if (typeof raw === 'number' && Number.isInteger(raw)) {
        selectedText = opts[raw] ?? null
      } else if (typeof raw === 'string') {
        selectedText = raw
      }

      resolvedAnswers[q.id] = selectedText

      if (selectedText !== null && selectedText === q.correct_answer) {
        correct++
      }
    })

    const score = questions.length > 0
      ? Math.round((correct / questions.length) * 100)
      : 0

    const { data: attempt, error } = await supabase
      .from('quiz_attempts')
      .insert({
        quiz_id:     quizId,
        student_id:  studentId,
        score,                      // percentage
        total_items: questions.length,
        answers:     resolvedAnswers, // text strings, not indices
      })
      .select()
      .single()
    if (error) throw error

    const { data: quizRow } = await supabase
      .from('quizzes')
      .select('passing_score, badges(id, title, description, icon_url)')
      .eq('id', quizId)
      .single()

    const passingScore = quizRow?.passing_score ?? null
    const badge        = quizRow?.badges?.[0]   ?? null
    const passed       = passingScore === null ? true : correct >= passingScore

    let earnedBadge = null
    if (passed && badge) {
      const { data: existing } = await supabase
        .from('achievements')
        .select('id')
        .eq('user_id', studentId)
        .eq('badge_earned', badge.id)
        .maybeSingle()

      if (!existing) {
        await supabase
          .from('achievements')
          .insert({ user_id: studentId, badge_earned: badge.id })
      }
      earnedBadge = badge
    }

    return {
      ...attempt,
      correct,      // raw number of correct answers
      passed,
      earnedBadge,
    }
  },

  async getBestAttempt(studentId, quizId) {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('student_id', studentId)
      .eq('quiz_id', quizId)
      .order('score', { ascending: false }) // score is %, higher = better
      .limit(1)
      .maybeSingle()
    if (error) throw error
    return data
  },
}