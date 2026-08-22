import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useLectureStore } from "@/store/lectureStore";

export const useLectureEditor = (lessonId) => {
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
    fetchTopics().catch((error) => toast.error(error.message || "Failed to load topics."));
  }, [fetchTopics]);

  useEffect(() => {
    if (!isEditMode) {
      resetLecture();
      return;
    }
    fetchLecture(lessonId).catch((error) => toast.error(error.message || "Failed to load lecture."));
  }, [isEditMode, lessonId, fetchLecture, resetLecture]);

  const saveLecture = useCallback(
    async ({ title, topicId, content, attachments }) => {
      if (!user?.id) return toast.error("You must be signed in to save a lecture.");
      if (!title?.trim()) return toast.error("Lecture title is required.");
      if (!topicId) return toast.error("Please select a topic.");

      try {
        const lesson = isEditMode
          ? await updateLecture({ lessonId, title, topicId, content, attachments })
          : await createLecture({ authorId: user.id, title, topicId, content, attachments });

        toast.success(isEditMode ? "Lecture updated successfully." : "Lecture saved successfully.");
        return lesson;
      } catch (error) {
        toast.error(error.message || `Failed to ${isEditMode ? "update" : "save"} lecture.`);
        return null;
      }
    },
    [isEditMode, lessonId, user, createLecture, updateLecture]
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