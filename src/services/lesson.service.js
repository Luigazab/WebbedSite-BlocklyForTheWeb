import { supabase } from '../supabaseClient'

export const lessonService = {

  // ─── Teacher: CRUD ──────────────────────────────────────

  async getLessonsByTeacher(teacherId) {
    const { data, error } = await supabase
      .from('lessons')
      .select(`
        *,
        lesson_attachments(id),
        lesson_quizzes(id, quiz:quizzes(id, title))
      `)
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
        )
      `)
      .eq('id', lessonId)
      .single()
    if (error) throw error

    // Normalise so every consumer gets consistent shape:
    //   lesson.attachments  → lesson_attachments rows
    //   lesson.quizzes      → lesson_quizzes rows
    //   quiz.questions      → quiz_questions rows  (QuizSection expects .questions)
    const quizzes = (data.lesson_quizzes ?? []).map((lq) => ({
      ...lq,
      quiz: lq.quiz
        ? { ...lq.quiz, questions: lq.quiz.quiz_questions ?? [] }
        : null,
    }))

    return {
      ...data,
      attachments: data.lesson_attachments ?? [],
      quizzes,
    }
  },

  async createLesson(payload) {
    const { data, error } = await supabase
      .from('lessons')
      .insert(payload)
      .select()
      .single()
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
    const fileName = `${Date.now()}.${ext}`
    const path = `lessons/${lessonId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('lesson-files')
      .upload(path, file)
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

  // ─── Classroom Assignment (teacher hands out) ───────────

  async assignToClassroom(payload) {
    const { data, error } = await supabase
      .from('lesson_assignments')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getClassroomAssignments(classroomId) {
    const { data, error } = await supabase
      .from('lesson_assignments')
      .select(`
        *,
        lesson:lessons(*),
        classroom:classrooms(id, name)
      `)
      .eq('classroom_id', classroomId)
      .order('assigned_at', { ascending: false })
    if (error) throw error
    return data
  },

  // ─── Student: Classroom Lessons with full context ──────
  //
  // Returns lesson_assignments enriched with:
  //   - lesson (title, content, attachments, quizzes+badge, teacher)
  //   - student's lesson_progress for each lesson
  //   - student's latest quiz_attempt for each quiz
  //   - tutorial (activity) linked via tutorials table (classroom_id + lesson_id combo)

  async getClassroomLessonsForStudent(classroomId, studentId) {
    const { data, error } = await supabase
      .from('lesson_assignments')
      .select(`
        *,
        lesson:lessons(
          id,
          title,
          content,
          thumbnail_url,
          estimated_duration,
          created_at,
          updated_at,
          is_published,
          teacher:profiles!lessons_teacher_id_fkey(id, username, avatar_url),
          lesson_attachments(id, file_name, file_url, file_type, file_size),
          lesson_quizzes(
            id,
            quiz:quizzes(
              id,
              title,
              description,
              passing_score,
              time_limit,
              quiz_questions(id),
              badges(id, title, description, icon_url)
            )
          )
        )
      `)
      .eq('classroom_id', classroomId)
      .order('assigned_at', { ascending: false })

    if (error) throw error
    if (!data || data.length === 0) return []

    const lessonIds = data.map((la) => la.lesson_id).filter(Boolean)
    const quizIds = data.flatMap((la) =>
      (la.lesson?.lesson_quizzes ?? []).map((lq) => lq.quiz?.id).filter(Boolean)
    )

    // Fetch student progress for all lessons in one query
    const progressMap = {}
    if (lessonIds.length) {
      const { data: progData } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('student_id', studentId)
        .in('lesson_id', lessonIds)
      progData?.forEach((p) => { progressMap[p.lesson_id] = p })
    }

    // Fetch latest quiz attempt per quiz
    const quizAttemptMap = {}
    if (quizIds.length) {
      const { data: attData } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('student_id', studentId)
        .in('quiz_id', quizIds)
        .order('completed_at', { ascending: false })
      attData?.forEach((a) => {
        if (!quizAttemptMap[a.quiz_id]) quizAttemptMap[a.quiz_id] = a
      })
    }

    return data.map((la) => {
      const lesson = la.lesson
      if (!lesson) return la

      // Normalise quiz shape (quiz_questions → questions)
      const quizzes = (lesson.lesson_quizzes ?? []).map((lq) => ({
        ...lq,
        quiz: lq.quiz ? { ...lq.quiz, questions: lq.quiz.quiz_questions ?? [] } : null,
      }))

      const quiz = quizzes[0]?.quiz ?? null
      const quizAttempt = quiz ? (quizAttemptMap[quiz.id] ?? null) : null
      const progress = progressMap[lesson.id] ?? null

      return {
        ...la,
        lesson: {
          ...lesson,
          attachments: lesson.lesson_attachments ?? [],
          quizzes,
          progress,
          quizAttempt,
        },
      }
    })
  },

  // ─── Student: All lesson_assignments across classrooms (Assignments Tab) ──

  async getStudentLessonAssignments(studentId) {
    // Get the classrooms this student is enrolled in
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
        lesson:lessons(
          id,
          title,
          content,
          estimated_duration,
          lesson_quizzes(id, quiz:quizzes(id, title)),
          lesson_attachments(id)
        )
      `)
      .in('classroom_id', classroomIds)
      .not('due_date', 'is', null)
      .order('due_date', { ascending: true })

    if (error) throw error
    if (!data || !data.length) return []

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

    const quizIds = data
      .flatMap((la) => (la.lesson?.lesson_quizzes ?? []).map((lq) => lq.quiz?.id))
      .filter(Boolean)
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
      if (progress?.completed_at || quizAttempt) {
        status = 'completed'
      } else if (due && due < now) {
        status = 'missing'
      }

      return { ...la, progress, quizAttempt, status }
    })
  },

  // ─── Student: Progress Tracking ────────────────────────

  async updateProgress(studentId, lessonId, updates) {
    const { data, error } = await supabase
      .from('lesson_progress')
      .upsert(
        {
          student_id: studentId,
          lesson_id: lessonId,
          ...updates,
          last_accessed: new Date().toISOString(),
        },
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

  // Bulk-fetch progress for a whole classroom (for detail page overview)
  async getAllProgressForClassroom(studentId, lessonIds) {
    if (!lessonIds.length) return {}
    const { data, error } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('student_id', studentId)
      .in('lesson_id', lessonIds)
    if (error) throw error
    const map = {}
    data?.forEach((p) => { map[p.lesson_id] = p })
    return map
  },

  // ─── Student: Achievements / Badges ────────────────────

  async getStudentAchievements(studentId) {
    const { data, error } = await supabase
      .from('achievements')
      .select(`
        id,
        earned_at,
        badge:badges(id, title, description, icon_url)
      `)
      .eq('user_id', studentId)
      .order('earned_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  // Fetch all badges relevant to quizzes in this classroom (for greyed-out display)
  async getClassroomBadges(classroomId) {
    // Find quizzes linked to lessons assigned to this classroom
    const { data, error } = await supabase
      .from('lesson_assignments')
      .select(`
        lesson:lessons(
          lesson_quizzes(
            quiz:quizzes(
              badges(id, title, description, icon_url, quiz_id)
            )
          )
        )
      `)
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

  // ─── Student: Classroom Members ────────────────────────

  async getClassroomMembers(classroomId) {
    const { data, error } = await supabase
      .from('classroom_enrollments')
      .select(`
        id,
        enrolled_at,
        status,
        student:profiles(id, username, avatar_url, email)
      `)
      .eq('classroom_id', classroomId)
      .eq('status', 'active')
      .order('enrolled_at', { ascending: true })
    if (error) throw error
    return data ?? []
  },

  // ─── Quiz Attempt (student submit) ────────────────────

  async submitQuizAttempt(payload) {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return data
  },
}