import { supabase } from '../supabaseClient'

async function getClassroomLessonIds(classroomId) {
  const { data, error } = await supabase
    .from('lessons')
    .select('id')
    .eq('classroom_id', classroomId)
    .eq('is_published', true)

  if (error) throw error
  return (data ?? []).map((l) => l.id)
}

export async function getStudentProgressList(classroomId) {
  const { data: members, error: memErr } = await supabase
    .from('classroom_members')
    .select('student_id, enrolled_at, student:student_id ( id, username, avatar_url, email )')
    .eq('classroom_id', classroomId)

  if (memErr) throw memErr
  const studentIds = (members ?? []).map((m) => m.student_id)
  if (studentIds.length === 0) return []

  const lessonIds = await getClassroomLessonIds(classroomId)

  const [{ data: progressRows, error: progErr }, { data: completions, error: compErr }] = await Promise.all([
    supabase
      .from('user_progress')
      .select('user_id, current_xp, total_xp, current_level')
      .eq('classroom_id', classroomId)
      .in('user_id', studentIds),
    lessonIds.length
      ? supabase
          .from('user_lesson_progress')
          .select('user_id, lesson_id')
          .in('user_id', studentIds)
          .in('lesson_id', lessonIds)
          .eq('is_completed', true)
      : Promise.resolve({ data: [], error: null }),
  ])
  if (progErr) throw progErr
  if (compErr) throw compErr

  const progressByUser = new Map((progressRows ?? []).map((p) => [p.user_id, p]))
  const completedCountByUser = new Map()
  for (const row of completions ?? []) {
    completedCountByUser.set(row.user_id, (completedCountByUser.get(row.user_id) ?? 0) + 1)
  }

  const totalLessons = lessonIds.length

  return (members ?? [])
    .map((m) => {
      const progress = progressByUser.get(m.student_id)
      const completed = completedCountByUser.get(m.student_id) ?? 0
      return {
        studentId:        m.student_id,
        username:         m.student?.username ?? 'Unknown',
        email:            m.student?.email ?? null,
        avatarUrl:        m.student?.avatar_url ?? null,
        enrolledAt:       m.enrolled_at,
        completedLessons: completed,
        totalLessons,
        progressPct:      totalLessons ? Math.round((completed / totalLessons) * 100) : 0,
        currentXp:        progress?.current_xp ?? 0,
        currentLevel:     progress?.current_level ?? 1,
      }
    })
    .sort((a, b) => b.progressPct - a.progressPct)
}

// ── Per-lesson completion rate (drives the % on each lesson chip) ──────────
export async function getLessonCompletionRates(classroomId) {
  const lessonIds = await getClassroomLessonIds(classroomId)
  const { count: studentCount, error: countErr } = await supabase
    .from('classroom_members')
    .select('student_id', { count: 'exact', head: true })
    .eq('classroom_id', classroomId)
  if (countErr) throw countErr

  if (!lessonIds.length || !studentCount) return {}

  const { data: rows, error } = await supabase
    .from('user_lesson_progress')
    .select('lesson_id')
    .in('lesson_id', lessonIds)
    .eq('is_completed', true)
  if (error) throw error

  const counts = {}
  for (const r of rows ?? []) counts[r.lesson_id] = (counts[r.lesson_id] ?? 0) + 1

  const rates = {}
  for (const id of lessonIds) rates[id] = Math.round(((counts[id] ?? 0) / studentCount) * 100)
  return rates
}

// ── Top-of-page stat cards ───────────────────────────────────────────────────
// Note: "pendingSubmissions" is a proxy = quiz attempts a student started but
// never finished (status = 'in_progress'). Your schema auto-grades quizzes on
// submit, so there's no real "awaiting teacher grading" queue yet — if you
// want manually-graded work (e.g. lab review), that needs a status field
// added to laboratory_completed or similar. Flagging rather than guessing.
export async function getClassroomOverviewStats(classroomId) {
  const [{ count: studentCount, error: studErr }, { data: topics, error: topicsErr }] = await Promise.all([
    supabase.from('classroom_members').select('student_id', { count: 'exact', head: true }).eq('classroom_id', classroomId),
    supabase.from('topics').select('id, is_unlocked').eq('classroom_id', classroomId),
  ])
  if (studErr) throw studErr
  if (topicsErr) throw topicsErr

  const totalTopics = topics?.length ?? 0
  const unlockedTopics = (topics ?? []).filter((t) => t.is_unlocked).length

  const lessonIds = await getClassroomLessonIds(classroomId)
  let pendingSubmissions = 0
  if (lessonIds.length) {
    const { data: quizzes, error: quizErr } = await supabase.from('quizzes').select('id').in('lesson_id', lessonIds)
    if (quizErr) throw quizErr
    const quizIds = (quizzes ?? []).map((q) => q.id)
    if (quizIds.length) {
      const { count, error: attErr } = await supabase
        .from('quiz_attempts')
        .select('id', { count: 'exact', head: true })
        .in('quiz_id', quizIds)
        .eq('status', 'in_progress')
      if (attErr) throw attErr
      pendingSubmissions = count ?? 0
    }
  }

  const progressList = await getStudentProgressList(classroomId)
  const avgProgressPct = progressList.length
    ? Math.round(progressList.reduce((sum, s) => sum + s.progressPct, 0) / progressList.length)
    : 0

  return {
    studentCount: studentCount ?? 0,
    avgProgressPct,
    unlockedTopics,
    totalTopics,
    pendingSubmissions,
  }
}