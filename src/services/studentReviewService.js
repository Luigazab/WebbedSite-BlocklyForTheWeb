import { supabase } from '../supabaseClient'

export async function getStudentReview(classroomId, studentId) {
  const { data, error } = await supabase.rpc('get_classroom_student_review', { p_classroom: classroomId, p_student: studentId })
  if (error) throw error
  return data
}

export async function saveLessonSubmission({ lessonId, files, stepId = null, finish = true, activeSeconds = null, deviceFactor = null }) {
  const { data, error } = await supabase.rpc('save_lesson_submission_timed', {
    p_lesson: lessonId, p_files: files, p_step: stepId, p_finish: finish,
    p_active_seconds: activeSeconds, p_device_factor: deviceFactor,
  })
  if (error) throw error
  return Array.isArray(data) ? data[0] : data
}

export async function gradeLaboratorySubmission(submissionId, score, feedback) {
  const { data, error } = await supabase.rpc('grade_laboratory_submission', {
    p_submission: submissionId, p_score: score, p_feedback: feedback,
  })
  if (error) throw error
  return Array.isArray(data) ? data[0] : data
}

export async function getOwnSubmissions(lessonId) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError) throw authError
  if (!user) return []
  const { data, error } = await supabase.from('lesson_submissions').select('*')
    .eq('lesson_id', lessonId).eq('student_id', user.id).order('submitted_at')
  if (error) throw error
  return data ?? []
}

export async function submitLaboratory({ lessonId, files, requestKey, draft = false }) {
 const {data,error}=await supabase.rpc('submit_laboratory',{p_lesson:lessonId,p_files:files,p_request:requestKey,p_draft:draft})
 if(error)throw error
 return Array.isArray(data)?data[0]:data
}
export async function gradeLabRubric(submission, scores, feedback) {
 const {data,error}=await supabase.rpc('grade_lab_rubric',{p_submission:submission.id,p_scores:scores,p_feedback:feedback,p_revision:submission.revision})
 if(error)throw error
 return Array.isArray(data)?data[0]:data
}
export async function copyLearningProject(lessonId) {
 const {data,error}=await supabase.rpc('copy_learning_project',{p_lesson:lessonId})
 if(error)throw error
 return data
}
