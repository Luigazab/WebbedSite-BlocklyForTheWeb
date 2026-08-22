import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useQuizStore } from "@/store/quizStore";

export const useQuizEditor = (lessonId) => {
  const { user } = useAuth();
  const store = useQuizStore();

  const isEditMode = Boolean(lessonId);

  useEffect(() => {
    store.fetchTopics().catch((error) =>
      toast.error(error.message || "Failed to load topics.")
    );
  }, [store.fetchTopics]);

  useEffect(() => {
    if (!isEditMode) {
      store.resetQuiz();
      return;
    }

    store.fetchQuiz(lessonId).catch((error) =>
      toast.error(error.message || "Failed to load quiz.")
    );
  }, [isEditMode, lessonId, store.fetchQuiz, store.resetQuiz]);

  const saveQuiz = useCallback(
    async ({
      title,
      topicId,
      timeLimit,
      passingScore,
      questions,
      validationError,
    }) => {
      if (!user?.id) {
        toast.error("You must be signed in to save a quiz.");
        return null;
      }

      if (validationError) {
        toast.error(validationError);
        return null;
      }

      try {
        const lesson = isEditMode
          ? await store.updateQuiz({
              lessonId,
              title,
              topicId,
              timeLimit,
              passingScore,
              questions,
            })
          : await store.createQuiz({
              authorId: user.id,
              title,
              topicId,
              timeLimit,
              passingScore,
              questions,
            });

        toast.success(
          isEditMode
            ? "Quiz updated successfully."
            : "Quiz saved successfully."
        );

        return lesson;
      } catch (error) {
        toast.error(
          error.message ||
            `Failed to ${isEditMode ? "update" : "save"} quiz.`
        );
        return null;
      }
    },
    [isEditMode, lessonId, user, store]
  );

  const removeQuiz = useCallback(async () => {
    if (!lessonId) return false;

    try {
      await store.deleteQuiz(lessonId);
      toast.success("Quiz deleted successfully.");
      return true;
    } catch (error) {
      toast.error(error.message || "Failed to delete quiz.");
      return false;
    }
  }, [lessonId, store]);

  return {
    isEditMode,
    topics: store.topics,
    topicsLoading: store.topicsLoading,
    quiz: store.quiz,
    quizLoading: store.quizLoading,
    saving: store.saving,
    deleting: store.deleting,
    saveQuiz,
    removeQuiz,
  };
};