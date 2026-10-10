import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { useLessonStore } from '../store/lessonStore';

export const useLesson = ({ masterOnly = false } = {}) => {
  const { courseSlug, slug, classroomId: routeClassroomId } = useParams();
  const [searchParams] = useSearchParams();
  const classroomId = routeClassroomId ?? searchParams.get('classroomId');
  const { lesson, navigation, isLoading, error, fetchLessonData, reset } = useLessonStore();

  useEffect(() => {
    if (courseSlug && slug) {
      fetchLessonData(courseSlug, slug, { masterOnly, classroomId });
    }
    return () => reset();
  }, [courseSlug, slug, classroomId, masterOnly, fetchLessonData, reset]);

  return { lesson, navigation, isLoading, error };
};
