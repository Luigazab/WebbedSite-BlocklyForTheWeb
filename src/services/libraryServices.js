/**
 * Service for CourseLibrary.jsx for counts of topics and lessons for courses
 */
async function getCourseDetail(courseId) {
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .single();
  if (courseError) throw courseError;

  const { data: topics, error: topicsError } = await supabase
    .from("topics")
    .select("id, title")
    .eq("course_id", courseId);
  if (topicsError) throw topicsError;

  const lessonsCountByTopic = {};
  for (const topic of topics) {
    const { count, error: lessonsError } = await supabase
      .from("lessons")
      .select("*", { count: "exact", head: true })
      .eq("topic_id", topic.id);
    if (lessonsError) throw lessonsError;
    lessonsCountByTopic[topic.id] = count;
  }

  return { course, topics, lessonsCountByTopic };
}
