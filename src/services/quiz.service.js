import { supabase } from '../supabaseClient'

export const quizService = {
  // ─── Teacher ───────────────────────────────────────────

  async createQuizWithQuestions(lessonId, title, questions) {
    // 1. Create quiz
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({ lesson_id: lessonId, title })
      .select()
      .single()
    if (quizError) throw quizError

    // 2. Insert all questions
    const questionsPayload = questions.map((q, i) => ({
      quiz_id: quiz.id,
      question_text: q.question_text,
      options: q.options,           // ["A", "B", "C", "D"]
      correct_answer: q.correct_answer,
      order_index: i,
    }))

    const { error: questionsError } = await supabase
      .from('quiz_questions')
      .insert(questionsPayload)
    if (questionsError) throw questionsError

    return quiz
  },

  async updateQuizWithQuestions(quizId, title, questions) {
    // Update quiz title
    const { error: quizError } = await supabase
      .from('quizzes')
      .update({ title })
      .eq('id', quizId)
    if (quizError) throw quizError

    // Delete old questions and re-insert
    const { error: deleteError } = await supabase
      .from('quiz_questions')
      .delete()
      .eq('quiz_id', quizId)
    if (deleteError) throw deleteError

    const questionsPayload = questions.map((q, i) => ({
      quiz_id: quizId,
      question_text: q.question_text,
      options: q.options,
      correct_answer: q.correct_answer,
      order_index: i,
    }))

    const { error: questionsError } = await supabase
      .from('quiz_questions')
      .insert(questionsPayload)
    if (questionsError) throw questionsError
  },

  async deleteQuiz(quizId) {
    // cascade deletes questions too (set up ON DELETE CASCADE in DB)
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', quizId)
    if (error) throw error
  },

  // ─── Student ───────────────────────────────────────────

  async submitAttempt(quizId, studentId, answers, questions) {
    // answers: { [questionId]: selectedAnswer }
    let score = 0
    questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) score++
    })

    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert({
        quiz_id: quizId,
        student_id: studentId,
        score,
        total_items: questions.length,
        answers,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single()
    if (error) throw error
    return { ...data, score, total_items: questions.length }
  },

  async getAttemptsByStudent(studentId, quizId) {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('student_id', studentId)
      .eq('quiz_id', quizId)
      .order('completed_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getBestAttempt(studentId, quizId) {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('student_id', studentId)
      .eq('quiz_id', quizId)
      .order('score', { ascending: false })
      .limit(1)
      .single()
    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows
    return data ?? null
  },
}