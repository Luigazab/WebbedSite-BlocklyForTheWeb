import { create } from 'zustand';
import { getLessonDetails } from '../services/lessonService';

const initialState = {
  lesson: null,
  navigation: { previous: null, next: null },
  isLoading: true,
  error: null,
};

export const useLessonStore = create((set) => ({
  ...initialState,

  fetchLessonData: async (courseSlug, lessonSlug) => {
    try {
      set({ isLoading: true, error: null });
      const data = await getLessonDetails(courseSlug, lessonSlug);
      set({
        lesson: data.lesson,
        navigation: data.navigation,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to fetch lesson details:", error);
      set({ error, isLoading: false });
    }
  },

  reset: () => set(initialState),
}))
