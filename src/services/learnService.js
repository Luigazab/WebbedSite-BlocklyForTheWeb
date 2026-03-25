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

// ─── Topics ───────────────────────────────────────────────────────────────────

/** All topics — global, visible to every user regardless of classroom */
export const fetchLearnTopics = async () => {
  const { data, error } = await supabase
    .from('learn_topics')
    .select('*')
    .order('category_id')
  if (error) throw error
  return data ?? []
}

/**
 * Publish a lesson as a learn topic (global — no classroom).
 * Uses the lesson's id as the topic id so they stay linked.
 * Safe to call multiple times; upserts on conflict.
 */
export const publishLessonAsLearnTopic = async ({
  lessonId,
  categoryId,
  title,
  description = null,
  estimatedDuration = null,
  prerequisiteTopicId = null,
}) => {
  const { data, error } = await supabase
    .from('learn_topics')
    .upsert(
      {
        id: lessonId,
        category_id: categoryId,
        title,
        description,
        content_markdown: '',
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
 * All existing learn topics — used to populate the prerequisite picker
 * in HandOutModal so teachers can chain topics.
 */
export const fetchAllLearnTopicsForPrereq = async () => {
  const { data, error } = await supabase
    .from('learn_topics')
    .select('id, title, category_id')
    .order('category_id')
  if (error) throw error
  return data ?? []
}

// ─── Progress ─────────────────────────────────────────────────────────────────

export const fetchTopicProgress = async (studentId) => {
  const { data, error } = await supabase
    .from('learn_topic_progress')
    .select('*')
    .eq('student_id', studentId)
  if (error) throw error
  return data ?? []
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