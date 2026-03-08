import { supabase } from '../supabaseClient'

export const quizService = {
  // ─── CRUD Operations ────────────────────────────────────
  
  async createQuiz(payload) {
    const { data, error } = await supabase
      .from('quizzes')
      .insert({
        teacher_id: payload.teacher_id,
        title: payload.title,
        description: payload.description,
        time_limit: payload.time_limit,
        passing_score: payload.passing_score || 70,
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
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', quizId)
    if (error) throw error
  },

  async getQuizzesByTeacher(teacherId) {
    const { data, error } = await supabase
      .from('quizzes')
      .select(`
        *,
        questions:quiz_questions(id),
        lessons:lesson_quizzes(
          lesson:lessons(id, title)
        )
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

  // Questions remain the same...
  async addQuestion(quizId, question) {
    const { data, error } = await supabase
      .from('quiz_questions')
      .insert({
        quiz_id: quizId,
        ...question,
      })
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
    const { error } = await supabase
      .from('quiz_questions')
      .delete()
      .eq('id', questionId)
    if (error) throw error
  },

  // Attempts remain similar...
  async submitAttempt(quizId, studentId, answers, questions) {
    let correct = 0
    questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) correct++
    })
    const score = Math.round((correct / questions.length) * 100)

    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert({
        quiz_id: quizId,
        student_id: studentId,
        score,
        total_items: questions.length,
        answers,
      })
      .select()
      .single()
    if (error) throw error
    return data
  },
}