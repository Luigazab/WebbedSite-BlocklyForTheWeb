import { supabase } from "@/supabaseClient"

async function getLevelForXp(totalXp) {
  const { data, error } = await supabase
    .from('levels')
    .select('level')
    .lte('xp_required', totalXp)
    .order('level', { ascending: false })
    .limit(1)
    .maybeSingle()
 
  if (error) throw error
  return data?.level ?? 1
}

async function logXp({ userId, classroomId, courseId, sourceId, sourceType, xpEarned }) {
  const { error } = await supabase
    .from('user_xp_logs')
    .insert({
      user_id:      userId,
      classroom_id: classroomId,
      course_id:    courseId,
      source_id:    sourceId,
      source_type:  sourceType,
      xp_earned:    xpEarned,
    })
  if (error) throw error
}

async function bumpUserProgress({ userId, classroomId, courseId, xpEarned }) {
  const { data: existing, error: fetchErr } = await supabase
    .from('user_progress')
    .select('current_xp, total_xp')
    .eq('user_id', userId)
    .eq('classroom_id', classroomId)
    .maybeSingle()
 
  if (fetchErr) throw fetchErr
 
  const newTotalXp = (existing?.total_xp ?? 0) + xpEarned
  const newLevel = await getLevelForXp(newTotalXp)
 
  const { error: upsertErr } = await supabase
    .from('user_progress')
    .upsert({
      user_id:       userId,
      classroom_id:  classroomId,
      active_course: courseId,
      current_xp:    (existing?.current_xp ?? 0) + xpEarned,
      total_xp:      newTotalXp,
      current_level: newLevel,
    })
 
  if (upsertErr) throw upsertErr
  return { totalXp: newTotalXp, level: newLevel }
}

export async function completeLesson({ userId, classroomId, courseId, lessonId, topicId, baseXp }) {
  const { error: progressErr } = await supabase
    .from('user_lesson_progress')
    .upsert({
      user_id:      userId,
      lesson_id:    lessonId,
      is_completed: true,
      completed_at: new Date().toISOString(),
    })
  if (progressErr) throw progressErr
 
  await logXp({ userId, classroomId, courseId, sourceId: lessonId, sourceType: 'lesson', xpEarned: baseXp })
  const result = await bumpUserProgress({ userId, classroomId, courseId, xpEarned: baseXp })
 
  const { error: unlockErr } = await supabase.rpc('try_auto_unlock_next_topic', { p_topic_id: topicId })
  if (unlockErr) throw unlockErr
 
  return result
}

export async function startQuizAttempt(userId, quizId) {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert({ user_id: userId, quiz_id: quizId, status: 'in_progress' })
    .select('*')
    .single()
 
  if (error) throw error
  return data
}

export async function submitQuizAttempt({
  attemptId, answers, userId, classroomId, courseId, lessonId, topicId, baseXp, passingScore,
}) {
  const optionIds = answers.map((a) => a.optionId)
  const { data: options, error: optErr } = await supabase
    .from('options')
    .select('id, is_correct')
    .in('id', optionIds)
  if (optErr) throw optErr
 
  const correctById = new Map(options.map((o) => [o.id, o.is_correct]))
  const rows = answers.map((a) => ({
    attempt_id:  attemptId,
    question_id: a.questionId,
    options_id:  a.optionId,
    is_correct:  correctById.get(a.optionId) ?? false,
  }))
 
  const { error: answersErr } = await supabase.from('quiz_answers').insert(rows)
  if (answersErr) throw answersErr
 
  const score = rows.length ? Math.round((rows.filter((r) => r.is_correct).length / rows.length) * 100) : 0
  const passed = passingScore == null || score >= passingScore
 
  const { error: attemptErr } = await supabase
    .from('quiz_attempts')
    .update({ score, status: passed ? 'passed' : 'failed', finished_at: new Date().toISOString() })
    .eq('id', attemptId)
  if (attemptErr) throw attemptErr
 
  if (passed) {
    await completeLesson({ userId, classroomId, courseId, lessonId, topicId, baseXp })
  }
 
  return { score, passed }
}

export async function getAllQuizAttempts(userId, quizId) {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select(`
      id, quiz_id, score, status, started_at, finished_at,
      quiz_answers ( question_id, options_id, is_correct )
    `)
    .eq('user_id', userId)
    .eq('quiz_id', quizId)
    .order('started_at', { ascending: true })

  if (error) throw error
  return (data ?? []).map((attempt) => ({
    ...attempt,
    answers: attempt.quiz_answers ?? [],
  }))
}

export async function recordQuizAttempt({
  userId, quizId, score, startedAt, answers,
  lessonId, classroomId, courseId, topicId, baseXp, passingScore,
}) {
  const passed = passingScore == null || score >= passingScore

  const { data: attempt, error: attemptErr } = await supabase
    .from('quiz_attempts')
    .insert({
      user_id:     userId,
      quiz_id:     quizId,
      score,
      status:      passed ? 'passed' : 'failed',
      started_at:  startedAt ? new Date(startedAt).toISOString() : new Date().toISOString(),
      finished_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (attemptErr) throw attemptErr

  // quiz_answers.options_id is NOT NULL, so unanswered questions are simply omitted.
  const rows = answers
    .filter((a) => a.selectedOptionId)
    .map((a) => ({
      attempt_id:  attempt.id,
      question_id: a.questionId,
      options_id:  a.selectedOptionId,
      is_correct:  a.isCorrect,
    }))

  if (rows.length > 0) {
    const { error: answersErr } = await supabase.from('quiz_answers').insert(rows)
    if (answersErr) throw answersErr
  }

  if (passed && lessonId) {
    await completeLesson({ userId, classroomId, courseId, lessonId, topicId, baseXp })
  }

  return attempt
}

export async function completeLaboratory({ userId, classroomId, courseId, laboratoryId, lessonId, topicId, baseXp }) {
  const { error } = await supabase
    .from('laboratory_completed')
    .upsert({ user_id: userId, laboratory_id: laboratoryId, completed_at: new Date().toISOString() })
  if (error) throw error
 
  return completeLesson({ userId, classroomId, courseId, lessonId, topicId, baseXp })
}

export async function completeTutorialStep({ userId, stepId, isBlock = false }) {
  const table = isBlock ? 'block_step_completed' : 'text_step_completed'
  const { error } = await supabase
    .from(table)
    .upsert({ user_id: userId, step_id: stepId, completed_at: new Date().toISOString() })
  if (error) throw error
}

export async function getStepStartingContent({ userId, tutorialId, currentOrder, fileId, isBlock = false }) {
  const stepsTable = isBlock ? 'block_tutorial_steps' : 'text_tutorial_steps'
  const expectedTable = isBlock ? 'block_tutorial_step_expected' : 'text_tutorial_step_expected'
  const filesTable = isBlock ? 'block_tutorial_step_files' : 'text_tutorial_step_files'
  const completedTable = isBlock ? 'block_step_completed' : 'text_step_completed'
  const contentField = isBlock ? 'initial_content_json' : 'initial_content'
 
  if (currentOrder > 1) {
    const { data: prevStep, error: stepErr } = await supabase
      .from(stepsTable)
      .select('id')
      .eq('tutorial_id', tutorialId)
      .eq('order', currentOrder - 1)
      .maybeSingle()
    if (stepErr) throw stepErr
 
    if (prevStep) {
      const { data: completed, error: completedErr } = await supabase
        .from(completedTable)
        .select('step_id')
        .eq('user_id', userId)
        .eq('step_id', prevStep.id)
        .maybeSingle()
      if (completedErr) throw completedErr
 
      if (completed) {
        const { data: expected, error: expErr } = await supabase
          .from(expectedTable)
          .select('expected_code')
          .eq('step_id', prevStep.id)
          .eq('file_id', fileId)
          .maybeSingle()
        if (expErr) throw expErr
        if (expected) return expected.expected_code
      }
    }
  }
 
  const { data: file, error: fileErr } = await supabase
    .from(filesTable)
    .select(contentField)
    .eq('id', fileId)
    .single()
  if (fileErr) throw fileErr
  return file[contentField]
}

export async function getStudentProgress(userId, classroomId) {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('classroom_id', classroomId)
    .maybeSingle()
 
  if (error) throw error
  return data
}


export async function getLessonProgress(userId, lessonId) {
  const { data, error } = await supabase
    .from('user_lesson_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .maybeSingle()
 
  if (error) throw error
  return data
}