import { create } from "zustand";
import {
  createLessonBase,
  updateLessonBase,
  fetchLectureEditorData,
  fetchTopicGroupsForAuthoring,
  upsertLectureContent,
  uploadLectureAttachment,
  removeLessonById,
} from "@/services/contentCreationService";

const emptyLecture = {
  id: null,
  title: "",
  topicId: "",
  content: "",
  attachments: { file: null, video: null },
};

async function resolveFileUrl(lessonId, attachments) {
  if (attachments.file?.type === "file" && attachments.file.value instanceof File) {
    return uploadLectureAttachment({ lessonId, file: attachments.file.value });
  }
  if (attachments.file?.type === "link") return attachments.file.value;
  return null;
}

export const useLectureStore = create((set) => ({
  topics: [],
  topicsLoading: false,

  lecture: emptyLecture,
  lectureLoading: false,

  saving: false,
  deleting: false,

  fetchTopics: async () => {
    set({ topicsLoading: true });
    try {
      const topics = await fetchTopicGroupsForAuthoring();
      set({ topics });
      return topics;
    } finally {
      set({ topicsLoading: false });
    }
  },

  fetchLecture: async (lessonId) => {
    set({ lectureLoading: true });
    try {
      const data = await fetchLectureEditorData(lessonId);
      const lecture = {
        id: data.id,
        title: data.title ?? "",
        topicId: data.topics_id ?? "",
        content: data.lecture?.content ?? "",
        attachments: {
          file: data.lecture?.file_url
            ? { type: "link", name: data.lecture.file_url, value: data.lecture.file_url }
            : null,
          video: data.lecture?.video_src ?? null,
        },
      };
      set({ lecture });
      return lecture;
    } finally {
      set({ lectureLoading: false });
    }
  },

  createLecture: async ({ authorId, title, topicId, content, attachments }) => {
    set({ saving: true });
    try {
      const lesson = await createLessonBase({ topicId, authorId, title, type: "lecture" });
      const fileUrl = await resolveFileUrl(lesson.id, attachments);
      await upsertLectureContent({ lessonId: lesson.id, content, videoSrc: attachments.video, fileUrl });
      return lesson;
    } finally {
      set({ saving: false });
    }
  },

  updateLecture: async ({ lessonId, title, topicId, content, attachments }) => {
    set({ saving: true });
    try {
      const lesson = await updateLessonBase({ lessonId, topicId, title });
      const fileUrl = await resolveFileUrl(lesson.id, attachments);
      await upsertLectureContent({ lessonId: lesson.id, content, videoSrc: attachments.video, fileUrl });
      return lesson;
    } finally {
      set({ saving: false });
    }
  },

  deleteLecture: async (lessonId) => {
    set({ deleting: true });
    try {
      await removeLessonById(lessonId);
    } finally {
      set({ deleting: false });
    }
  },

  resetLecture: () => set({ lecture: emptyLecture }),
}));