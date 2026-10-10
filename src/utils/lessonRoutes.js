export const classroomPath = (classroomId) => classroomId
  ? `/student/classrooms/${encodeURIComponent(classroomId)}`
  : '/student/classrooms';

export const lessonPath = (courseSlug, slug, classroomId = null) => {
  const base = classroomId ? `${classroomPath(classroomId)}/lessons` : '/student/lessons';
  return `${base}/${encodeURIComponent(courseSlug)}/${encodeURIComponent(slug)}`;
};

export const coursePreviewPath = (courseId, courseSlug, slug) =>
  `/teacher/lessons/${encodeURIComponent(courseId)}/${encodeURIComponent(courseSlug)}/${encodeURIComponent(slug)}`;

export const legacyLessonDestination = (courseSlug, slug, search = '') => {
  const params = new URLSearchParams(search);
  const classroomId = params.get('classroomId');
  if (!classroomId || !courseSlug || !slug) return classroomPath(classroomId);
  params.delete('classroomId');
  const query = params.toString();
  return `${lessonPath(courseSlug, slug, classroomId)}${query ? `?${query}` : ''}`;
};
