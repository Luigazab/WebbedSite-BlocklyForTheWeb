import { supabase } from '../supabaseClient'

// ─── Categories ───────────────────────────────────────────────────────────────

export const fetchLearnCategories = async () => {
  const { data, error } = await supabase
    .from('learn_categories')
    .select('*')
    .order('order_index')
  if (error) throw error
  return data ?? []
}

// ─── Topics (public learn page) ───────────────────────────────────────────────

/**
 * All topics with their linked lesson joined.
 * Used on the public Learn page and the topic viewer.
 */
export const fetchLearnTopics = async () => {
  const { data, error } = await supabase
    .from('learn_topics')
    .select(`
      id, category_id, title, description, estimated_duration,
      prerequisite_topic, created_at,
      lesson:lessons(
        id, title, content, estimated_duration, thumbnail_url,
        teacher:profiles!lessons_teacher_id_fkey(id, username, avatar_url),
        lesson_attachments(*),
        lesson_quizzes(
          id,
          quiz:quizzes(
            id, title, description, passing_score, time_limit,
            quiz_questions(id, question_text, options, correct_answer, order_index),
            badges(id, title, description, icon_url)
          )
        ),
        lesson_tutorials(
          id,
          tutorial:tutorials(
            id, title, description, difficulty_level, estimated_time_minutes,
            tutorial_steps(
              id, instruction_text, hint, step_order, order_index,
              tutorial_step_files(id, filename, blocks_json, order_index)
            ),
            badges(id, title, description, icon_url)
          )
        )
      )
    `)
    .order('category_id')
    .order('order_index')
  if (error) throw error
  return data ?? []
}

/**
 * Single topic with full lesson data — for the topic viewer.
 */
export const fetchLearnTopicById = async (topicId) => {
  const { data, error } = await supabase
    .from('learn_topics')
    .select(`
      id, category_id, title, description, estimated_duration,
      prerequisite_topic, created_at,
      lesson:lessons(
        id, title, content, estimated_duration, thumbnail_url, created_at,
        teacher:profiles!lessons_teacher_id_fkey(id, username, avatar_url),
        lesson_attachments(*),
        lesson_quizzes(
          id,
          quiz:quizzes(
            id, title, description, passing_score, time_limit,
            quiz_questions(id, question_text, options, correct_answer, order_index),
            badges(id, title, description, icon_url)
          )
        ),
        lesson_tutorials(
          id,
          tutorial:tutorials(
            id, title, description, difficulty_level, estimated_time_minutes,
            tutorial_steps(
              id, instruction_text, hint, step_order, order_index,
              tutorial_step_files(id, filename, blocks_json, order_index)
            ),
            badges(id, title, description, icon_url)
          )
        )
      )
    `)
    .eq('id', topicId)
    .single()
  if (error) throw error

  // Normalise nested arrays
  const lesson = data.lesson
    ? {
        ...data.lesson,
        attachments: data.lesson.lesson_attachments ?? [],
        quizzes: (data.lesson.lesson_quizzes ?? []).map((lq) => ({
          ...lq,
          quiz: lq.quiz ? { ...lq.quiz, questions: lq.quiz.quiz_questions ?? [] } : null,
        })),
        tutorials: (data.lesson.lesson_tutorials ?? []).map((lt) => ({
          ...lt,
          tutorial: lt.tutorial
            ? {
                ...lt.tutorial,
                steps: (lt.tutorial.tutorial_steps ?? [])
                  .sort((a, b) => (a.order_index ?? a.step_order ?? 0) - (b.order_index ?? b.step_order ?? 0))
                  .map((s) => ({
                    ...s,
                    tutorial_step_files: (s.tutorial_step_files ?? []).sort(
                      (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
                    ),
                  })),
              }
            : null,
        })),
      }
    : null

  return { ...data, lesson }
}

// ─── Topic progress (learn_topic_progress) ────────────────────────────────────

export const fetchTopicProgress = async (studentId) => {
  const { data, error } = await supabase
    .from('learn_topic_progress')
    .select('*')
    .eq('student_id', studentId)
  if (error) throw error
  return data ?? []
}

export const fetchSingleTopicProgress = async (studentId, topicId) => {
  const { data, error } = await supabase
    .from('learn_topic_progress')
    .select('*')
    .eq('student_id', studentId)
    .eq('topic_id', topicId)
    .maybeSingle()
  if (error) throw error
  return data
}

export const upsertTopicProgress = async (studentId, topicId, updates) => {
  const { data, error } = await supabase
    .from('learn_topic_progress')
    .upsert(
      {
        student_id: studentId,
        topic_id: topicId,
        last_accessed: new Date().toISOString(),
        ...updates,
      },
      { onConflict: 'student_id,topic_id' }
    )
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Publish lesson as learn topic (global, no classroom) ────────────────────

/**
 * Check whether a lesson is already in any classroom assignment.
 * Returns the list of classrooms it's assigned to.
 */
export const fetchLessonClassroomAssignments = async (lessonId) => {
  const { data, error } = await supabase
    .from('lesson_assignments')
    .select('id, classroom:classrooms(id, name)')
    .eq('lesson_id', lessonId)
    .eq('assignment_type', 'lesson')
  if (error) throw error
  return data ?? []
}

/**
 * Check whether a lesson is already published as a learn topic.
 */
export const fetchLearnTopicByLessonId = async (lessonId) => {
  const { data, error } = await supabase
    .from('learn_topics')
    .select('id, title, category_id')
    .eq('lesson_id', lessonId)
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Publish a lesson as a learn topic (global, no classroom).
 * Enforces: lesson must NOT already be in any classroom assignment.
 */
export const publishLessonAsLearnTopic = async ({
  lessonId,
  categoryId,
  title,
  description = null,
  estimatedDuration = null,
  prerequisiteTopicId = null,
}) => {
  // Enforce separation — reject if lesson is in any classroom
  const classroomAssignments = await fetchLessonClassroomAssignments(lessonId)
  if (classroomAssignments.length > 0) {
    const names = classroomAssignments.map((a) => a.classroom?.name).filter(Boolean).join(', ')
    throw new Error(
      `This lesson is already handed out to classroom(s): ${names}. Remove it from those classrooms first, or use "Pull to Learn Page" from the classroom.`
    )
  }

  // Generate a stable text id from the lesson uuid
  const topicId = `lesson-${lessonId}`

  const { data, error } = await supabase
    .from('learn_topics')
    .upsert(
      {
        id: topicId,
        lesson_id: lessonId,
        category_id: categoryId,
        title,
        description,
        estimated_duration: estimatedDuration,
        prerequisite_topic: prerequisiteTopicId,
      },
      { onConflict: 'id' }
    )
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Pull a lesson OUT of a classroom and republish it to the learn page.
 * Removes the lesson_assignment row, then calls publishLessonAsLearnTopic.
 */
export const pullLessonToLearnPage = async ({
  lessonAssignmentId,
  lessonId,
  categoryId,
  title,
  description = null,
  estimatedDuration = null,
  prerequisiteTopicId = null,
}) => {
  // Remove from classroom first
  const { error: removeError } = await supabase
    .from('lesson_assignments')
    .delete()
    .eq('id', lessonAssignmentId)
  if (removeError) throw removeError

  return publishLessonAsLearnTopic({
    lessonId,
    categoryId,
    title,
    description,
    estimatedDuration,
    prerequisiteTopicId,
  })
}

// ─── Classroom lesson guard ───────────────────────────────────────────────────

/**
 * Check whether a lesson is already assigned to a specific classroom.
 * Used to prevent duplicate assignments.
 */
export const isLessonInClassroom = async (lessonId, classroomId) => {
  const { data, error } = await supabase
    .from('lesson_assignments')
    .select('id')
    .eq('lesson_id', lessonId)
    .eq('classroom_id', classroomId)
    .eq('assignment_type', 'lesson')
    .maybeSingle()
  if (error) throw error
  return !!data
}

// ─── Management (teacher) ─────────────────────────────────────────────────────

/**
 * All learn topics with category + lesson info, for the management page.
 * Ordered by category then by a synthetic order (created_at as fallback).
 */
export const fetchLearnTopicsForManagement = async () => {
  const { data, error } = await supabase
    .from('learn_topics')
    .select(`
      id, category_id, title, description, estimated_duration,
      prerequisite_topic, created_at, lesson_id,
      lesson:lessons(id, title, teacher:profiles!lessons_teacher_id_fkey(id, username))
    `)
    .order('category_id')
    .order('order_index')
  if (error) throw error
  return data ?? []
}

/**
 * Student progress for a single topic — used in management progress panel.
 */
export const fetchTopicStudentProgress = async (topicId) => {
  const { data, error } = await supabase
    .from('learn_topic_progress')
    .select(`
      id, student_id, progress_percentage, completed_at, last_accessed,
      student:profiles(id, username, avatar_url)
    `)
    .eq('topic_id', topicId)
    .order('last_accessed', { ascending: false })
  if (error) throw error
  return data ?? []
}

/**
 * Update a topic's prerequisite.
 */
export const updateTopicPrerequisite = async (topicId, prerequisiteTopicId) => {
  const { data, error } = await supabase
    .from('learn_topics')
    .update({ prerequisite_topic: prerequisiteTopicId })
    .eq('id', topicId)
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Remove a topic. If it's a prerequisite for other topics, nulls those out.
 * Returns { removed, unlinkedTitles } so the UI can show feedback.
 */
export const removeLearnTopic = async (topicId) => {
  // Find topics that depend on this one
  const { data: dependents } = await supabase
    .from('learn_topics')
    .select('id, title')
    .eq('prerequisite_topic', topicId)

  const unlinkedTitles = (dependents ?? []).map((d) => d.title)

  // Null out prerequisites on dependents
  if (unlinkedTitles.length > 0) {
    const depIds = (dependents ?? []).map((d) => d.id)
    await supabase
      .from('learn_topics')
      .update({ prerequisite_topic: null })
      .in('id', depIds)
  }

  // Delete the topic itself
  const { error } = await supabase.from('learn_topics').delete().eq('id', topicId)
  if (error) throw error

  return { removed: topicId, unlinkedTitles }
}

/**
 * All learn topics prereq list (for management dropdowns).
 */
export const fetchAllLearnTopicsForPrereq = async () => {
  const { data, error } = await supabase
    .from('learn_topics')
    .select('id, title, category_id')
    .order('category_id')
    .order('order_index')
  if (error) throw error
  return data ?? []
}

// ─── Classroom-scoped learn progress (teacher view in classroom) ──────────────

/**
 * For a teacher's classroom view: which of their students have progress
 * on learn page topics.
 */
export const fetchClassroomStudentLearnProgress = async (classroomId) => {
  // Get enrolled students
  const { data: enrollments, error: eErr } = await supabase
    .from('classroom_enrollments')
    .select('student_id, student:profiles(id, username, avatar_url)')
    .eq('classroom_id', classroomId)
    .eq('status', 'active')
  if (eErr) throw eErr

  const studentIds = (enrollments ?? []).map((e) => e.student_id).filter(Boolean)
  if (!studentIds.length) return []

  // Get all their learn topic progress
  const { data: progress, error: pErr } = await supabase
    .from('learn_topic_progress')
    .select(`
      id, student_id, topic_id, progress_percentage, completed_at, last_accessed,
      topic:learn_topics(id, title, category_id, lesson_id)
    `)
    .in('student_id', studentIds)
  if (pErr) throw pErr

  // Group by student
  const byStudent = {}
  for (const enrollment of enrollments ?? []) {
    byStudent[enrollment.student_id] = {
      student: enrollment.student,
      progress: [],
    }
  }
  for (const row of progress ?? []) {
    if (byStudent[row.student_id]) {
      byStudent[row.student_id].progress.push(row)
    }
  }

  return Object.values(byStudent)
}
export const updateTopicOrder = async (topics) => {
  for (const t of topics) {
    const { error } = await supabase
      .from('learn_topics')
      .update({ order_index: t.order_index })
      .eq('id', t.id)

    if (error) throw error
  }
}