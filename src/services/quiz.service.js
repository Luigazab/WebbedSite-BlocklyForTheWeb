import { supabase } from '../supabaseClient'

export const quizService = {
  async createQuiz(payload) {
    const { data, error } = await supabase
      .from('quizzes')
      .insert({
        teacher_id: payload.teacher_id,
        title: payload.title,
        description: payload.description,
        time_limit: payload.time_limit,
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
    // answers = { [questionId]: optionIndex (integer) }
    // correct_answer is stored as the option TEXT string
    let correct = 0
    questions.forEach((q) => {
      const selectedIndex = answers[q.id]
      const selectedText  = Array.isArray(q.options) ? q.options[selectedIndex] : undefined
      if (selectedText !== undefined && selectedText === q.correct_answer) correct++
    })

    const score = questions.length > 0
      ? Math.round((correct / questions.length) * 100)
      : 0

    // passing_score is a raw count — compare correct count directly
    const passingCount = questions.length > 0 && quizService._passingScore !== undefined
      ? quizService._passingScore
      : null // will be resolved below

    const { data: attempt, error } = await supabase
      .from('quiz_attempts')
      .insert({
        quiz_id:     quizId,
        student_id:  studentId,
        score,
        total_items: questions.length,
        answers,
      })
      .select()
      .single()
    if (error) throw error

    const { data: quizRow } = await supabase
      .from('quizzes')
      .select('passing_score, badges(id, title, description, icon_url)')
      .eq('id', quizId)
      .single()

    const ps    = quizRow?.passing_score ?? null 
    const badge = quizRow?.badges?.[0] ?? null
    const passed = ps === null ? true : correct >= ps

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
      correct,       
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
      .order('score', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) throw error
    return data
  },
}