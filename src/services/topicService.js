import { supabase } from '../supabaseClient'

/**
 * Fetches all data required for the topics page of a specific course.
 * @param {string} courseSlug - The slug of the course to fetch.
 * @param {string} userId - The ID of the current user.
 * @returns {Promise<object|null>} An object containing course details, topics with lessons, and user progress.
 */
export const getCourseAndTopicsWithProgress = async (courseSlug, userId) => {
  if (!courseSlug || !userId) return null;

  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('id, title, description, slug, image_src, total_xp')
    .eq('slug', courseSlug)
    .single();

  if (courseError) throw courseError;
  if (!course) throw new Error(`Course with slug "${courseSlug}" not found.`);

  const { data: userProgress, error: progressError } = await supabase
    .from('user_progress')
    .select('current_xp, current_level')
    .eq('user_id', userId)
    .eq('active_course', course.id)
    .single();

  if (progressError && progressError.code !== 'PGRST116') {
    console.error("Error fetching user progress:", progressError);
  }
  const { data: topics, error: topicsError } = await supabase
    .from('topics')
    .select(`
      id, title, description, order, required_level, slug,
      lessons (
        id, title, type, order, slug,
        user_lesson_progress!left(
          is_completed,
          user_id
        )
      )
    `)
    .eq('course_id', course.id)
    .order('order', { ascending: true })
    .order('order', { foreignTable: 'lessons', ascending: true });

  if (topicsError) throw topicsError;

  let currentLessonFound = false;

  for (const topic of topics) {
    const isTopicLocked = userProgress ? userProgress.current_level < topic.required_level : true;
    const processedLessons = [];

    for (const lesson of topic.lessons) {
      const progress = lesson.user_lesson_progress.find(p => p.user_id === userId);
      const isCompleted = !!(progress && progress.is_completed);
      let status = 'locked';

      if (isCompleted) {
        status = 'completed';
      } else if (!currentLessonFound && !isTopicLocked) {
        status = 'current';
        currentLessonFound = true;
      }
      
      processedLessons.push({ ...lesson, status });
    }

    finalTopics.push({
      ...topic,
      is_locked: isTopicLocked,
      lessons: processedLessons
    });
  }

  const finalUserProgress = userProgress ? {
    ...userProgress,
    total_xp: course.total_xp,
  } : null;

  return { course, userProgress: finalUserProgress, topics: finalTopics };
};

export const topicService = {
  async createTopic(course_id, title, description ){
    const { data, error } = await supabase
      .from('topics')
      .insert([course_id, title, description])
    if (error) throw error;
    return data;
  },

  async getTopics(){
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .order('order', { ascending: true})
    if (error) throw error;
    return data;
  },
  async getTopicsById(topicsId) {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('id', topicsId)
      .single();
    if (error) throw error;
    return data;
  },
  async updateTopic(topicsId, updates, userId){
    const { data, error } = await supabase
      .from('topics')
      .update({
        title: updates.title,
        description: updates.description,
        order:updates.order,
        is_published: updates.is_published,
        required_level: updates.required_level,
        required_xp: updates.required_xp,
        is_unlocked: updates.is_unlocked,
        unlocked_by: userId || null,
      })
      .eq('id', topicsId)
      .select();
    if (error) throw error;
    return data;
  },
  async deleteTopic(topicsId) {
    const { data, error } = await supabase
      .from('topics')
      .delete()
      .eq('id', topicsId)
    if (error) throw error;
  }
}