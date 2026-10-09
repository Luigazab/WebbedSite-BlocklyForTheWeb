export function groupClassroomCurriculum(courses = [], topics = []) {
  return [...courses].sort((a, b) => (a.sequence_order ?? 0) - (b.sequence_order ?? 0)).map(assignment => ({
    courseId: assignment.course_id,
    course: assignment.courses,
    sequenceOrder: assignment.sequence_order,
    topics: topics.filter(topic => topic.courseId === assignment.course_id)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  }))
}

export function visibleTopicLessons(topic, teacher = false) {
  return (topic.lessons ?? []).filter(lesson => teacher || lesson.is_published)
}

export function lessonTrackLabel(lesson) {
  const track = lesson.topic_track || 'core'
  if (track === 'core') return lesson.required_for_topic ? 'Core' : 'Core · optional'
  return 'Optional · ' + track[0].toUpperCase() + track.slice(1)
}
