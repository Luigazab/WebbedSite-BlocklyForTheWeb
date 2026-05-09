import { useEffect } from 'react';
import useTopicStore from '../store/topicStore';

export const useTopics = (courseSlug, userId) => {
  const {
    course,
    topics,
    userProgress,
    isLoading,
    error,
    fetchCourseData,
  } = useTopicStore((state) => state);

  useEffect(() => {
    if (courseSlug && userId) {
      fetchCourseData(courseSlug, userId);
    }
  }, [courseSlug, userId, fetchCourseData]);

  return { course, topics, userProgress, isLoading, error };
};