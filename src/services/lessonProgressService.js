import { supabase } from '../supabaseClient'

// ─── user_lesson_progress ─────────────────────────────────────────────────────

export const markLessonComplete = async (userId, lessonId) => {
  const { data, error } = await supabase
    .from('user_lesson_progress')
    .upsert(
      {
        user_id:      userId,
        lesson_id:    lessonId,
        is_completed: true,
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,lesson_id' }
    )
    .select()
    .single()
  if (error) throw error
  return data
}

export const getLessonProgress = async (userId, lessonId) => {
  const { data, error } = await supabase
    .from('user_lesson_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .maybeSingle()
  if (error) throw error
  return data
}

// ─── quiz_attempts + quiz_answers ────────────────────────────────────────────

/**
 * Submit a new attempt and its per-question answers.
 * score = raw correct-answer count (integer).
 * answers = [{ questionId, selectedOptionId, isCorrect }]
 */
export const submitQuizAttempt = async (userId, quizId, score, startedAt, answers) => {
  const { data: attempt, error: attemptError } = await supabase
    .from('quiz_attempts')
    .insert({
      user_id:     userId,
      quiz_id:     quizId,
      score,
      status:      'completed',
      started_at:  startedAt.toISOString(),
      finished_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (attemptError) throw attemptError

  const answeredRows = answers
    .filter((a) => a.selectedOptionId !== null)
    .map((a) => ({
      attempt_id:  attempt.id,
      question_id: a.questionId,
      options_id:  a.selectedOptionId,
      is_correct:  a.isCorrect,
    }))

  if (answeredRows.length > 0) {
    const { error: answersError } = await supabase
      .from('quiz_answers')
      .insert(answeredRows)
    if (answersError) throw answersError
  }

  return { attempt, answers: answeredRows }
}

/**
 * Fetch ALL attempts a user has made on a quiz, ordered oldest→newest,
 * with each attempt's quiz_answers joined.
 *
 * Each item in the returned array:
 * {
 *   id, score, status, started_at, finished_at,
 *   answers: [{ question_id, options_id, is_correct }]
 * }
 */
export const getAllQuizAttempts = async (userId, quizId) => {
  const { data: attempts, error } = await supabase
    .from('quiz_attempts')
    .select('id, score, status, started_at, finished_at')
    .eq('user_id', userId)
    .eq('quiz_id', quizId)
    .order('started_at', { ascending: true })
  if (error) throw error
  if (!attempts || attempts.length === 0) return []

  const attemptIds = attempts.map((a) => a.id)
  const { data: allAnswers, error: ansError } = await supabase
    .from('quiz_answers')
    .select('attempt_id, question_id, options_id, is_correct')
    .in('attempt_id', attemptIds)
  if (ansError) throw ansError

  const answersByAttempt = {}
  for (const row of allAnswers ?? []) {
    if (!answersByAttempt[row.attempt_id]) answersByAttempt[row.attempt_id] = []
    answersByAttempt[row.attempt_id].push(row)
  }

  return attempts.map((attempt) => ({
    ...attempt,
    answers: answersByAttempt[attempt.id] ?? [],
  }))
}

export const getBestQuizAttempt = async (userId, quizId) => {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('user_id', userId)
    .eq('quiz_id', quizId)
    .order('score', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
}