import { supabase } from '../supabaseClient'

/**
 * Fetches all data required for the topics page of a specific course.
 * @param {string} courseSlug - The slug of the course to fetch.
 * @param {string} userId - The ID of the current user.
 * @returns {Promise<object|null>} An object containing course details, topics with lessons, and user progress.
 */
export const getCourseAndTopicsWithProgress = async (courseSlug, userId) => {
  if (!courseSlug || !userId) return null;

  // 1. Get course by slug
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('id, title, description, slug, image_src, total_xp')
    .eq('slug', courseSlug)
    .single();

  if (courseError) throw courseError;
  if (!course) throw new Error(`Course with slug "${courseSlug}" not found.`);

  // 2. Get user progress for this course
  const { data: userProgress, error: progressError } = await supabase
    .from('user_progress')
    .select('current_xp, current_level')
    .eq('user_id', userId)
    .eq('active_course', course.id)
    .single();

  if (progressError && progressError.code !== 'PGRST116') {
    // PGRST116: "The result contains 0 rows" - this is not an error if user hasn't started the course
    console.error("Error fetching user progress:", progressError);
  }

  // 3. Get topics and their lessons with user's completion status for each lesson
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

  // 4. Process data to determine lesson status ('completed', 'current', 'locked')
  const finalTopics = [];
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

  // 5. Combine user progress with total_xp from course
  const finalUserProgress = userProgress ? {
    ...userProgress,
    total_xp: course.total_xp,
  } : null;

  return { course, userProgress: finalUserProgress, topics: finalTopics };
};
