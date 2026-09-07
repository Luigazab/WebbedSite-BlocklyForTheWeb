import { create } from "zustand";
import { fetchLectureForStudent } from "@/services/lectureService";
import { completeLesson } from "@/services/progressService";

export const useLectureViewStore = create((set, get) => ({
  lecture: null,
  loading: false,
  completing: false,

  fetchLecture: async (lessonId) => {
    set({ loading: true });
    try {
      const lecture = await fetchLectureForStudent(lessonId);
      set({ lecture });
      return lecture;
    } finally {
      set({ loading: false });
    }
  },

  markComplete: async (userId) => {
    const { lecture } = get();
    if (!lecture) return null;

    set({ completing: true });
    try {
      return await completeLesson({
        userId,
        classroomId: lecture.classroomId,
        courseId: lecture.courseId,
        lessonId: lecture.id,
        topicId: lecture.topicId,
        baseXp: lecture.baseXp,
      });
    } finally {
      set({ completing: false });
    }
  },

  resetLecture: () => set({ lecture: null }),
}));