import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { useLectureViewStore } from "@/store/lectureViewStore";

export const useLectureViewer = (lessonId) => {
  const user = useAuthStore((s) => s.user);

  const lecture     = useLectureViewStore((s) => s.lecture);
  const loading     = useLectureViewStore((s) => s.loading);
  const completing  = useLectureViewStore((s) => s.completing);
  const fetchLecture = useLectureViewStore((s) => s.fetchLecture);
  const markComplete = useLectureViewStore((s) => s.markComplete);
  const resetLecture = useLectureViewStore((s) => s.resetLecture);

  useEffect(() => {
    if (!lessonId) return;
    fetchLecture(lessonId).catch((error) => toast.error(error.message || "Failed to load lecture."));
    return () => resetLecture();
  }, [lessonId, fetchLecture, resetLecture]);

  const finishLecture = useCallback(async () => {
    if (!user?.id) return true; // not signed in — let navigation proceed without recording
    try {
      await markComplete(user.id);
      return true;
    } catch (error) {
      toast.error(error.message || "Failed to save your progress.");
      return false;
    }
  }, [user, markComplete]);

  return { lecture, loading, completing, finishLecture };
};