/**
 * CREATE TABLE public.lessons (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    topics_id uuid NOT NULL,
    author uuid NOT NULL,
    prerequisite_lesson uuid,
    title text NOT NULL DEFAULT ''::text,
    type text NOT NULL,
    is_published boolean DEFAULT false,   
    updated_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    slug text NOT NULL,
    order integer,
    base_xp integer NOT NULL DEFAULT 50,
    classroom_id uuid,
    CONSTRAINT lessons_pkey PRIMARY KEY (id),
    CONSTRAINT lessons_topics_id_fkey FOREIGN KEY (topics_id) REFERENCES public.topics(id),
    CONSTRAINT lessons_author_fkey FOREIGN KEY (author) REFERENCES public.profiles(id),
    CONSTRAINT lessons_prerequisite_lesson_fkey FOREIGN KEY (prerequisite_lesson) REFERENCES public.lessons(id),
    CONSTRAINT lessons_classroom_id_fkey FOREIGN KEY (classroom_id) REFERENCES public.classrooms(id)
  );
 */
import { supabase } from "../supabaseClient";

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export const makeLessonSlug = (title) => {
  const base = slugify(title) || "lesson";
  return `${base}-${Date.now().toString(36)}`;
};

export const fetchTopicGroupsForAuthoring = async () => {
  const { data, error } = await supabase
    .from("topics")
    .select("id, title, description, order, course_id, courses(title)")
    .order("order", { ascending: true });

  if (error) throw error;

  const grouped = {};
  for (const topic of data ?? []) {
    const courseName = topic.courses?.title ?? "Uncategorized";
    if (!grouped[courseName]) grouped[courseName] = [];
    grouped[courseName].push({
      id: topic.id,
      title: topic.title,
      description: topic.description,
    });
  }

  return Object.entries(grouped).map(([course, topics]) => ({ course, topics }));
};

export const fetchTeacherContentTree = async (teacherId) => {
  const { data, error } = await supabase
    .from("courses")
    .select(`
      id,
      title,
      description,
      image_src,
      order,
      topics (
        id,
        title,
        description,
        order,
        lessons (
          id,
          title,
          type,
          is_published,
          author,
          updated_at,
          profiles!lessons_author_fkey (username)
        )
      )
    `)
    .order("order", { ascending: true })
    .order("order", { foreignTable: "topics", ascending: true })
    .order("order", { foreignTable: "topics.lessons", ascending: true });

  if (error) throw error;

  return (data ?? []).map((course) => ({
    ...course,
    topics: (course.topics ?? []).map((topic) => ({
      ...topic,
      lessons: (topic.lessons ?? [])
        .filter((lesson) => lesson.author === teacherId)
        .map((lesson) => ({
          ...lesson,
          author_name: lesson.profiles?.username ?? "Unknown",
        })),
    })),
  }));
};

export const removeLessonById = async (lessonId) => {
  const { error } = await supabase.from("lessons").delete().eq("id", lessonId);
  if (error) throw error;
};

export const createLessonBase = async ({ topicId, authorId, title, type, baseXp = 50 }) => {
  const { data: existingRows, error: orderError } = await supabase
    .from("lessons")
    .select("order")
    .eq("topics_id", topicId)
    .order("order", { ascending: false })
    .limit(1);

  if (orderError) throw orderError;

  const nextOrder = (existingRows?.[0]?.order ?? 0) + 1;
  const payload = {
    topics_id: topicId,
    author: authorId,
    title: title.trim(),
    type,
    is_published: false,
    slug: makeLessonSlug(title),
    order: nextOrder,
    base_xp: baseXp,
  };

  const { data, error } = await supabase.from("lessons").insert(payload).select().single();
  if (error) throw error;
  return data;
};

export const updateLessonBase = async ({ lessonId, topicId, title, baseXp = 50 }) => {
  const { data, error } = await supabase
    .from("lessons")
    .update({
      topics_id: topicId,
      title: title.trim(),
      is_published: false,
      updated_at: new Date().toISOString(),
      base_xp: baseXp,
    })
    .eq("id", lessonId)
    .select()
    .single();

  if (error) throw error;
  return data;
};


/**
 * Old one, format url to use slug and not id I think
 */

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