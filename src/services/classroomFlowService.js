import { supabase } from '../supabaseClient'

export async function getClassroomTopicFlow(classroomId) {
  const { data, error } = await supabase.rpc('get_classroom_topic_flow', { p_classroom: classroomId })
  if (error) throw error
  return data ?? { topics: [], events: [] }
}

export async function setClassroomTopicExemption(topicId, studentId, exempt, reason = '') {
  const { error } = await supabase.rpc('set_classroom_topic_exemption', {
    p_topic: topicId, p_student: studentId, p_exempt: exempt, p_reason: reason,
  })
  if (error) throw error
}

export async function setClassroomLessonRule(lessonId, track, required) {
  const { error } = await supabase.rpc('set_classroom_lesson_rule', {
    p_lesson: lessonId, p_track: track, p_required: required,
  })
  if (error) throw error
}

export async function setClassroomLessonTargetMinutes(lessonId, minutes) {
  const { error } = await supabase.rpc('set_classroom_lesson_target_minutes', {
    p_lesson: lessonId, p_minutes: minutes,
  })
  if (error) throw error
}
