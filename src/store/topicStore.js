import { create } from 'zustand';
import { getCourseAndTopicsWithProgress } from '../services/topicService';

const useTopicStore = create((set) => ({
  course: null,
  topics: [],
  userProgress: null,
  isLoading: true,
  error: null,

  fetchCourseData: async (courseSlug, userId) => {
    try {
      set({ isLoading: true, error: null });
      const data = await getCourseAndTopicsWithProgress(courseSlug, userId);
      set({
        course: data.course,
        topics: data.topics,
        userProgress: data.userProgress,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to fetch course topics:", error);
      set({ error, isLoading: false });
    }
  },
}));

export default useTopicStore;