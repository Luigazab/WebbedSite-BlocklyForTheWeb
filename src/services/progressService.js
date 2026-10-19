import { supabase } from "@/supabaseClient"
import { xpService } from './xpService'

export async function completeLesson({ userId, classroomId, lessonId, score = 100 }) {
  const completion = await xpService.completeLesson({ userId, lessonId, score })
  if (!classroomId) return { totalXp: completion.course_total_xp, level: completion.new_level }
  const { data: progress, error } = await supabase.from('user_progress')
    .select('total_xp,current_level').eq('user_id', userId).eq('classroom_id', classroomId).single()
  if (error) throw error
  const result = { totalXp: progress.total_xp, level: progress.current_level }
 
  // The completion trigger evaluates required core work for every eligible
  // class member and unlocks the next topic in the same transaction.
  return result
}

export async function startQuizAttempt(_userId, quizId) {
  const {data,error}=await supabase.rpc('begin_assessed_quiz',{p_quiz:quizId})
  if(error)throw error
  return data
}

export async function submitQuizAttempt({attemptId,answers}) {
  const {data,error}=await supabase.rpc('finish_assessed_quiz',{p_attempt:attemptId,p_answers:answers.map(a=>({questionId:a.questionId,selectedOptionId:a.selectedOptionId??a.optionId}))})
  if(error)throw error
  return {...data,score:Math.round(100*data.score/data.score_total),passed:data.score>=data.passing_count}
}

export async function getAllQuizAttempts(userId, quizId) {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select(`
      id, quiz_id, score, status, started_at, finished_at, score_total, passing_count,
      quiz_answers ( question_id, options_id, is_correct )
    `)
    .eq('user_id', userId)
    .eq('quiz_id', quizId)
    .not('finished_at','is',null)
    .order('started_at', { ascending: true })

  if (error) throw error
  return (data ?? []).map((attempt) => ({
    ...attempt,
    answers: attempt.quiz_answers ?? [],
  }))
}

export async function recordQuizAttempt({ attemptId, answers }) {
 const {data,error}=await supabase.rpc('finish_assessed_quiz',{p_attempt:attemptId,p_answers:answers.map(a=>({questionId:a.questionId,selectedOptionId:a.selectedOptionId}))})
 if(error)throw error
 return data
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
