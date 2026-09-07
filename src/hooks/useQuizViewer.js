import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { useQuizViewStore } from "@/store/quizViewStore";

export const useQuizViewer = (lessonId) => {
  const user = useAuthStore((s) => s.user);

  const lessonQuiz      = useQuizViewStore((s) => s.lessonQuiz);
  const loading         = useQuizViewStore((s) => s.loading);
  const attempts        = useQuizViewStore((s) => s.attempts);
  const attemptsLoading = useQuizViewStore((s) => s.attemptsLoading);
  const submitting      = useQuizViewStore((s) => s.submitting);

  const fetchQuiz     = useQuizViewStore((s) => s.fetchQuiz);
  const fetchAttempts = useQuizViewStore((s) => s.fetchAttempts);
  const submitAttempt = useQuizViewStore((s) => s.submitAttempt);
  const resetQuiz      = useQuizViewStore((s) => s.resetQuiz);

  useEffect(() => {
    if (!lessonId) return;
    fetchQuiz(lessonId).catch((error) => toast.error(error.message || "Failed to load quiz."));
    return () => resetQuiz();
  }, [lessonId, fetchQuiz, resetQuiz]);

  useEffect(() => {
    if (!user?.id || !lessonQuiz?.quiz?.id) return;
    fetchAttempts({ userId: user.id, quizId: lessonQuiz.quiz.id }).catch((error) =>
      toast.error(error.message || "Failed to load your previous attempts.")
    );
  }, [user?.id, lessonQuiz?.quiz?.id, fetchAttempts]);

  const finishAttempt = useCallback(
    async (result) => {
      if (!user?.id || !lessonQuiz) return null;
      try {
        return await submitAttempt({ userId: user.id, result, lessonMeta: lessonQuiz });
      } catch (error) {
        toast.error(error.message || "Failed to save your quiz attempt.");
        return null;
      }
    },
    [user, lessonQuiz, submitAttempt]
  );

  return { lessonQuiz, loading, attempts, attemptsLoading, submitting, finishAttempt };
};