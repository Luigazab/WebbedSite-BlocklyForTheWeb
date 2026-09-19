import { supabase } from "@/supabaseClient"

export async function getMasterCourses() {
  const { data, error } = await supabase
    .from('courses')
    .select('id, title, description, color, image_src, slug, total_xp')
    .order('order', { ascending: true })
 
  if (error) throw error
  return data ?? []
}

export async function assignCourseToClassroom(classroomId, courseId) {
  const { error } = await supabase.rpc('clone_course_to_classroom', {
    p_classroom_id: classroomId,
    p_course_id: courseId,
  })
  if (error) throw error
}
 
export async function getClassroomCourse(classroomId) {
  const { data, error } = await supabase
    .from('classroom_courses')
    .select(`
      course_id, assigned_at,
      courses:course_id ( id, title, description, color, image_src, total_xp )
    `)
    .eq('classroom_id', classroomId)
    .maybeSingle()
 
  if (error) throw error
  return data ?? null
}

export async function getClassroomCourses(classroomId) {
  const { data, error } = await supabase
    .from('classroom_courses')
    .select(`
      course_id, sequence_order, assigned_at,
      courses:course_id ( id, title, description, color, image_src, total_xp, slug )
    `)
    .eq('classroom_id', classroomId)
    .order('sequence_order', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function assignCoursesToClassroom(classroomId, courseIds) {
  const { error } = await supabase.rpc('assign_courses_to_classroom', {
    p_classroom_id: classroomId,
    p_course_ids: courseIds,
  })
  if (error) throw error
}

export function normalizeTopic(row) {
  return {
    id:          row.id,
    courseId:    row.course_id, 
    title:       row.title,
    description: row.description,
    order:       row.order,
    isUnlocked:  row.is_unlocked,
    unlockedAt:  row.unlocked_at,
    unlockedBy:  row.unlocked_by, // null = auto (class finished), else teacher id
    lessons: (row.lessons ?? []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  }
}
 
export async function getClassroomTopics(classroomId) {
  const { data, error } = await supabase
    .from('topics')
    .select(`
      id, course_id, title, description, "order", is_unlocked, unlocked_at, unlocked_by,
      lessons ( id, title, type, "order", is_published, base_xp, slug )
    `)
    .eq('classroom_id', classroomId)
    .order('order', { ascending: true })
 
  if (error) throw error
  return (data ?? []).map(normalizeTopic)
}

export async function getLessonDetail(lessonId) {
  const { data, error } = await supabase
    .from('lessons')
    .select(`
      id, title, type, base_xp, topics_id,
      lectures ( id, content, video_src, file_url ),
      quizzes (
        id, time_limit, passing_score,
        questions (
          id, text, "order",
          options ( id, text, image_src )
        )
      ),
      tutorials (
        id, type,
        text_tutorial_steps ( id, instruction, hint, "order" ),
        text_tutorial_step_files ( id, filename, initial_content, file_type ),
        block_tutorial_steps ( id, instruction, hint, "order" ),
        block_tutorial_step_files ( id, filename, initial_content_json, file_type )
      ),
      laboratories (
        id, instruction,
        laboratory_files ( id, filename, file_type, intial_code, intial_blockly_code )
      )
    `)
    .eq('id', lessonId)
    .single()
 
  if (error) throw error
  return data
}

export async function updateTopic(topicId, updates) {
  const { data, error } = await supabase
    .from('topics')
    .update({ title: updates.title, description: updates.description })
    .eq('id', topicId)
    .select('*')
    .single()
 
  if (error) throw error
  return data
}

export async function updateLesson(lessonId, updates) {
  const { data, error } = await supabase
    .from('lessons')
    .update({ title: updates.title, is_published: updates.isPublished })
    .eq('id', lessonId)
    .select('*')
    .single()
 
  if (error) throw error
  return data
}


export async function updateLecture(lectureId, updates) {
  const { data, error } = await supabase
    .from('lectures')
    .update({ content: updates.content, video_src: updates.videoSrc, file_url: updates.fileUrl })
    .eq('id', lectureId)
    .select('*')
    .single()
 
  if (error) throw error
  return data
}

export async function createTopic(classroomId, courseId, { title, description }) {
  const { data: existing, error: countErr } = await supabase
    .from('topics')
    .select('order')
    .eq('classroom_id', classroomId)
    .order('order', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (countErr) throw countErr
 
  const nextOrder = (existing?.order ?? 0) + 1
 
  const { data, error } = await supabase
    .from('topics')
    .insert({
      classroom_id: classroomId,
      course_id: courseId,
      title,
      description,
      order: nextOrder,
      is_published: true,
      slug: `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${classroomId.slice(0, 8)}`,
      is_unlocked: false,
    })
    .select('*')
    .single()
 
  if (error) throw error
  return data
}

export async function teacherUnlockTopic(topicId) {
  const { error } = await supabase.rpc('teacher_unlock_topic', { p_topic_id: topicId })
  if (error) throw error
}