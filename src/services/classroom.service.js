import { supabase } from '../supabaseClient'

export const classroomService = {
  // ─── Teacher: CRUD ─────────────────────────────────────

  async createClassroom(payload) {
    const class_code = await classroomService._generateUniqueCode()
    const { data, error } = await supabase
      .from('classrooms')
      .insert({ ...payload, class_code })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getClassroomsByTeacher(teacherId) {
    const { data, error } = await supabase
      .from('classrooms')
      .select(`*, classroom_enrollments(count)`)
      .eq('teacher_id', teacherId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getArchivedClassroomsByTeacher(teacherId) {
    const { data, error } = await supabase
      .from('classrooms')
      .select(`*, classroom_enrollments(count)`)
      .eq('teacher_id', teacherId)
      .eq('is_active', false)
      .order('updated_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getClassroomWithStudents(classroomId) {
    const { data, error } = await supabase
      .from('classrooms')
      .select(`
        *,
        teacher:profiles!classrooms_teacher_id_fkey(id, username, avatar_url),
        classroom_enrollments(
          id,
          enrolled_at,
          status,
          student:profiles(id, username, email, avatar_url, last_login)
        )
      `)
      .eq('id', classroomId)
      .single()
    if (error) throw error
    return data
  },

  async updateClassroom(classroomId, updates) {
    const { data, error } = await supabase
      .from('classrooms')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', classroomId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async archiveClassroom(classroomId) {
    const { data, error } = await supabase
      .from('classrooms')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', classroomId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async deleteClassroom(classroomId) {
    const { error } = await supabase
      .from('classrooms')
      .delete()
      .eq('id', classroomId)
    if (error) throw error
  },

  async removeStudent(enrollmentId) {
    const { error } = await supabase
      .from('classroom_enrollments')
      .update({ status: 'removed' })
      .eq('id', enrollmentId)
    if (error) throw error
  },

  async regenerateCode(classroomId) {
    const class_code = await classroomService._generateUniqueCode()
    const { data, error } = await supabase
      .from('classrooms')
      .update({ class_code })
      .eq('id', classroomId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  // ─── Teacher: Performance ───────────────────────────────

  async getClassroomPerformanceData(classroomId) {
    const { data: enrollments, error: eErr } = await supabase
      .from('classroom_enrollments')
      .select(`id, enrolled_at, student:profiles(id, username, avatar_url, email)`)
      .eq('classroom_id', classroomId)
      .eq('status', 'active')
    if (eErr) throw eErr
    if (!enrollments?.length) return []

    const studentIds = enrollments.map((e) => e.student?.id).filter(Boolean)

    const { data: assignments, error: aErr } = await supabase
      .from('lesson_assignments')
      .select(`id, lesson_id, due_date, lesson:lessons(lesson_quizzes(quiz_id, quiz:quizzes(id, passing_score, quiz_questions(id))))`)
      .eq('classroom_id', classroomId)
    if (aErr) throw aErr

    const lessonIds = assignments.map((a) => a.lesson_id).filter(Boolean)
    const quizIds   = assignments.flatMap((a) => (a.lesson?.lesson_quizzes ?? []).map((lq) => lq.quiz_id)).filter(Boolean)

    const { data: allProgress } = await supabase
      .from('lesson_progress')
      .select('student_id, lesson_id, progress_percentage, completed_at')
      .in('student_id', studentIds)
      .in('lesson_id', lessonIds.length ? lessonIds : ['00000000-0000-0000-0000-000000000000'])

    const { data: allAttempts } = await supabase
      .from('quiz_attempts')
      .select('student_id, quiz_id, score, completed_at')
      .in('student_id', studentIds)
      .in('quiz_id', quizIds.length ? quizIds : ['00000000-0000-0000-0000-000000000000'])
      .order('score', { ascending: false })

    const { data: allAchievements } = await supabase
      .from('achievements')
      .select('user_id, badge_earned')
      .in('user_id', studentIds)

    const progressByStudent = {}
    allProgress?.forEach((p) => {
      if (!progressByStudent[p.student_id]) progressByStudent[p.student_id] = {}
      progressByStudent[p.student_id][p.lesson_id] = p
    })

    const attemptsByStudent = {}
    allAttempts?.forEach((a) => {
      if (!attemptsByStudent[a.student_id]) attemptsByStudent[a.student_id] = {}
      const cur = attemptsByStudent[a.student_id][a.quiz_id]
      if (!cur || a.score > cur.score) attemptsByStudent[a.student_id][a.quiz_id] = a
    })

    const achievementsByStudent = {}
    allAchievements?.forEach((ac) => {
      if (!achievementsByStudent[ac.user_id]) achievementsByStudent[ac.user_id] = []
      achievementsByStudent[ac.user_id].push(ac)
    })

    const now = new Date()

    return enrollments.map((enrollment) => {
      const sid      = enrollment.student?.id
      const progress = progressByStudent[sid] ?? {}
      const attempts = attemptsByStudent[sid] ?? {}
      const achs     = achievementsByStudent[sid] ?? []

      let completed = 0, missing = 0, onTime = 0
      const quizScores = []

      assignments.forEach((la) => {
        const prog = progress[la.lesson_id]
        const due  = la.due_date ? new Date(la.due_date) : null
        const done = !!prog?.completed_at

        if (done) {
          completed++
          if (due && new Date(prog.completed_at) <= due) onTime++
        } else if (due && due < now) {
          missing++
        }

        const quizId = la.lesson?.lesson_quizzes?.[0]?.quiz_id
        if (quizId && attempts[quizId]) quizScores.push(attempts[quizId].score)
      })

      return {
        enrollment,
        student:     enrollment.student,
        lessonStats: { total: assignments.length, completed, missing },
        avgQuizScore: quizScores.length
          ? Math.round(quizScores.reduce((s, v) => s + v, 0) / quizScores.length)
          : null,
        badgeCount:  achs.length,
        onTimeCount: onTime,
        quizScores,
      }
    })
  },

  async getTeacherAggregatePerformance(teacherId) {
    const { data: classrooms, error } = await supabase
      .from('classrooms')
      .select(`
        id, name,
        classroom_enrollments(
          id,
          status,
          student_id,
          student:profiles(id, username, avatar_url)
        )
      `)
      .eq('teacher_id', teacherId)
      .eq('is_active', true)
    if (error) throw error
    if (!classrooms?.length) return { classrooms: [], byClassroom: {}, totalStudents: 0, totalBadges: 0, overallAvgScore: null, overallCompletion: 0 }

    // Only active enrollments
    const classroomsWithActive = classrooms.map((c) => ({
      ...c,
      classroom_enrollments: (c.classroom_enrollments ?? []).filter((e) => e.status === 'active'),
    }))

    const classroomIds = classrooms.map((c) => c.id)
    const studentIds   = [...new Set(
      classroomsWithActive.flatMap((c) => c.classroom_enrollments.map((e) => e.student_id))
    )]

    const { data: assignments } = await supabase
      .from('lesson_assignments')
      .select(`id, lesson_id, classroom_id, due_date, lesson:lessons(lesson_quizzes(quiz_id))`)
      .in('classroom_id', classroomIds)

    const lessonIds = assignments?.map((a) => a.lesson_id).filter(Boolean) ?? []
    const quizIds   = assignments?.flatMap((a) => (a.lesson?.lesson_quizzes ?? []).map((lq) => lq.quiz_id)).filter(Boolean) ?? []

    const { data: allProgress } = studentIds.length && lessonIds.length
      ? await supabase.from('lesson_progress').select('student_id, lesson_id, completed_at').in('student_id', studentIds).in('lesson_id', lessonIds)
      : { data: [] }

    const { data: allAttempts } = studentIds.length && quizIds.length
      ? await supabase.from('quiz_attempts').select('student_id, quiz_id, score').in('student_id', studentIds).in('quiz_id', quizIds)
      : { data: [] }

    const { data: allBadges } = studentIds.length
      ? await supabase.from('achievements').select('user_id').in('user_id', studentIds)
      : { data: [] }

    const completedSet = new Set(
      (allProgress ?? []).filter((p) => p.completed_at).map((p) => `${p.student_id}:${p.lesson_id}`)
    )
    const quizMap = {}
    ;(allAttempts ?? []).forEach((a) => {
      const key = `${a.student_id}:${a.quiz_id}`
      if (!quizMap[key] || a.score > quizMap[key]) quizMap[key] = a.score
    })
    const totalBadges = (allBadges ?? []).length

    const byClassroom = {}
    classroomsWithActive.forEach((c) => {
      const cAssignments = assignments?.filter((a) => a.classroom_id === c.id) ?? []
      const cStudentIds  = c.classroom_enrollments.map((e) => e.student_id)
      let cCompleted = 0, cTotal = 0, cQuizScores = []

      cStudentIds.forEach((sid) => {
        cAssignments.forEach((la) => {
          cTotal++
          if (completedSet.has(`${sid}:${la.lesson_id}`)) cCompleted++
          const qid = la.lesson?.lesson_quizzes?.[0]?.quiz_id
          if (qid && quizMap[`${sid}:${qid}`] != null) cQuizScores.push(quizMap[`${sid}:${qid}`])
        })
      })

      byClassroom[c.id] = {
        name:           c.name,
        students:       cStudentIds.length,
        total:          cTotal,
        completed:      cCompleted,
        completionRate: cTotal ? Math.round((cCompleted / cTotal) * 100) : 0,
        avgQuizScore:   cQuizScores.length
          ? Math.round(cQuizScores.reduce((s, v) => s + v, 0) / cQuizScores.length)
          : null,
      }
    })

    const allScores = Object.values(quizMap)
    return {
      classrooms: classroomsWithActive,   // ← includes status-filtered enrollments with student profiles
      byClassroom,
      totalStudents:      studentIds.length,
      totalBadges,
      overallAvgScore:    allScores.length ? Math.round(allScores.reduce((s, v) => s + v, 0) / allScores.length) : null,
      overallCompletion:  lessonIds.length && studentIds.length
        ? Math.round((completedSet.size / (lessonIds.length * studentIds.length)) * 100)
        : 0,
    }
  },

  // ─── Student ───────────────────────────────────────────

  async joinClassroom(studentId, classCode) {
    const { data: classroom, error: findError } = await supabase
      .from('classrooms')
      .select('id, name, is_active')
      .eq('class_code', classCode.toUpperCase().trim())
      .single()
    if (findError || !classroom) throw new Error('Classroom not found. Check your code and try again.')
    if (!classroom.is_active) throw new Error('This classroom is no longer active.')

    const { data: existing } = await supabase
      .from('classroom_enrollments')
      .select('id, status')
      .eq('classroom_id', classroom.id)
      .eq('student_id', studentId)
      .single()

    if (existing) {
      if (existing.status === 'active') throw new Error('You are already enrolled in this classroom.')
      const { error } = await supabase
        .from('classroom_enrollments')
        .update({ status: 'active' })
        .eq('id', existing.id)
      if (error) throw error
      return classroom
    }

    const { error: enrollError } = await supabase
      .from('classroom_enrollments')
      .insert({ classroom_id: classroom.id, student_id: studentId })
    if (enrollError) throw enrollError
    return classroom
  },

  async getClassroomsForStudent(studentId) {
    const { data, error } = await supabase
      .from('classroom_enrollments')
      .select(`
        id, enrolled_at, status,
        classroom:classrooms(
          id, name, description, class_code, created_at, is_active,
          teacher:profiles!classrooms_teacher_id_fkey(id, username, avatar_url)
        )
      `)
      .eq('student_id', studentId)
      .eq('status', 'active')
      .order('enrolled_at', { ascending: false })
    if (error) throw error
    return data.map((e) => ({ enrollmentId: e.id, enrolledAt: e.enrolled_at, ...e.classroom }))
  },

  async leaveClassroom(studentId, classroomId) {
    const { error } = await supabase
      .from('classroom_enrollments')
      .update({ status: 'removed' })
      .eq('student_id', studentId)
      .eq('classroom_id', classroomId)
    if (error) throw error
  },

  async _generateUniqueCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code, exists
    do {
      code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
      const { data } = await supabase.from('classrooms').select('id').eq('class_code', code).maybeSingle()
      exists = !!data
    } while (exists)
    return code
  },
}