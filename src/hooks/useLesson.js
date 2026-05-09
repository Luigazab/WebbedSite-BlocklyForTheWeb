import { useEffect } from 'react';
import { useParams } from 'react-router';
import { useLessonStore } from '../store/lessonStore';

export const useLesson = () => {
  const { courseSlug, slug } = useParams();
  const { lesson, navigation, isLoading, error, fetchLessonData, reset } = useLessonStore();

  useEffect(() => {
    if (courseSlug && slug) {
      fetchLessonData(courseSlug, slug); 
    }
    return () => reset();
  }, [courseSlug, slug, fetchLessonData, reset]);

  return { lesson, navigation, isLoading, error };
};