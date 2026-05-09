import { supabase } from '../supabaseClient';

const formatLessonUrl = (lesson, courseSlug) => {
  if (!lesson) return null;
  return `/student/learn/${courseSlug}/${lesson.slug}`;
};

export const getLessonDetails = async (courseSlug, lessonSlug) => {
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', courseSlug)
    .single();

  if (courseError) throw courseError;
  if (!course) throw new Error(`Course with slug "${courseSlug}" not found.`);

  const { data: lessonData, error: lessonError } = await supabase
    .from('lessons')
    .select(`
      id, title, created_at, slug, order, type,
      topics!inner ( id, title, description, slug, course_id ),
      lectures ( content, video_src, file_url ),
      quizzes (
        id, time_limit, passing_score,
        questions (
          id, text, order,
          options ( id, text, is_correct, image_src )
        )
      ),
      laboratories ( id, instruction ),
      tutorials ( id, type ),
      author:profiles!lessons_author_fkey ( username, avatar_url )
    `)
    .eq('slug', lessonSlug)
    .single();

  if (lessonError) throw lessonError;

  // Manually verify the lesson belongs to the correct course
  if (lessonData.topics.course_id !== course.id) {
    throw new Error(`Lesson "${lessonSlug}" does not belong to course "${courseSlug}".`);
  }
  const courseId = lessonData.topics.course_id;

  const { data: allCourseLessons, error: allLessonsError } = await supabase
    .from('lessons')
    .select('slug, type, topics!inner(slug, course_id)')
    .eq('topics.course_id', courseId)
    .order('order', { foreignTable: 'topics', ascending: true })
    .order('order', { ascending: true });

  if (allLessonsError) throw allLessonsError;

  const currentIndex = allCourseLessons.findIndex(l => l.slug === lessonSlug);
  const prevLesson = currentIndex > 0 ? allCourseLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allCourseLessons.length - 1 ? allCourseLessons[currentIndex + 1] : null;

  // Sort questions and their options by order
  const quiz = lessonData.quizzes[0] || null;
  if (quiz?.questions) {
    quiz.questions.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  return {
    lesson: {
      ...lessonData,
      lecture:    lessonData.lectures[0]     || null,
      quiz,
      laboratory: lessonData.laboratories[0] || null,
      tutorial:   lessonData.tutorials[0]    || null,
      topic:      lessonData.topics,
      author:     lessonData.author,
    },
    navigation: {
      previous: formatLessonUrl(prevLesson, courseSlug),
      next:     formatLessonUrl(nextLesson, courseSlug),
    },
  };
};