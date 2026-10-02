import { supabase } from '../supabaseClient'

export async function getClassroomBadgeRules(classroomId) {
  const { data, error } = await supabase.from('classroom_badge_rules').select('*')
    .eq('classroom_id', classroomId).order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function createClassroomBadgeRule(values) {
  const { data, error } = await supabase.from('classroom_badge_rules').insert(values).select().single()
  if (error) throw error
  return data
}

export async function setClassroomBadgeActive(id, isActive) {
  const { error } = await supabase.from('classroom_badge_rules').update({ is_active: isActive }).eq('id', id)
  if (error) throw error
}

export async function getBadgeLibrary() {
  const { data, error } = await supabase.from('badges').select('id,name,image_url').is('topic_id', null)
  if (error) throw error
  return data ?? []
}

export async function getStudentBadgeAwards(studentId) {
  const { data, error } = await supabase.from('classroom_badge_awards').select('*')
    .eq('student_id', studentId).order('earned_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getStudentRecentActivity(studentId) {
  const [{ data: posts, error }, awards] = await Promise.all([
    supabase.from('classroom_posts').select('id,type,content,created_at,classroom_id')
      .eq('author_id', studentId).neq('type', 'announcement').neq('type', 'badge_earned')
      .order('created_at', { ascending: false }).limit(20),
    getStudentBadgeAwards(studentId),
  ])
  if (error) throw error
  return [...(posts ?? []), ...awards.map(award => ({
    id: `award-${award.id}`, type: 'badge_earned', created_at: award.earned_at,
    content: `Earned the "${award.name}" badge. ${award.requirement}.`,
    classroom_id: award.classroom_id,
  }))].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 20)
}
