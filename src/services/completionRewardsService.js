import { supabase } from '../supabaseClient'

export async function getCompletionRewards(lessonId) {
  const { data, error } = await supabase.rpc('lesson_completion_rewards', { p_lesson: lessonId })
  if (error) throw error
  return data
}
const queueKey = (userId, classroomId) => `topic-celebrations:${userId}:${classroomId}`
export function pendingBadges(userId, classroomId) {
  try { return JSON.parse(sessionStorage.getItem(queueKey(userId, classroomId)) || '[]') } catch { return [] }
}
export function queueBadges(userId, classroomId, awards) {
  const unique = [...new Map([...pendingBadges(userId, classroomId), ...awards].map(award => [award.id, award])).values()]
  try { sessionStorage.setItem(queueKey(userId, classroomId), JSON.stringify(unique)) } catch { /* Route state also carries awards. */ }
  return unique
}
export function dismissBadge(userId, classroomId, id) {
  const remaining = pendingBadges(userId, classroomId).filter(award => award.id !== id)
  try { sessionStorage.setItem(queueKey(userId, classroomId), JSON.stringify(remaining)) } catch { /* Storage may be disabled. */ }
}
