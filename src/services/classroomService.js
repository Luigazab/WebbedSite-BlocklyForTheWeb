import { supabase } from '../supabaseClient'
import { nanoid } from 'nanoid'


function generateJoinCode() {
  return nanoid(6).toUpperCase()
}

function normalizeClassroom(row, currentUserId = null) {
  const members = row.classroom_members ?? []
  return {
    id:                    row.id,
    name:                  row.name,
    description:           row.description,
    join_code:             row.join_code,
    is_active:             row.is_active,
    created_at:            row.created_at,
    teacher:               row.profiles ?? null,       // joined teacher profile
    members,
    member_count:          members.length,
    milestones:            row.classroom_milestones ?? [],
    posts:                 row.classroom_posts ?? [],
    current_user_membership: currentUserId
      ? members.find((m) => m.student_id === currentUserId) ?? null
      : null,
  }
}

export async function createClassroom({ teacherId, name, description = '' }) {
  const join_code = generateJoinCode()

  const { data, error } = await supabase
    .from('classrooms')
    .insert({ teacher_id: teacherId, name, description, join_code, is_active: true })
    .select(`
      *,
      profiles:teacher_id ( id, username, avatar_url, email ),
      classroom_members ( classroom_id, student_id, enrolled_at )
    `)
    .single()

  if (error) throw error
  return normalizeClassroom(data)
}

export async function getTeacherGuilds(teacherId) {
  const { data, error } = await supabase
    .from('classrooms')
    .select(`
      *,
      profiles:teacher_id ( id, username, avatar_url, email ),
      classroom_members ( classroom_id, student_id, enrolled_at,
        student:student_id ( id, username, avatar_url, email )
      ),
      classroom_milestones ( id, title, target_score, current_score )
    `)
    .eq('teacher_id', teacherId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map((row) => normalizeClassroom(row))
}

export async function archiveClassroom(classroomId) {
  const { error } = await supabase
    .from('classrooms')
    .update({ is_active: false })
    .eq('id', classroomId)

  if (error) throw error
}

export async function deleteClassroom(classroomId) {
  const { error } = await supabase
    .from('classrooms')
    .delete()
    .eq('id', classroomId)

  if (error) throw error
}

export async function regenerateJoinCode(classroomId) {
  const join_code = generateJoinCode()
  const { data, error } = await supabase
    .from('classrooms')
    .update({ join_code })
    .eq('id', classroomId)
    .select('join_code')
    .single()

  if (error) throw error
  return data.join_code
}

export async function getGuildDetail(classroomId, currentUserId = null) {
  const { data, error } = await supabase
    .from('classrooms')
    .select(`
      *,
      profiles:teacher_id ( id, username, avatar_url, email ),
      classroom_members (
        classroom_id, student_id, enrolled_at,
        student:student_id ( id, username, avatar_url, email )
      ),
      classroom_milestones ( id, title, target_score, current_score ),
      classroom_posts (
        id, type, content, created_at, project_id, author_id,
        author:author_id ( id, username, avatar_url ),
        classroom_post_likes ( user_id ),
        comments (
          id, content, created_at,
          author:author_id ( id, username, avatar_url )
        )
      )
    `)
    .eq('id', classroomId)
    .single()

  if (error) throw error
  return normalizeClassroom(data, currentUserId)
}

export async function joinClassroom(studentId, joinCode) {
  const { data: existing, error: memberErr } = await supabase
    .from('classroom_members')
    .select('classroom_id')
    .eq('student_id', studentId)
    .maybeSingle()

  if (memberErr) throw memberErr
  if (existing) throw new Error('You already belong to a classroom.')

  const { data: classroom, error: codeErr } = await supabase
    .from('classrooms')
    .select('id, is_active')
    .eq('join_code', joinCode.trim().toUpperCase())
    .maybeSingle()

  if (codeErr) throw codeErr
  if (!classroom) throw new Error('Invalid join code. Please check and try again.')
  if (!classroom.is_active) throw new Error('This classroom is no longer active.')

  const { error: insertErr } = await supabase
    .from('classroom_members')
    .insert({ classroom_id: classroom.id, student_id: studentId })

  if (insertErr) throw insertErr
  return classroom.id
}

export async function leaveClassroom(studentId, classroomId) {
  const { error } = await supabase
    .from('classroom_members')
    .delete()
    .eq('student_id', studentId)
    .eq('classroom_id', classroomId)

  if (error) throw error
}

export async function removeStudent(studentId, classroomId) {
  const { error } = await supabase
    .from('classroom_members')
    .delete()
    .eq('student_id', studentId)
    .eq('classroom_id', classroomId)

  if (error) throw error
}

export async function getStudentGuild(studentId) {
  const { data: membership, error: mErr } = await supabase
    .from('classroom_members')
    .select('classroom_id')
    .eq('student_id', studentId)
    .maybeSingle()

  if (mErr) throw mErr
  if (!membership) return null

  return getGuildDetail(membership.classroom_id, studentId)
}

export async function getGuildPosts(classroomId, { limit = 20, offset = 0 } = {}) {
  const { data, error } = await supabase
    .from('classroom_posts')
    .select(`
      id, type, content, created_at, project_id, author_id,
      author:author_id ( id, username, avatar_url ),
      classroom_post_likes ( user_id ),
      comments (
        id, content, created_at,
        author:author_id ( id, username, avatar_url )
      )
    `)
    .eq('classroom_id', classroomId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data ?? []
}

export async function createGuildPost({ classroomId, authorId, type, content, projectId = null }) {
  const { data, error } = await supabase
    .from('classroom_posts')
    .insert({
      classroom_id: classroomId,
      author_id:    authorId,
      type,
      content,
      project_id:   projectId,
    })
    .select(`
      id, type, content, created_at, project_id, author_id,
      author:author_id ( id, username, avatar_url ),
      classroom_post_likes ( user_id ),
      comments ( id, content, created_at, author:author_id ( id, username, avatar_url ) )
    `)
    .single()

  if (error) throw error
  return data
}

export async function likeGuildPost(postId, userId) {
  const { data: existing } = await supabase
    .from('classroom_post_likes')
    .select('user_id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('classroom_post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId)
    if (error) throw error
    return { liked: false }
  } else {
    const { error } = await supabase
      .from('classroom_post_likes')
      .insert({ post_id: postId, user_id: userId })
    if (error) throw error
    return { liked: true }
  }
}

export async function commentOnGuildPost(postId, authorId, content) {
  const { data, error } = await supabase
    .from('comments')
    .insert({ post_id: postId, author_id: authorId, content })
    .select(`
      id, content, created_at,
      author:author_id ( id, username, avatar_url )
    `)
    .single()

  if (error) throw error
  return data
}

export async function getGuildMilestones(classroomId) {
  const { data, error } = await supabase
    .from('classroom_milestones')
    .select('*')
    .eq('classroom_id', classroomId)
    .order('target_score', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function createMilestone({ classroomId, title, targetScore }) {
  const { data, error } = await supabase
    .from('classroom_milestones')
    .insert({
      id:           crypto.randomUUID(),
      classroom_id: classroomId,
      title,
      target_score: targetScore,
      current_score: 0,
    })
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function refreshMilestoneProgress(classroomId) {
  const { data: members, error: mErr } = await supabase
    .from('classroom_members')
    .select('student_id')
    .eq('classroom_id', classroomId)

  if (mErr) throw mErr
  if (!members?.length) return

  const studentIds = members.map((m) => m.student_id)

  const { data: xpRows, error: xpErr } = await supabase
    .from('user_xp_logs')
    .select('xp_earned')
    .in('user_id', studentIds)

  if (xpErr) throw xpErr

  const totalXp = (xpRows ?? []).reduce((sum, row) => sum + (row.xp_earned ?? 0), 0)

  const { error: updateErr } = await supabase
    .from('classroom_milestones')
    .update({ current_score: totalXp })
    .eq('classroom_id', classroomId)

  if (updateErr) throw updateErr
  return totalXp
}


async function getStudentClassroomId(studentId) {
  const { data } = await supabase
    .from('classroom_members')
    .select('classroom_id')
    .eq('student_id', studentId)
    .maybeSingle()
  return data?.classroom_id ?? null
}

export async function onLessonComplete({ studentId, lessonTitle, lessonId }) {
  const classroomId = await getStudentClassroomId(studentId)
  if (!classroomId) return

  await createGuildPost({
    classroomId,
    authorId: studentId,
    type:    'lecture_completed',
    content: `completed the lesson "${lessonTitle}"`,
  })
}

export async function onQuizComplete({ studentId, quizId, lessonTitle, score }) {
  const classroomId = await getStudentClassroomId(studentId)
  if (!classroomId) return

  await createGuildPost({
    classroomId,
    authorId: studentId,
    type:    'quiz_scored',
    content: `scored ${score}% on the quiz for "${lessonTitle}"`,
  })
}

export async function onLabComplete({ studentId, labId, lessonTitle }) {
  const classroomId = await getStudentClassroomId(studentId)
  if (!classroomId) return

  await createGuildPost({
    classroomId,
    authorId: studentId,
    type:    'laboratory_completed',
    content: `completed the lab for "${lessonTitle}"`,
  })
}

export async function onXpLogged(studentId) {
  const classroomId = await getStudentClassroomId(studentId)
  if (!classroomId) return

  await refreshMilestoneProgress(classroomId)
}