import { useEffect } from 'react';
import { useParams } from 'react-router';
import { useLessonStore } from '../store/lessonStore';

export const useLesson = ({ masterOnly = false } = {}) => {
  const { courseSlug, slug } = useParams();
  const { lesson, navigation, isLoading, error, fetchLessonData, reset } = useLessonStore();

  useEffect(() => {
    if (courseSlug && slug) {
      fetchLessonData(courseSlug, slug, { masterOnly });
    }
    return () => reset();
  }, [courseSlug, slug, masterOnly, fetchLessonData, reset]);

  return { lesson, navigation, isLoading, error };
};