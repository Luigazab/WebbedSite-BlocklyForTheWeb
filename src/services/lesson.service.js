import { supabase } from '../supabaseClient'

export const lessonService = {

  // ─── Teacher: CRUD ──────────────────────────────────────

  async getLessonsByTeacher(teacherId) {
    const { data, error } = await supabase
      .from('lessons')
      .select(`*, lesson_attachments(id), lesson_quizzes(id, quiz:quizzes(id, title))`)
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getLessonById(lessonId) {
    const { data, error } = await supabase
      .from('lessons')
      .select(`
        *,
        teacher:profiles!lessons_teacher_id_fkey(id, username, avatar_url),
        lesson_attachments(*),
        lesson_quizzes(
          id,
          quiz:quizzes(
            *,
            quiz_questions(*),
            badges(id, title, description, icon_url)
          )
        ),
        lesson_tutorials(
          id,
          tutorial:tutorials(
            id, title, description, difficulty_level, estimated_time_minutes, category,
            tutorial_steps(
              id, instruction_text, hint, step_order, order_index,
              tutorial_step_files(id, filename, blocks_json, order_index)
            ),
            badges(id, title, description, icon_url)
          )
        )
      `)
      .eq('id', lessonId)
      .single()
    if (error) throw error
  
    // ── Process quizzes (existing) ──────────────────────────────────────────
    const quizzes = (data.lesson_quizzes ?? []).map((lq) => ({
      ...lq,
      quiz: lq.quiz ? { ...lq.quiz, questions: lq.quiz.quiz_questions ?? [] } : null,
    }))
  
    // ── Process tutorials (new) ─────────────────────────────────────────────
    const tutorials = (data.lesson_tutorials ?? []).map((lt) => ({
      ...lt,
      tutorial: lt.tutorial
        ? {
            ...lt.tutorial,
            steps: (lt.tutorial.tutorial_steps ?? [])
              .sort(
                (a, b) =>
                  (a.order_index ?? a.step_order ?? 0) -
                  (b.order_index ?? b.step_order ?? 0)
              )
              .map((s) => ({
                ...s,
                tutorial_step_files: (s.tutorial_step_files ?? []).sort(
                  (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
                ),
              })),
          }
        : null,
    }))
  
    return {
      ...data,
      attachments: data.lesson_attachments ?? [],
      quizzes,
      tutorials,
    }
  },
  

  async createLesson(payload) {
    const { data, error } = await supabase.from('lessons').insert(payload).select().single()
    if (error) throw error
    return data
  },

  async updateLesson(lessonId, updates) {
    const { data, error } = await supabase
      .from('lessons')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', lessonId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async deleteLesson(lessonId) {
    const { error } = await supabase.from('lessons').delete().eq('id', lessonId)
    if (error) throw error
  },

  // ─── Attachments ───────────────────────────────────────

  async addAttachment(lessonId, attachment) {
    const { data, error } = await supabase
      .from('lesson_attachments')
      .insert({ lesson_id: lessonId, ...attachment })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async removeAttachment(attachmentId) {
    const { error } = await supabase.from('lesson_attachments').delete().eq('id', attachmentId)
    if (error) throw error
  },

  async uploadAttachmentFile(lessonId, file) {
    const ext = file.name.split('.').pop()
    const path = `lessons/${lessonId}/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage.from('lesson-files').upload(path, file)
    if (uploadError) throw uploadError
    const { data } = supabase.storage.from('lesson-files').getPublicUrl(path)
    return { file_url: data.publicUrl, file_name: file.name }
  },

  // ─── Quiz Linking ───────────────────────────────────────

  async attachQuiz(lessonId, quizId) {
    const { data, error } = await supabase
      .from('lesson_quizzes')
      .insert({ lesson_id: lessonId, quiz_id: quizId })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async detachQuiz(lessonId, quizId) {
    const { error } = await supabase
      .from('lesson_quizzes')
      .delete()
      .eq('lesson_id', lessonId)
      .eq('quiz_id', quizId)
    if (error) throw error
  },

  // ─── Classroom Assignment (teacher) ────────────────────

  async assignToClassroom(payload) {
    const { data, error } = await supabase.from('lesson_assignments').insert(payload).select().single()
    if (error) throw error
    return data
  },

  async getClassroomAssignments(classroomId) {
    const { data, error } = await supabase
      .from('lesson_assignments')
      .select(`*, lesson:lessons(*), classroom:classrooms(id, name)`)
      .eq('classroom_id', classroomId)
      .order('assigned_at', { ascending: false })
    if (error) throw error
    return data
  },

  // ─── Student: Classroom Lessons (enriched) ─────────────

  async getClassroomLessonsForStudent(classroomId, studentId) {
    const { data, error } = await supabase
      .from('lesson_assignments')
      .select(`
        *,
        lesson:lessons(
          id, title, content, thumbnail_url, estimated_duration, created_at, updated_at, is_published,
          teacher:profiles!lessons_teacher_id_fkey(id, username, avatar_url),
          lesson_attachments(id, file_name, file_url, file_type, file_size),
          lesson_quizzes(
            id,
            quiz:quizzes(
              id, title, description, passing_score, time_limit,
              quiz_questions(id),
              badges(id, title, description, icon_url)
            )
          )
        )
      `)
      .eq('classroom_id', classroomId)
      .order('assigned_at', { ascending: false })

    if (error) throw error
    if (!data?.length) return []

    const lessonIds = data.map((la) => la.lesson_id).filter(Boolean)
    const quizIds = data.flatMap((la) =>
      (la.lesson?.lesson_quizzes ?? []).map((lq) => lq.quiz?.id).filter(Boolean)
    )

    const progressMap = {}
    if (lessonIds.length) {
      const { data: pData } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('student_id', studentId)
        .in('lesson_id', lessonIds)
      pData?.forEach((p) => { progressMap[p.lesson_id] = p })
    }

    const quizAttemptMap = {}
    if (quizIds.length) {
      const { data: aData } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('student_id', studentId)
        .in('quiz_id', quizIds)
        .order('completed_at', { ascending: false })
      aData?.forEach((a) => { if (!quizAttemptMap[a.quiz_id]) quizAttemptMap[a.quiz_id] = a })
    }

    return data.map((la) => {
      const lesson = la.lesson
      if (!lesson) return la

      const quizzes = (lesson.lesson_quizzes ?? []).map((lq) => ({
        ...lq,
        quiz: lq.quiz ? { ...lq.quiz, questions: lq.quiz.quiz_questions ?? [] } : null,
      }))

      const quiz       = quizzes[0]?.quiz ?? null
      const quizAttempt = quiz ? (quizAttemptMap[quiz.id] ?? null) : null
      const progress    = progressMap[lesson.id] ?? null

      const now = new Date()
      const due = la.due_date ? new Date(la.due_date) : null
      let status = 'assigned'
      if (progress?.completed_at || quizAttempt) status = 'completed'
      else if (due && due < now) status = 'missing'

      return { ...la, status, lesson: { ...lesson, attachments: lesson.lesson_attachments ?? [], quizzes, progress, quizAttempt } }
    })
  },

  // ─── Student: Assignments Tab (cross-classroom) ─────────

  async getStudentLessonAssignments(studentId) {
    const { data: enrollments, error: eErr } = await supabase
      .from('classroom_enrollments')
      .select('classroom_id')
      .eq('student_id', studentId)
      .eq('status', 'active')
    if (eErr) throw eErr

    const classroomIds = enrollments?.map((e) => e.classroom_id) ?? []
    if (!classroomIds.length) return []

    const { data, error } = await supabase
      .from('lesson_assignments')
      .select(`
        *,
        classroom:classrooms(id, name, is_active),
        lesson:lessons(id, title, estimated_duration,
          lesson_quizzes(id, quiz:quizzes(id, title)),
          lesson_attachments(id))
      `)
      .in('classroom_id', classroomIds)
      .not('due_date', 'is', null)
      .order('due_date', { ascending: true })
    if (error) throw error
    if (!data?.length) return []

    const lessonIds = data.map((la) => la.lesson_id).filter(Boolean)
    const progressMap = {}
    if (lessonIds.length) {
      const { data: pData } = await supabase
        .from('lesson_progress')
        .select('lesson_id, progress_percentage, completed_at')
        .eq('student_id', studentId)
        .in('lesson_id', lessonIds)
      pData?.forEach((p) => { progressMap[p.lesson_id] = p })
    }

    const quizIds = data.flatMap((la) => (la.lesson?.lesson_quizzes ?? []).map((lq) => lq.quiz?.id)).filter(Boolean)
    const quizAttemptMap = {}
    if (quizIds.length) {
      const { data: aData } = await supabase
        .from('quiz_attempts')
        .select('quiz_id, score, total_items, completed_at')
        .eq('student_id', studentId)
        .in('quiz_id', quizIds)
        .order('completed_at', { ascending: false })
      aData?.forEach((a) => { if (!quizAttemptMap[a.quiz_id]) quizAttemptMap[a.quiz_id] = a })
    }

    return data.map((la) => {
      const lesson = la.lesson
      const quiz = lesson?.lesson_quizzes?.[0]?.quiz ?? null
      const progress = lesson ? progressMap[lesson.id] : null
      const quizAttempt = quiz ? quizAttemptMap[quiz.id] ?? null : null
      const now = new Date()
      const due = la.due_date ? new Date(la.due_date) : null
      let status = 'assigned'
      if (progress?.completed_at || quizAttempt) status = 'completed'
      else if (due && due < now) status = 'missing'
      return { ...la, progress, quizAttempt, status }
    })
  },

  // ─── Student: ALL quiz attempts for a classroom (for progress tab) ──────────

  async getStudentQuizAttemptsForClassroom(studentId, classroomId) {
    // Get all quiz IDs linked to lessons in this classroom
    const { data: assignments, error: aErr } = await supabase
      .from('lesson_assignments')
      .select(`lesson:lessons(lesson_quizzes(quiz_id, quiz:quizzes(id, title, passing_score, quiz_questions(id), badges(id,title,icon_url))))`)
      .eq('classroom_id', classroomId)
    if (aErr) throw aErr

    const quizMeta = {}  // quizId → { title, passing_score, questionCount, badge }
    assignments?.forEach((la) => {
      la.lesson?.lesson_quizzes?.forEach((lq) => {
        if (lq.quiz) {
          quizMeta[lq.quiz.id] = {
            title:         lq.quiz.title,
            passing_score: lq.quiz.passing_score,
            questionCount: lq.quiz.quiz_questions?.length ?? 0,
            badge:         lq.quiz.badges?.[0] ?? null,
          }
        }
      })
    })

    const quizIds = Object.keys(quizMeta)
    if (!quizIds.length) return []

    const { data: attempts, error: attErr } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('student_id', studentId)
      .in('quiz_id', quizIds)
      .order('completed_at', { ascending: false })
    if (attErr) throw attErr

    // Group by quiz_id
    const grouped = {}
    attempts?.forEach((a) => {
      if (!grouped[a.quiz_id]) grouped[a.quiz_id] = []
      grouped[a.quiz_id].push(a)
    })

    return quizIds
      .filter((qid) => quizMeta[qid])
      .map((qid) => ({
        quizId:       qid,
        ...quizMeta[qid],
        attempts:     grouped[qid] ?? [],
        bestScore:    grouped[qid]?.length
                        ? Math.max(...grouped[qid].map((a) => a.score))
                        : null,
        attemptCount: grouped[qid]?.length ?? 0,
      }))
  },

  // ─── Student: Progress Tracking ────────────────────────

  async updateProgress(studentId, lessonId, updates) {
    const { data, error } = await supabase
      .from('lesson_progress')
      .upsert(
        { student_id: studentId, lesson_id: lessonId, ...updates, last_accessed: new Date().toISOString() },
        { onConflict: 'student_id, lesson_id' }
      )
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getStudentProgress(studentId, lessonId) {
    const { data, error } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('student_id', studentId)
      .eq('lesson_id', lessonId)
      .single()
    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  },

  // ─── Student: Achievements ─────────────────────────────

  async getStudentAchievements(studentId) {
    const { data, error } = await supabase
      .from('achievements')
      .select(`id, earned_at, badge:badges(id, title, description, icon_url)`)
      .eq('user_id', studentId)
      .order('earned_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  async getClassroomBadges(classroomId) {
    const { data, error } = await supabase
      .from('lesson_assignments')
      .select(`lesson:lessons(lesson_quizzes(quiz:quizzes(badges(id, title, description, icon_url, quiz_id))))`)
      .eq('classroom_id', classroomId)
    if (error) throw error
    const badges = []
    data?.forEach((la) => {
      la.lesson?.lesson_quizzes?.forEach((lq) => {
        lq.quiz?.badges?.forEach((b) => { if (b.id) badges.push(b) })
      })
    })
    return badges
  },

  // ─── Student: Members ──────────────────────────────────

  async getClassroomMembers(classroomId) {
    const { data, error } = await supabase
      .from('classroom_enrollments')
      .select(`id, enrolled_at, status, student:profiles(id, username, avatar_url, email)`)
      .eq('classroom_id', classroomId)
      .eq('status', 'active')
      .order('enrolled_at', { ascending: true })
    if (error) throw error
    return data ?? []
  },
}