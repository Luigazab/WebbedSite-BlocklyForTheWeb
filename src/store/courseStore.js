import { create } from 'zustand';

export const useCourseStore = create((set) => ({
  activeCourseProgress: null, // The currently selected course progress for the UI
  allUserCourseProgresses: [], // All progress entries for the user
  courses: [], // All available courses
  isLoadingProgress: true,

  setActiveCourseProgress: (progress) => set({ activeCourseProgress: progress }),
  setAllUserCourseProgresses: (progresses) => set({ allUserCourseProgresses: progresses }),
  setCourses: (courses) => set({ courses: courses }),
  setIsLoadingProgress: (status) => set({ isLoadingProgress: status }),
}));
