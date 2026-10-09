export function summarizeStudentLessons(flow) {
  const topics = (flow?.topics ?? []).filter(topic => topic.is_published && topic.is_unlocked)
  const withLessons = topics.filter(topic => topic.required_lessons > 0)
  const completed = withLessons.reduce((sum, topic) => sum + Math.min(topic.students?.[0]?.completed_lessons ?? 0, topic.required_lessons), 0)
  const total = withLessons.reduce((sum, topic) => sum + topic.required_lessons, 0)
  const current = withLessons.find(topic => (topic.students?.[0]?.completed_lessons ?? 0) < topic.required_lessons)
  return { completed, total, openTopics: topics.length, currentTopic: current?.title ?? null }
}
