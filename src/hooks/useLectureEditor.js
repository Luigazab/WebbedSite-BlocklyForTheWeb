import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useLectureStore } from "@/store/lectureStore";

export const useLectureEditor = (lessonId, { isAdmin = false, classroomId = null } = {}) => {
  const { user } = useAuth();
  const isEditMode = Boolean(lessonId);

  const topics = useLectureStore((s) => s.topics);
  const topicsLoading = useLectureStore((s) => s.topicsLoading);
  const fetchTopics = useLectureStore((s) => s.fetchTopics);

  const lecture = useLectureStore((s) => s.lecture);
  const lectureLoading = useLectureStore((s) => s.lectureLoading);
  const fetchLecture = useLectureStore((s) => s.fetchLecture);
  const resetLecture = useLectureStore((s) => s.resetLecture);

  const saving = useLectureStore((s) => s.saving);
  const deleting = useLectureStore((s) => s.deleting);
  const createLecture = useLectureStore((s) => s.createLecture);
  const updateLecture = useLectureStore((s) => s.updateLecture);
  const deleteLecture = useLectureStore((s) => s.deleteLecture);

  useEffect(() => {
    fetchTopics({ masterOnly: isAdmin, classroomId, lessonId }).catch((error) => toast.error(error.message || "Failed to load topics."));
  }, [fetchTopics, isAdmin, classroomId, lessonId]);

  useEffect(() => {
    if (!isEditMode) {
      resetLecture();
      return;
    }
    fetchLecture(lessonId).catch((error) => toast.error(error.message || "Failed to load lecture."));
  }, [isEditMode, lessonId, fetchLecture, resetLecture]);

  const saveLecture = useCallback(
    async ({ title, topicId, content, attachments, publish = false }) => {
      if (!user?.id) { toast.error("You must be signed in to save a lecture."); return null; }
      if (!title?.trim()) { toast.error("Lecture title is required."); return null; }
      if (!topics.some((group) => group.topics.some((topic) => topic.id === topicId))) { toast.error("Select a topic from the current classroom or master library."); return null; }

      try {
        const savedId = lessonId || useLectureStore.getState().lecture.id;
        const lesson = savedId
          ? await updateLecture({ lessonId: savedId, title, topicId, content, attachments, publish })
          : await createLecture({ authorId: user.id, title, topicId, content, attachments, publish });

        toast.success(isEditMode ? "Lecture updated successfully." : "Lecture saved successfully.");
        return lesson;
      } catch (error) {
        toast.error(error.message || `Failed to ${isEditMode ? "update" : "save"} lecture.`);
        return null;
      }
    },
    [isEditMode, lessonId, user, topics, createLecture, updateLecture]
  );

  const removeLecture = useCallback(async () => {
    if (!lessonId) return false;
    try {
      await deleteLecture(lessonId);
      toast.success("Lecture deleted successfully.");
      return true;
    } catch (error) {
      toast.error(error.message || "Failed to delete lecture.");
      return false;
    }
  }, [lessonId, deleteLecture]);

  return {
    isEditMode,
    topics,
    topicsLoading,
    lecture,
    lectureLoading,
    saving,
    deleting,
    saveLecture,
    removeLecture,
  };
};